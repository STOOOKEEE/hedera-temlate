# SaucerPay

**A Scaffold-HBAR template for exact-amount HTS invoices paid in HBAR through SaucerSwap.**

Build a checkout, marketplace purchase flow or invoice portal without reimplementing quotes, Hedera units, token association checks, exact settlement, refunds and receipt verification. The included invoice workspace is a reference consumer of the reusable `@saucerpay/checkout` package.

## Try the live demo

**[Open SaucerPay on Vercel](https://temporary-express-mesa-bvkp923.vercel.app)** — no installation, account or private key required to explore real SaucerSwap quotes.

The demo is claimed by the repository owner on Vercel. It provides live testnet/mainnet quotes and the integration guide. Creating and paying invoices still requires a funded testnet wallet and a deployed checkout contract.

**Status:** local contract/domain tests and live quote integration are implemented. No SaucerPay testnet deployment or payment evidence is bundled yet. See [validation results](docs/VALIDATION.md). Signing requires your own funded testnet account and deployment. The demo never substitutes a simulated price for a failed live quote.

![SaucerPay invoice workspace with a real read-only quote and deployment setup state](docs/workspace.png)

## Build your own app in one command

Use **Node.js 22+**, npm and Git with a configured author identity:

```bash
npx create-scaffold-hbar@latest --template STOOOKEEE/hedera-temlate
```

Choose a project name. This template supports Next.js, Hardhat and npm. Then:

```bash
cd your-project
npm run dev
```

Open http://localhost:3000. Read a real SaucerSwap quote without connecting a wallet or setting any secrets. The default token is testnet SAUCE; the mainnet quote selector is read-only.

Alternatively:

```bash
git clone https://github.com/STOOOKEEE/hedera-temlate.git
cd hedera-temlate
npm ci
npm run dev
```

To host your own public instance, see [Deploy the web app to Vercel](docs/HOSTING.md).

## The reusable capability

An invoice fixes a merchant, token amount and expiry on-chain. A payer requests an exact-output quote, chooses a maximum HBAR spend and calls `payInvoice`. SaucerSwap converts HBAR using its existing liquidity and sends tokens directly to the merchant. SaucerPay checks the actual token balance increase, returns surplus HBAR, and emits one invoice-bound receipt. If any of these steps fails, payment state and transfers revert together.

Removing SaucerSwap removes the conversion capability. Writing a standalone invoice contract cannot reproduce the liquidity provided by the protocol. The template adds the payment-specific integration around that capability rather than another general swap screen.

The first version deliberately supports **HBAR → one configured fee-free fungible HTS token through a direct SaucerSwap V1 pool**. SAUCE is a convenient example token, **not a stablecoin or a USD-denominated invoice**. A different settlement asset needs a usable direct pool and validated token permissions.

## Enable testnet payments

1. Obtain a funded **ECDSA secp256k1** Hedera testnet account. ED25519 keys cannot sign EVM transactions through this setup.
2. Copy `packages/hardhat/.env.example` to `packages/hardhat/.env`. Set `HEDERA_PRIVATE_KEY` locally.
3. Run `npm run hardhat:deploy`. This checks a real quote and deploys the checkout contract on chain 296.
4. Copy `packages/nextjs/.env.example` to `packages/nextjs/.env.local`, and set `HEDERA_CHECKOUT_ADDRESS` to the printed address. Restart the app.
5. Connect the merchant EVM wallet, associate the configured token, and create an invoice. Open its payment link using a funded payer wallet and settle it.

See [the complete deployment guide](docs/DEPLOYMENT.md) for funding, wallet setup, transaction evidence and an optional automated testnet payment.

## Repository layout

| Package / file                             | Responsibility                                                                                                                         |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/checkout/src/index.ts`           | Network configuration, amount parsing, live quotes, association/deployment preflight, payment transaction builder and receipt verifier |
| `packages/hardhat/contracts/SaucerPay.sol` | Immutable invoice terms, exact delivery, cancellation, atomic refund and double-payment prevention                                     |
| `packages/hardhat/scripts/`                | Testnet deployment and an optional payment smoke script                                                                                |
| `packages/nextjs/`                         | Invoice workspace, shareable payment page and live quote API                                                                           |
| `template.json`                            | Actual Scaffold-HBAR capabilities and defaults                                                                                         |
| `AGENTS.md`                                | Architecture and constraints for coding agents                                                                                         |
| `IMPLEMENTATION_PLAN.md`                   | Product rationale, scope and execution plan                                                                                            |

## Integrate into your own screen

```ts
import {
  quotePayment,
  paymentTransaction,
  verifyPaymentReceipt,
} from "@saucerpay/checkout";

// Server: read immutable invoice terms and current pool liquidity.
const quote = await quotePayment(config, {
  invoiceId: order.invoiceId,
  slippageBps: 50,
});

// Client: use a wallet connected to Hedera testnet.
const tx = await signer.sendTransaction(paymentTransaction(config, quote));
const receipt = await tx.wait();
if (!receipt) throw new Error("Receipt pending");
const payment = verifyPaymentReceipt(config, quote.invoice!, receipt);
```

`config` comes from `networkConfig('testnet', deployedCheckoutAddress)`. For fulfillment, fetch the receipt independently on your server before verification. Never trust a browser's assertion that payment succeeded. [Customization example and fulfillment boundaries](docs/CUSTOMIZATION.md).

## Commands

| Command                   | Effect                                                                       |
| ------------------------- | ---------------------------------------------------------------------------- |
| `npm run dev`             | Development UI                                                               |
| `npm run lint`            | ESLint and TypeScript checks                                                 |
| `npm test`                | Checkout package tests and contract invariant tests                          |
| `npm run build`           | Pinned Solidity compilation and production Next.js build                     |
| `npm start`               | Serve the production build                                                   |
| `npm run smoke`           | Check boot routes and the invalid-network API response on localhost:3000     |
| `npm run probe`           | Read live testnet and mainnet quotes; does not submit a transaction          |
| `npm run hardhat:deploy`  | Deploy using your funded testnet signer                                      |
| `npm run testnet:payment` | Create and pay one testnet invoice; uses testnet HBAR, saves actual evidence |

## Configuration

The frontend starts without an env file. All configuration below is server-side; **no private key belongs in the frontend**.

| Variable                  | Location                     | Default / meaning                                                  |
| ------------------------- | ---------------------------- | ------------------------------------------------------------------ |
| `HEDERA_NETWORK`          | `packages/nextjs/.env.local` | `testnet`; `mainnet` exposes read-only quotes                      |
| `HEDERA_TOKEN_ID`         | Both package env files       | Testnet `0.0.1183558`; mainnet `0.0.731861`                        |
| `HEDERA_CHECKOUT_ADDRESS` | Frontend env                 | EVM address printed by deployment; unset disables invoice creation |
| `HEDERA_PRIVATE_KEY`      | `packages/hardhat/.env` only | Your funded testnet ECDSA key                                      |
| `HEDERA_RPC_URL`          | Hardhat env                  | `https://testnet.hashio.io/api`; endpoint must return chain 296    |
| `MAX_TESTNET_HBAR`        | Hardhat env                  | `1`; optional payment script's conversion cap, excluding gas       |
| `SMOKE_ORIGIN`            | Process environment          | Alternate URL for boot smoke checks                                |

## Boundaries

- No custody backend, automatic retries of signed payments, routes through bridges or recurring billing.
- The reference wallet integration requires an injected EVM wallet, such as MetaMask. It does not include HashPack/WalletConnect onboarding.
- The contract is unaudited. Local mocks model contract invariants, not HTS precompiles or live SaucerSwap behavior.
- Token association, liquidity and policy checks may change between quote and execution. On-chain exact-output and balance checks remain decisive.
- Quotes expire after at most 60 seconds. Network fees are additional to the conversion spend cap.
- Session invoice history is deliberately local to the open page. Save payment links. A production order database/indexer is an extension described in the customization guide.
- A real testnet transaction remains necessary for the bounty. Read-only quotes and mock tests are not that evidence.

## References and license

MIT. Original checkout implementation, built against public interfaces:

- [Scaffold-HBAR template authoring](https://docs.hedera.com/solutions/tools/scaffold-hbar/index)
- [SaucerSwap V1 exact-output HBAR swaps](https://docs.saucerswap.finance/developers/v1/swap/swap-hbar-for-tokens)
- [Canonical SaucerSwap deployments](https://docs.saucerswap.finance/developers/contracts)
- [Hedera EVM transaction units](https://docs.hedera.com/hedera/sdks-and-apis/sdks/smart-contracts/ethereum-transaction)
- [Bounty brief](https://hedera.com/blog/scaffold-hbar-template-bounty/)
