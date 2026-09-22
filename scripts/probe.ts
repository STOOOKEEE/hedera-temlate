import {
  networkConfig,
  quotePayment,
  hbarDisplay,
} from "../packages/checkout/src/index";

const results = await Promise.allSettled(
  (["testnet", "mainnet"] as const).map(async (network) => {
    const config = networkConfig(network);
    const quote = await quotePayment(config, { amount: "1", slippageBps: 50 });
    return {
      network,
      router: config.router,
      tokenId: config.tokenId,
      amount: "1",
      symbol: quote.token.symbol,
      hbar: hbarDisplay(BigInt(quote.quotedTinybar)),
      maximumHbar: hbarDisplay(BigInt(quote.maximumTinybar)),
      observedAt: new Date().toISOString(),
      kind: "read-only; no transaction submitted",
    };
  }),
);
results.forEach((result, i) =>
  console.log(
    JSON.stringify(
      result.status === "fulfilled"
        ? result.value
        : {
            network: i === 0 ? "testnet" : "mainnet",
            error: result.reason.message,
          },
    ),
  ),
);
if (results.every((result) => result.status === "rejected"))
  process.exitCode = 1;
