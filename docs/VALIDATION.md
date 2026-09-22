# Validation record

## Scope

This file distinguishes local checks, real protocol reads and actual transactions. Passing the first two does not imply a live payment succeeded.

## Local checks

Validated on Node.js 22.23.2 and npm 10.9.8:

| Check                                                       | Result                                                                                                                                 |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| ESLint + both TypeScript packages                           | Pass                                                                                                                                   |
| Shared checkout tests                                       | 8 passing                                                                                                                              |
| Solidity payment invariant tests                            | 11 passing                                                                                                                             |
| Production Solidity + Next.js build                         | Pass                                                                                                                                   |
| Production route smoke                                      | Pass: `/`, `/guide`, `/pay/<id>`, invalid-network API error                                                                            |
| GitHub Actions source CI                                    | [Pass](https://github.com/STOOOKEEE/hedera-temlate/actions/runs/35672872909)                                                           |
| Actual public external-template generation                  | Pass with `create-scaffold-hbar@0.4.0`                                                                                                 |
| Fresh generated app install/lint/19 tests/build/start/smoke | Pass                                                                                                                                   |
| Browser checks (Chromium)                                   | Pass: live testnet and mainnet quotes, disabled creation before deployment, guide navigation, undeployed-invoice error, no page errors |
| Responsive check                                            | 1440px desktop and 390px mobile; no horizontal mobile overflow                                                                         |
| Missing deployment key                                      | Clear failure before any transaction is submitted                                                                                      |

The external-template validation downloaded `STOOOKEEE/hedera-temlate` from GitHub at implementation commit `51f9e4b`, installed dependencies through the published CLI and ran checks in `/tmp/saucerpay-fresh`. No local-template override was used. The CLI consumes `template.json`; that is expected behavior. Git author identity was supplied only for the isolated validation process.

The upstream CLI rewrites some npm prose during generation. The README and app guide use the equivalent `npx create-scaffold-hbar@latest --template STOOOKEEE/hedera-temlate` entry point so their install commands remain valid in generated projects. The standard npm-create entry point was the one exercised during validation.

Contract tests cover exact delivery, surplus refund, duplicate settlement, duplicate merchant references, merchant namespaces, cancellation authorization, expiry, maximum spend, under-delivery, withheld refunds, refund rejection and reentrancy. These use mock tokens/router and do not emulate HTS precompiles.

TypeScript tests cover integer rounding, decimal precision, tinybar/RPC-wei conversion, stale/mismatched quotes, mainnet write rejection, entity IDs, event emitter/terms verification, live-call construction and explicit network/unsupported-token failure.

## Live read-only probe

Observed 2026-09-22, using real `getAmountsIn` calls with one SAUCE as the requested output:

| Network | Router ID   | Token ID    | Observed required HBAR |
| ------- | ----------- | ----------- | ---------------------- |
| Testnet | 0.0.19264   | 0.0.1183558 | 0.01819518             |
| Mainnet | 0.0.3045981 | 0.0.731861  | 0.16795432             |

These are historical diagnostic observations, not prices promised by the app. Run `npm run probe` for a new observation. No transaction was submitted by these reads.

## Public Vercel demo

Published on 2026-09-22 at
https://temporary-express-mesa-bvkp923.vercel.app using Vercel CLI 59.25.0.
Vercel reported deployment `dpl_7iBBcrpFhNJQLM7Rzmod85butvho` as `READY`.
The owner confirmed claiming this deployment in their Vercel account on
2026-09-22. The public URL returned HTTP 200 after that confirmation. Account
ownership was reported by the owner, not independently checked through an
authenticated Vercel API. The private claim URL is excluded from this repo.

Verified against the public HTTPS origin:

- Page smoke: homepage, guide, invoice route and invalid-network error passed.
- Live quote API returned real testnet and mainnet quotes for 25 SAUCE.
- Chromium completed both quote flows and guide navigation without page errors.
- Mobile viewport at 390px had no horizontal overflow.
- Invoice writes stayed disabled while no checkout contract was configured.
- The packaged frontend built successfully with Vercel's Next.js adapter.

Source lint, all 19 tests and the monorepo production build also passed after
adding the hosting preparation script. Hosting setup is documented in HOSTING.md.

## Testnet writes: pending user setup

The user has no configured funded testnet account yet and requested deployment preparation/instructions. Therefore:

- No SaucerPay testnet contract deployment is claimed.
- No invoice creation, token association or live payment is claimed.
- No fabricated address, transaction hash or mock receipt is supplied as bounty evidence.
- `npm run hardhat:deploy` and `npm run testnet:payment` are prepared; follow DEPLOYMENT.md after funding an ECDSA testnet account.

**The bounty's verifiable-testnet-transaction requirement remains incomplete.**
