# Submission package

[README](../README.md) · [Reviewer walkthrough](REVIEW.md) · [Validation](VALIDATION.md)

**Status:** source and live quote demonstrations are available. A successful SaucerPay testnet payment is still required before the chain-evidence section can be completed. This document is a prepared submission draft, not an entry that has been sent to the organizers.

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
- Testnet payment: **pending; insert only the actual verified HashScan/mirror link**
- Demo recording: **not recorded yet; follow the script below**

Do not use a deployment address, quote screenshot or unrelated transaction as proof of a completed payment. The actual receipt must match this template's contract and invoice.

## Demo script (about two minutes)

1. **0:00–0:20 — Problem.** Open the workspace. Explain: “My service requests USDC; my customer holds HBAR. This starter integrates conversion into an exact-amount payment.” Point out that the merchant testnet flow and mainnet USDC preview are explicitly separate.
2. **0:20–0:45 — Real integration.** Request a 25 USDC mainnet quote. Show quoted HBAR, maximum spend and token/network provenance. Change the amount; the old quote disappears. Explain that a pool failure produces an error, not a fabricated price.
3. **0:45–1:05 — Reuse.** Open `/examples`, select service invoice and prepaid API credits. Show that both use `QuotePreview` and that fulfillment remains the application's responsibility.
4. **1:05–1:40 — Testnet payment, when evidence exists.** Use a real merchant-created testnet invoice and payer wallet. Show verified exact receipt, surplus return, refresh recovery and downloadable JSON. Until this is executed, explicitly state it is pending; do not simulate a successful payment in the recording.
5. **1:40–2:00 — Developer handoff.** Show the one-command scaffold, customization recipe, tests and `npm run submission:check`. Explain that quote context is bound to network/token/contract, and the preflight verifies payment evidence against RPC and mirror data.

## Produce and verify the missing evidence

Follow [Deployment](DEPLOYMENT.md). Either use the one-account live smoke or the two-wallet UI flow:

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

Before submitting, run the full fresh-scaffold checks in [Getting started](GETTING_STARTED.md), add only public verified transaction metadata to [Validation](VALIDATION.md), and complete the official form and developer-experience survey. No registration, submission or external outreach is automated here. This project has not used Hedera Harness.

## Honest claim boundaries

- A quoted mainnet USDC conversion is not a validated USDC payment.
- Mocked local contract tests validate invariants, not HTS precompiles or actual protocol execution.
- Successful payment does not prove product delivery or credit allocation.
- Known related projects support the plausibility of the use cases, not adoption of this template.
- A strong submission can improve competitiveness; no score, ranking or reward is guaranteed.
