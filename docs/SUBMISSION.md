# Submission package

[README](../README.md) · [Reviewer walkthrough](REVIEW.md) · [Validation](VALIDATION.md)

**Status:** source, live quote demo, testnet deployment and a real two-wallet payment are available. `npm run submission:check` verifies the payment against Hedera RPC and mirror data. This is a prepared submission draft, not an entry that has been sent to the organizers.

## Short description

SaucerPay is a Scaffold-HBAR template for token-denominated checkout funded with HBAR. It combines SaucerSwap's existing liquidity with immutable invoice terms, exact merchant delivery, bounded input spend, atomic surplus return and independently verifiable receipts. Developers can reuse the shared package and quote component in payment links, service checkout or prepaid-credit applications.

## Why the integration matters

The buyer holds HBAR; the merchant requests a fixed amount of another token. SaucerSwap supplies the liquidity and exact-output swap. The template binds that swap to an invoice and verifies actual delivery and refund before accepting payment. Without the protocol integration, this HBAR-funded token settlement capability disappears.

The reference checkout uses testnet SAUCE. The USDC preview reads actual mainnet liquidity and demonstrates the commercial asset-mismatch use case without enabling mainnet signing. Service and credit examples share a reusable quote component; they do not claim to provide an order database, x402 facilitator or credit ledger.

## Links to provide

- Source: https://github.com/STOOOKEEE/hedera-temlate
- Hosted demo: https://saucerpay-hedera.vercel.app
- Developer docs: [README navigation](../README.md#find-the-right-guide)
- Architecture: [payment flow and units](ARCHITECTURE.md)
- Contract deployment: [HashScan](https://hashscan.io/testnet/transaction/0xf810bf564aab4a305b30af5ddff6f95ed87aa8776a439a256f7c846cbb50c136)
- Two-wallet testnet payment: [HashScan](https://hashscan.io/testnet/transaction/0xd9d3d092b020d8d0e05825f7636f1be6085d3e935a18d2286d4a5448f42a85d1) · [mirror result](https://testnet.mirrornode.hedera.com/api/v1/contracts/results/0xd9d3d092b020d8d0e05825f7636f1be6085d3e935a18d2286d4a5448f42a85d1)
- [Paid invoice on the hosted app](https://saucerpay-hedera.vercel.app/pay/0x8f97d7a7c61394e9f927e2b0d9d7b62fc396d091cfffc0475ab3b13493b58e61?tx=0xd9d3d092b020d8d0e05825f7636f1be6085d3e935a18d2286d4a5448f42a85d1)
- Browser-exported receipt: the hosted page's **Download verified receipt** action was exercised, and the downloaded JSON passed `npm run submission:check -- /path/to/downloaded.json`.
- Demo recording: **not recorded yet; follow the script below**

Do not use a deployment address, quote screenshot or unrelated transaction as proof of a completed payment. The actual receipt must match this template's contract and invoice.

## Demo script (about two minutes)

1. **0:00–0:20 — Problem.** Open the workspace. Explain: “My service requests a token; my customer holds HBAR. This starter converts the payment to the exact amount the merchant requested.” State that the live testnet payment uses SAUCE and the mainnet USDC preview is read-only.
2. **0:20–0:45 — Real integration.** Request a 25 USDC mainnet quote. Show quoted HBAR, maximum spend and token/network provenance. Change the amount; the old quote disappears. Explain that a pool failure produces an error, not a fabricated price.
3. **0:45–1:05 — Reuse.** Open `/examples`, select service invoice and prepaid API credits. Show that both use `QuotePreview` and that fulfillment remains the application's responsibility.
4. **1:05–1:40 — Testnet payment.** Open the [real paid invoice](https://saucerpay-hedera.vercel.app/pay/0x8f97d7a7c61394e9f927e2b0d9d7b62fc396d091cfffc0475ab3b13493b58e61?tx=0xd9d3d092b020d8d0e05825f7636f1be6085d3e935a18d2286d4a5448f42a85d1) and HashScan result. Show separate merchant/payer addresses, exactly 1 SAUCE delivered, spent HBAR and the surplus refund. Say the payment was submitted by the two-account testnet script; the injected-wallet UI signing path remains to be tested.
5. **1:40–2:00 — Developer handoff.** Show the one-command scaffold, customization recipe, tests and `npm run submission:check`. Explain that quote context is bound to network/token/contract, and the preflight verifies payment evidence against RPC and mirror data.

## Reproduce and verify chain evidence

Follow [Deployment](DEPLOYMENT.md). The optional `HEDERA_PAYER_PRIVATE_KEY` allows the script to use a separately funded payer; otherwise it uses one account for both roles:

```bash
npm run hardhat:deploy
npm run testnet:payment
npm run submission:check
```

The commands above need the funded testnet ECDSA configuration. The payment smoke writes an actual receipt record to the ignored `deployments/payment-evidence.json`. Alternatively, download a verified receipt from the payment page, then run:

```bash
npm run submission:check -- /path/to/saucerpay-receipt.json
```

The preflight checks source metadata, tracked env-file names, configured contract immutables, invoice state, the successful matching payment event, the recorded amount and mirror-node success. Missing or unverifiable evidence results in a nonzero exit code. It does not replace a full secret scan, fresh-build tests, an audit or the organizer's eligibility validator.

A fresh public scaffold has passed the checks in [Validation](VALIDATION.md#fresh-public-scaffold--2026-09-22); rerun them if the implementation changes. Before submitting, record the demo and complete the official form and developer-experience survey. The public chain metadata is in [Validation](VALIDATION.md). No registration, submission or external outreach is automated here. This project has not used Hedera Harness.

## Honest claim boundaries

- A quoted mainnet USDC conversion is not a validated USDC payment.
- Mocked local contract tests validate invariants, not HTS precompiles or actual protocol execution.
- Successful payment does not prove product delivery or credit allocation.
- Known related projects support the plausibility of the use cases, not adoption of this template.
- A strong submission can improve competitiveness; no score, ranking or reward is guaranteed.
