# SaucerPay agent guide

This repository is a reusable Scaffold-HBAR checkout template with a reference invoice UI. Read README.md, IMPLEMENTATION_PLAN.md and docs/ARCHITECTURE.md before modifying the payment flow.

## Workspaces

- `packages/checkout`: shared TypeScript domain and network integration. Amounts are bigint internally and decimal strings over JSON.
- `packages/hardhat`: Solidity 0.8.28, Hardhat 2 and ethers 6. The pinned npm solc is used for reproducible compilation. Local mock units model Hedera tinybar numerically.
- `packages/nextjs`: Next.js App Router and an injected EVM wallet. Server config controls network and deployment. No server signer.

## Payment invariants

- Preserve immutable router, settlement token and WHBAR. Do not accept arbitrary router calldata from a payer.
- Merchant and token amount come from the on-chain invoice, never query-string payment parameters.
- `msg.value` and ABI HBAR amounts are tinybar on Hedera. RPC transaction value is tinybar multiplied by 10^10. Do not use `parseEther` on a token amount or multiply ABI arguments by the RPC conversion factor.
- A successful payment must produce the exact merchant token balance delta. State and transfers must revert if conversion, delivery or refund fails.
- Only a matching `InvoicePaid` event emitted by the configured checkout in a successful receipt is a payment proof. A tx hash, wallet notification or an unrelated token transfer is insufficient.
- Verify configuration against the deployed immutables before constructing transactions. Keep mainnet signing disabled in the reference flow.
- Never replace a failed network quote with sample values. Live quote probes are not testnet transaction evidence.
- Keep keys out of logs and frontend env files. Only Hardhat reads `packages/hardhat/.env`.

## Checks

Run `npm run lint`, `npm test` and `npm run build`. Start the app and run `npm run smoke`. For integration changes run `npm run probe`; distinguish endpoint availability from transaction execution. Testnet writes require a configured funded testnet account and are explicitly labeled by the commands.

Changes to money handling, receipt validation or contract state transitions need meaningful regression coverage. An ordinary Hardhat fork does not reproduce HTS precompiles; do not present mocked tests as proof of a live Hedera payment.

The CLI supports this template through the `create-scaffold-hbar` block in `template.json`. It consumes/removes that file in the generated app. Check the source manifest and the scaffolded result separately. Do not rename workspace packages during scaffolding: internal npm links use their stable names.

## Extending the template

Replace the reference screens freely while keeping domain rules in `@saucerpay/checkout`. Add integrations only when they provide a necessary capability. HCS receipt duplication, generalized workflow engines, arbitrary token routing and production fulfillment services are outside this template's initial scope.

When reporting readiness, consult docs/VALIDATION.md and deployments/ if present. Do not invent a deployment address, receipt or passing check.
