# Where this template fits

[README](../README.md) · [Adapt the payment flow](CUSTOMIZATION.md)

**Developer problem:** the product is priced in one HTS asset, but the buyer holds HBAR. A plain payment link cannot perform the conversion. A standalone swap does not bind that conversion to an order's recipient, amount, expiry and receipt.

SaucerPay combines those steps through SaucerSwap's existing liquidity. This is useful when the asset mismatch actually exists. It adds unnecessary complexity if a direct transfer already meets both parties' needs.

## 1. Service invoices and payment links

**Observed pattern:** Hedera recognized HashFast, a payment-link project with wallet payments and receipt tracking. Outside Hedera, xMoney offers invoices payable in crypto with settlement in the business's preferred currency. Its published Spinach customer testimonial describes invoicing in USD while customers pay in crypto. These sources show the pattern exists; they do not establish demand for SaucerPay specifically.

Sources: [HashFast in Hedera's winners announcement](https://hedera.com/blog/these-are-the-winners-of-the-hello-future-origins-hackathon/), [xMoney Invoices](https://www.xmoney.com/products/invoices).

**Proposed adaptation:** a service portal requests 100 USDC; the customer pays HBAR and the merchant receives exactly 100 USDC or settlement reverts. The portal developer reuses invoice terms, live conversion, bounded spend and receipt verification, then adds their customer records and accounting integration.

**Current boundary:** the working example is SAUCE. It is not a compliant accounting/invoicing product or a bank payout service. USDC needs an appropriate token configuration and pool plus a validated payment. No HashFast or xMoney integration, endorsement or customer relationship is claimed.

## 2. Prepaid API or compute credits

**Observed need:** Novalax's author explicitly describes payment/monetization difficulties encountered while building an earlier agent marketplace. Novalax then offers USDC payments for data and digital services. Hedera also recognized Pinout, a metered-session project with top-ups and unused-credit refunds.

Sources: [Novalax's README](https://github.com/VinGitonga/novalax-app), [Hedera x402 winners](https://hedera.com/blog/x402-bounty-on-hedera-winners-announced/).

**Proposed adaptation:** a user buys 20 USDC of service credits using HBAR. The service independently verifies the receipt and credits the correct account once. SaucerPay handles the conversion/payment; the service implements the credit ledger, authentication and usage metering.

**Current boundary:** this is a prepaid top-up integration, not an x402 facilitator or drop-in x402 payment scheme. Returning unused HBAR from a swap is different from refunding unused service credits. Those service refunds are not implemented here. These named projects are evidence of related developer work, not confirmed adopters.

## Choosing a settlement token

The template supports one active fungible HTS token without custom transfer fees per deployment, with a usable direct WHBAR/token pool. The merchant must be associated and allowed to receive it. A token symbol alone does not prove any of these conditions.

A read-only mainnet quote for 25 native USDC was observed during research on 2026-09-22 using token `0.0.456858`. The attempted testnet quote using `0.0.429274` failed with a contract-call error. This does not by itself diagnose a missing pool, and it is not a successful USDC payment. [Circle's official USDC token identifiers](https://developers.circle.com/stablecoins/usdc-contract-addresses).

Keep SAUCE as the reproducible example until an alternative is validated. Document new token/pool checks and real transaction evidence before promoting another settlement asset as supported end to end.

## What we deliberately do not promise

- Automatic NFT delivery: payment succeeds independently of minting unless an integration adds atomic delivery.
- Subscription collection: there is no recurring mandate or scheduler.
- An all-token checkout: no route optimizer, arbitrary input tokens or bridges.
- A merchant refund system: cancellation is for open invoices; completed payments are not reversed.

The strongest reusable deliverable is the payment component plus a clear integration recipe. A prospective adopter should be able to identify both the payment code they can keep and the product-specific code they still need to write.
