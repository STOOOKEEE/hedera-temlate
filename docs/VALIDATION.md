# Validation record

## Scope

This file distinguishes local checks, real protocol reads and actual transactions. Passing the first two does not imply a live payment succeeded.

## Local checks

Initial implementation passed 11 Solidity contract tests and 8 TypeScript tests. Production Next.js build passed. Final lint/build/clean-scaffold results will be recorded after the repository delivery check.

Contract tests cover exact delivery, surplus refund, duplicate settlement, duplicate merchant references, merchant namespaces, cancellation authorization, expiry, maximum spend, under-delivery, withheld refunds, refund rejection and reentrancy. These use mock tokens/router and do not emulate HTS precompiles.

TypeScript tests cover integer rounding, decimal precision, tinybar/RPC-wei conversion, stale/mismatched quotes, mainnet write rejection, entity IDs, event emitter/terms verification, live-call construction and explicit network/unsupported-token failure.

## Live read-only probe

Observed 2026-09-22, using real `getAmountsIn` calls with one SAUCE as the requested output:

| Network | Router ID   | Token ID    | Observed required HBAR |
| ------- | ----------- | ----------- | ---------------------- |
| Testnet | 0.0.19264   | 0.0.1183558 | 0.01819518             |
| Mainnet | 0.0.3045981 | 0.0.731861  | 0.16795432             |

These are historical diagnostic observations, not prices promised by the app. Run `npm run probe` for a new observation. No transaction was submitted by these reads.

## Testnet writes: pending user setup

The user has no configured funded testnet account yet and requested deployment preparation/instructions. Therefore:

- No SaucerPay testnet contract deployment is claimed.
- No invoice creation, token association or live payment is claimed.
- No fabricated address, transaction hash or mock receipt is supplied as bounty evidence.
- `npm run hardhat:deploy` and `npm run testnet:payment` are prepared; follow DEPLOYMENT.md after funding an ECDSA testnet account.

**The bounty's verifiable-testnet-transaction requirement remains incomplete.**
