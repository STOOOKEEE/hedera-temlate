# Reviewer walkthrough

[README](../README.md) · [Validation record](VALIDATION.md) · [Official bounty brief](https://hedera.com/blog/scaffold-hbar-template-bounty/)

This is a navigation guide to the implementation and evidence, not a claim that the submission has passed the eligibility gate. **A genuine SaucerPay testnet transaction is still pending.**

## 1. Try the integration without setup

Open [the live demo](https://temporary-express-mesa-bvkp923.vercel.app), enter `1` in the quote panel and request testnet and mainnet quotes. They read SaucerSwap; no fabricated price is substituted for a failed request. Invoice creation is disabled until a checkout contract is configured.

## 2. Generate and run a clean copy

Follow [Getting started](GETTING_STARTED.md) from an empty parent folder. The supported generator entry point is:

```bash
npx create-scaffold-hbar@latest --template STOOOKEEE/hedera-temlate
```

Then run lint, tests, build, start and smoke as documented. See [VALIDATION.md](VALIDATION.md) for the exact earlier source revision that was exercised through the public generator; an earlier pass is not a claim that every later commit was freshly scaffolded.

## 3. Inspect what is reusable

| Rubric area                | Inspect                                                                                                                                                | Question answered                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Ecosystem integration / 35 | [Use cases](USE_CASES.md), [contract](../packages/hardhat/contracts/SaucerPay.sol), [quote module](../packages/checkout/src/index.ts)                  | Why does this require existing protocol liquidity, and what payment behavior does the template add? |
| Documentation / 30         | [First run](GETTING_STARTED.md), [deployment](DEPLOYMENT.md), [architecture](ARCHITECTURE.md), [reference](REFERENCE.md), [agent guide](../AGENTS.md)  | Can a new developer run, understand and adapt the example without private context?                  |
| Code / 20                  | [Contract tests](../packages/hardhat/test/checkout.cjs), [domain tests](../packages/checkout/test/checkout.test.ts), [CI](../.github/workflows/ci.yml) | Are delivery, refund, replay and receipt boundaries checked?                                        |
| Hedera depth / 15          | [Units and association](ARCHITECTURE.md), [deployment scripts](../packages/hardhat/scripts)                                                            | Does the integration account for HTS relationships and Hedera EVM amount semantics?                 |

The exact-output conversion and surplus return are implemented in a single payment transaction. Token association and merchant invoice creation happen separately. The [customization recipe](CUSTOMIZATION.md) identifies what remains application-specific.

## 4. Check chain evidence honestly

[Deploy on testnet](DEPLOYMENT.md), then exercise the two-wallet UI flow or optional smoke. Only actual successful receipts generate deployment/payment evidence files. The automated smoke uses one account as both merchant and payer and is labeled accordingly.

Before final submission, publish the genuine testnet HashScan or mirror-node link, network, contract, token, invoice and observed result in the validation record. Contract deployment proves deployment; a successful invoice payment demonstrates the whole integration more strongly. A quote, screenshot or local mock cannot stand in for either transaction.

Also complete the official submission fields, including the developer-experience survey. This repository did not use Hedera Harness and does not claim a harness specification or harness validators. Consult the current brief for the final submission requirements.
