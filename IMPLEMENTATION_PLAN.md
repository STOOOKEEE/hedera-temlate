# SaucerPay implementation plan

## Product decision

Build a Scaffold-HBAR external template for **exact-amount HTS checkout paid in HBAR**, using SaucerSwap V1 liquidity. The invoice UI is a reference integration; reusable quote, preflight, transaction and receipt modules are the deliverable. This targets developers building checkout, marketplace purchases and invoice settlement, not every Hedera application.

The official bounty explicitly seeks templates for individual real use cases. Its existing templates include bridges, oracles, subscriptions and x402. A universal framework would duplicate Scaffold-HBAR itself.

## Why the ecosystem integration matters

Without SaucerSwap there is no conversion from the payer's HBAR to the merchant's requested HTS asset. The protocol supplies existing liquidity. Our contribution is the complete payment boundary: immutable invoice terms, an exact-output quote, bounded spend, atomic settlement, receiver balance verification, surplus refunds, replay protection and receipt reconciliation.

A swap UI alone is insufficient. The acceptance test is that another developer can replace the invoice screen with a purchase button without rewriting these mechanisms.

## Scope

- Next.js App Router frontend, Hardhat contracts and a TypeScript checkout workspace.
- One integration: the current SaucerSwap V1 RouterV3, with documented mainnet/testnet IDs. V1 has a smaller exact-output interface and refunds surplus automatically.
- HBAR input, one configured fungible HTS settlement token, direct WHBAR/token route. No routing optimizer, bridges, recurring payments or arbitrary tokens.
- Merchant creates on-chain invoices and associates the settlement token with their own account. Payer obtains an exact-output quote and a maximum spend, then settles in one transaction.
- Contract sends output directly to the merchant, checks the balance increase, marks settlement once, and returns router refunds to the payer. Failed swaps revert invoice state.
- No backend signer or custodial service. Wallet transactions on testnet; mainnet integration is read-only in the reference UI.
- Network failure is an explicit error, never substituted with a simulated live quote.

## Execution sequence and acceptance criteria

1. **Template and domain**: valid `template.json`, npm workspaces, explicit tinybar/RPC-wei conversions, configuration and input validation. Tests cover rounding and bounds.
2. **Contracts**: immutable router/token/WHBAR, invoice creation/cancellation/payment, event receipts, reentrancy and refund handling. Tests cover double payment, expiry, unauthorized cancellation, failed conversion, incorrect delivery and refund failure.
3. **Integration and UI**: live quote/preflight API, injected EVM wallet, merchant invoice creation, association, shareable payment page and verified receipt. Build/start work without secrets; writes require a deployed testnet checkout contract.
4. **Developer handoff**: README, architecture, customization example, deployment script, `AGENTS.md`, MIT, CI, smoke checks and clean-scaffold validation using the actual published CLI.
5. **Testnet evidence**: deploy with a locally configured funded testnet key, exercise the payment path when liquidity permits, record actual transaction hashes and mirror/HashScan links. Do not claim this is complete without executing it.
6. **Repository delivery**: commit and push the implemented template to `STOOOKEEE/hedera-temlate`; repeat fresh scaffold/install/lint/test/build/start checks against the public repository.

## Constraints and honest limits

- Bounty readiness requires a real testnet transaction. None is assumed at planning time.
- Existing deployments and usable pool liquidity must be probed separately; an address in documentation is not proof a trade succeeds.
- Exact delivery is checked by token balance delta. Tokens with transfer fees, freeze/KYC restrictions or unusual callbacks are outside the supported configuration.
- Local mocks test contract invariants; they do not prove Hedera precompile, wallet or SaucerSwap compatibility.
- The template is not audited. Mainnet signing is excluded from the demo.
- A contract transaction recorded in HCS would add no required payment capability here, so HCS is omitted.

## References checked 2026-09-22

- https://hedera.com/blog/scaffold-hbar-template-bounty/
- https://docs.hedera.com/solutions/tools/scaffold-hbar/index
- https://github.com/hedera-dev/create-scaffold-hbar (manifest parsing and external-template pipeline)
- https://docs.saucerswap.finance/developers/v1/swap/swap-hbar-for-tokens
- https://docs.saucerswap.finance/developers/contracts

## Execution record

Implementation steps 1–4 are complete: shared checkout package, tested contract, invoice UI, live quotes, deployment scripts, documentation and CI. Local lint, 19 tests and the production build pass. Steps 5–6 are tracked in `docs/VALIDATION.md`; testnet writes await the funded account requested by the user, and clean-scaffold delivery verification is in progress.
