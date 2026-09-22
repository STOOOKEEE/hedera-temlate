const { ethers } = require("hardhat");
const { readFile, writeFile } = require("node:fs/promises");
const path = require("node:path");

async function main() {
  const [signer] = await ethers.getSigners();
  if (!signer || (await ethers.provider.getNetwork()).chainId !== 296n)
    throw new Error("Configure a funded testnet ECDSA key first.");
  const directory = path.join(__dirname, "../../../deployments");
  const deployment = JSON.parse(
    await readFile(path.join(directory, "testnet.json"), "utf8"),
  );
  if (deployment.chainId !== 296)
    throw new Error("Expected testnet deployment evidence.");
  const checkout = await ethers.getContractAt(
    "SaucerPay",
    deployment.checkout,
    signer,
  );
  const [routerAddress, tokenAddress, whbar] = await Promise.all([
    checkout.router(),
    checkout.token(),
    checkout.whbar(),
  ]);
  if (
    routerAddress !== deployment.router ||
    tokenAddress !== deployment.token ||
    whbar !== deployment.whbar
  )
    throw new Error("Deployment configuration mismatch.");
  const token = new ethers.Contract(
    tokenAddress,
    [
      "function associate() returns (int64)",
      "function decimals() view returns (uint8)",
      "function balanceOf(address) view returns (uint256)",
    ],
    signer,
  );
  const router = new ethers.Contract(
    routerAddress,
    ["function getAmountsIn(uint256,address[]) view returns (uint256[])"],
    signer,
  );
  const amount = ethers.parseUnits("1", Number(await token.decimals()));
  const quoted = (await router.getAmountsIn(amount, [whbar, tokenAddress]))[0];
  const maximumTinybar = (quoted * 10050n + 9999n) / 10000n;
  const cap = ethers.parseUnits(process.env.MAX_TESTNET_HBAR || "1", 8);
  if (maximumTinybar > cap)
    throw new Error(
      "Quote exceeds MAX_TESTNET_HBAR; no transactions submitted.",
    );
  const association = await token.associate.staticCall();
  if (association === 22n) await (await token.associate()).wait();
  else if (association !== 194n)
    throw new Error(`Token association refused: ${association}`);
  const invoiceReference = ethers.hexlify(ethers.randomBytes(32));
  const expires = Math.floor(Date.now() / 1000) + 600;
  const creation = await (
    await checkout.createInvoice(invoiceReference, amount, expires)
  ).wait();
  const id = await checkout.invoiceId(signer.address, invoiceReference);
  const before = await token.balanceOf(signer.address);
  const receipt = await (
    await checkout.payInvoice(id, Math.floor(Date.now() / 1000) + 60, {
      value: maximumTinybar * 10000000000n,
    })
  ).wait();
  if (
    !receipt ||
    receipt.status !== 1 ||
    (await token.balanceOf(signer.address)) - before !== amount
  )
    throw new Error("Exact payment validation failed.");
  const event = receipt.logs
    .filter(
      (log) => log.address.toLowerCase() === deployment.checkout.toLowerCase(),
    )
    .map((log) => {
      try {
        return checkout.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((log) => log?.name === "InvoicePaid" && log.args.id === id);
  if (!event) throw new Error("Matching payment event is missing.");
  const evidence = {
    network: "testnet",
    checkout: deployment.checkout,
    invoiceId: id,
    merchantAndPayer: signer.address,
    tokenId: deployment.tokenId,
    amountOut: amount.toString(),
    spentTinybar: event.args.spentTinybar.toString(),
    refundedTinybar: event.args.refundedTinybar.toString(),
    creationHash: creation.hash,
    paymentHash: receipt.hash,
    hashscan: `https://hashscan.io/testnet/transaction/${receipt.hash}`,
    mirror: `https://testnet.mirrornode.hedera.com/api/v1/contracts/results/${receipt.hash}`,
    timestamp: new Date().toISOString(),
    note: "This smoke run uses one account as both merchant and payer. Test the two-wallet UI flow separately.",
  };
  await writeFile(
    path.join(directory, "payment-evidence.json"),
    JSON.stringify(evidence, null, 2) + "\n",
  );
  console.log(JSON.stringify(evidence, null, 2));
}
main().catch((error) => {
  console.error(error.shortMessage || error.message);
  process.exitCode = 1;
});
