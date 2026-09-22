# Deploy and produce testnet evidence

[README](../README.md) · Before this: [first run](GETTING_STARTED.md) · [Troubleshooting](TROUBLESHOOTING.md)

**Outcome:** deploy your checkout, receive a token payment from HBAR, and retain genuine transaction evidence. The commands are prepared, but no successful SaucerPay testnet deployment/payment is currently published in this repository. Follow the checkpoints below; do not treat example placeholders as deployed addresses.

You do not need a key to install, lint, test, build, start the app or read live quotes. You need a funded **Hedera testnet ECDSA secp256k1 account** to deploy and sign payments.

| Role     | Needs                                                            | Signs                                                          |
| -------- | ---------------------------------------------------------------- | -------------------------------------------------------------- |
| Deployer | Funded testnet ECDSA key in Hardhat's local env                  | Contract deployment                                            |
| Merchant | Funded injected testnet EVM wallet, settlement-token association | Association if needed, invoice creation, optional cancellation |
| Payer    | Funded injected testnet EVM wallet                               | Invoice payment (HBAR conversion plus network fees)            |

The deployer does not have to be the merchant. One account can perform all roles for the automated smoke; separate wallets demonstrate the actual buyer/seller flow. The payer needs no SAUCE balance for an HBAR-input payment.

## 1. Create and fund a testnet account

Use the [Hedera Portal](https://portal.hedera.com/) and its [faucet](https://portal.hedera.com/faucet). Select/create an ECDSA account suitable for EVM transactions, and obtain testnet HBAR. Keep the account ID, EVM address and private key locally. If your existing account only has an ED25519 key, create a suitable ECDSA testnet account for this template.

The Hardhat key format is a 32-byte secp256k1 private key with a `0x` prefix (64 hexadecimal digits after it). Hedera SDK DER-encoded keys are not interchangeable with that format. Use the portal/wallet's raw EVM key export or the official SDK conversion for your key type; do not truncate a key by guessing.

The merchant and payer both need testnet HBAR for transaction fees. The payer also needs enough HBAR to cover the displayed maximum conversion amount. Start with a small invoice. SAUCE in the example is a token amount, not a US dollar amount.

## 2. Configure the deployment signer

From the repository root:

```bash
cp packages/hardhat/.env.example packages/hardhat/.env
```

Edit the new ignored `.env` locally:

```dotenv
HEDERA_PRIVATE_KEY=<your-funded-testnet-ECDSA-key>
HEDERA_RPC_URL=https://testnet.hashio.io/api
HEDERA_TOKEN_ID=0.0.1183558
MAX_TESTNET_HBAR=1
```

Do not put that key in the Next.js package, a `NEXT_PUBLIC_` variable, a README or a commit. The repo ignores real env files; the example files contain no credentials.

## 3. Check and deploy

```bash
npm ci
npm run lint
npm test
npm run build
npm run probe
npm run hardhat:deploy
```

`probe` reads current quotes on both networks without sending any transaction. Deployment verifies chain ID 296, settlement-token metadata and a real direct-pool quote before submitting a constructor transaction. It deliberately does not expose a mainnet deployment command.

The deployment script prints:

```text
HEDERA_CHECKOUT_ADDRESS=<actual-deployed-EVM-address>
```

It writes actual transaction metadata to `deployments/testnet.json` (ignored by Git). A quote or an intended address is never written as deployment evidence. The deployment receipt proves contract creation, not a completed payment.

**Checkpoint:** the command exits successfully, the evidence file contains the actual address/hash, and its public HashScan link shows a successful deployment. If it fails, resolve the error before configuring the frontend with an address.

## 4. Connect the app

```bash
cp packages/nextjs/.env.example packages/nextjs/.env.local
```

Set the actual deployed address:

```dotenv
HEDERA_NETWORK=testnet
HEDERA_TOKEN_ID=0.0.1183558
HEDERA_CHECKOUT_ADDRESS=<actual-deployed-EVM-address>
```

Run/restart `npm run dev`. Environment changes require restarting the Next.js process.

For your hosted Vercel copy, set the same three server variables in project settings and redeploy. Never add the Hardhat key to Vercel. See [web hosting](HOSTING.md).

Use an injected EVM wallet such as MetaMask with a funded testnet ECDSA account. The Connect button requests Hedera testnet (chain 296 / `0x128`) and offers the canonical testnet RPC if the wallet does not know it. For a realistic demo, use separate merchant and payer wallets or browser profiles.

**Checkpoint:** `/api/config` returns your checkout address and the intended token. The quote-panel network selector is only a preview selector; it does not change the deployed contract.

## 5. Merchant and payer flow

1. Connect the merchant wallet. Click **Associate the settlement token**. Association is a Hedera token operation signed by that account, not an ERC20 spending approval.
2. Allow mirror-node indexing to catch up. Create a small invoice, such as `1 SAUCE`. The merchant signs invoice creation.
3. Open the payment page and copy its URL. Record this link: the workspace's list only lasts for the current session.
4. Open it using the payer wallet. Request a quote, review maximum HBAR spend plus additional network fees, then pay.
5. The payment page verifies the actual receipt against invoice ID, merchant, amount and emitting checkout contract.
6. Reload the URL containing `?tx=<actual-hash>`. The server retrieves and verifies the receipt again. Save the HashScan/mirror link for the bounty. **Download verified receipt** exports public payment JSON; `npm run submission:check -- /path/to/receipt.json` independently rechecks it against the network.

**Checkpoint:** the invoice shows paid, the receipt matches the configured contract/invoice/merchant/amount, and the merchant's token balance increased by the invoice amount. A payment screenshot or a wallet notification alone is insufficient. Save the payment link before closing the workspace; its invoice list is not a persistent history.

If a payment transaction was submitted but receipt retrieval timed out, refresh status before retrying. If HashScan confirms it reverted and the invoice remains open, remove the `tx` parameter from the URL and request a fresh quote. Contract replay protection rejects an already-paid invoice.

## 6. Optional automated payment smoke

After deployment, this command uses the configured testnet signer as **both merchant and payer**, associates the output token if necessary, creates a one-token invoice, pays it and verifies exact delivery:

```bash
npm run testnet:payment
```

The script enforces `MAX_TESTNET_HBAR` before submitting association or invoice transactions. The cap covers conversion only, not network fees. It writes actual evidence to `deployments/payment-evidence.json`: creation hash, payment hash, amount received, HBAR spent/refunded, and explorer links.

This is a live testnet integration check. It is separate from `npm test`, which uses local mocks. A one-account smoke does not replace checking the two-wallet UI flow.

## Common blockers

| Symptom                        | Check                                                                                                                               |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Deployment key missing         | The key belongs in `packages/hardhat/.env`, not the root or frontend env                                                            |
| Invalid private key            | Use an ECDSA secp256k1 raw EVM key; ED25519 or SDK DER strings do not work directly                                                 |
| No quote / RPC failure         | Endpoint health, current router IDs, configured token and actual direct-pool liquidity                                              |
| Association required           | Associate using the merchant wallet, then allow mirror indexing to catch up                                                         |
| KYC/freeze restriction         | Merchant token relationship and token admin policies                                                                                |
| Deployment mismatch            | Same checkout address, token ID and network in all configuration                                                                    |
| Price moved / payment reverted | Obtain a new quote; do not remove the spend limit                                                                                   |
| Refund rejected                | The payer must be able to receive native HBAR; contract wallets with reverting receive handlers are unsupported for surplus refunds |
| Receipt not indexed            | Keep the transaction hash and retry receipt retrieval; do not assume a failed HTTP request means payment failed                     |

For API codes, wallet issues and the complete recovery sequence, use [Troubleshooting](TROUBLESHOOTING.md).

## Submission evidence

Once you have an actual successful payment, copy **only public transaction metadata** from the ignored evidence files into your submission. Update `docs/VALIDATION.md` with what actually ran. Include the public repository link, genuine testnet HashScan/mirror link, and the additional submission fields required by the official bounty.

This project does not use Hedera Harness, so it does not claim to supply a harness spec or harness validators. Its own tests and checks are ordinary repository validation.
