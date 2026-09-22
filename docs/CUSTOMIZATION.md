# From invoices to a purchase button

The UI is an example. Keep `packages/checkout` and `SaucerPay.sol`, replace `packages/nextjs/components/Workspace.tsx` with your product, booking or marketplace screen.

## Create a merchant order

1. Choose a merchant-controlled wallet and an order reference. Hash a non-sensitive unique order identifier to bytes32, or use 32 random bytes. Do not publish personal customer data on-chain.
2. The merchant signs `createInvoice(reference, amountInTokenUnits, expiresAt)`. Record the ID computed by `invoiceId(merchantAddress, reference)` alongside your order.
3. Return `/pay/<id>` to the buyer. The payment page reads amount and recipient from the contract. Do not put a recipient override or mutable price in the payment link.

Merchant creation is an on-chain transaction. This template does not provide unattended server-side invoice signing. That is a separate custody/authorization decision for a production service.

## A custom payer UI

Use `quotePayment` from your server, then `paymentTransaction` with an EVM signer on the client. The server quote endpoint accepts `invoiceId` and `slippageBps`. The quote includes the on-chain invoice, a spend cap and a short deadline. Display the maximum HBAR spend and additional network fee distinction before the user signs.

If you change amount, invoice, network or slippage selection, discard the old quote. Do not multiply output token units by the Hedera RPC conversion factor. The shared transaction builder already handles native value conversion.

## Fulfillment example

An app server should independently obtain the receipt from its configured Hedera RPC endpoint and the invoice from its configured checkout contract. Feed those trusted reads to `verifyPaymentReceipt`; do not accept a browser-supplied receipt as authoritative.

```ts
// Pseudocode around the real shared verifier. Supply your own database/client.
const invoice = await readInvoice(config, order.invoiceId);
const receipt = await provider.getTransactionReceipt(submittedHash);
if (!receipt) return { status: "pending" };
const payment = verifyPaymentReceipt(config, invoice, receipt);

// Unique constraint: (chainId, checkoutAddress, invoiceId).
// In the same database transaction, mark paid and enqueue fulfillment once.
await orders.recordVerifiedPaymentOnce({
  orderId: order.id,
  chainId: config.chainId,
  checkoutAddress: config.checkout,
  invoiceId: payment.id,
  transactionHash: receipt.hash,
});
```

An event proves payment to the recorded merchant; it does not prove that the merchant shipped an item or that the payer is a particular logged-in customer. Those are application concerns.

## Change settlement asset

Set matching `HEDERA_TOKEN_ID` values in the two package env files and deploy a new checkout. The token must be an active fungible HTS asset without custom transfer fees, and the direct WHBAR pool must have sufficient liquidity. The receiving merchant must satisfy association and token policy requirements. The server compares router/WHBAR/token immutables against configuration before allowing an invoice payment.

Existing invoices stay bound to their original deployment and token. Keep old deployment URLs available if you change configuration. The reference app intentionally serves one deployment at a time; production multi-merchant support should make the deployment identity explicit in saved order records and routes.

## Production extensions to consider when needed

- Index `InvoiceCreated`, `InvoicePaid` and `InvoiceCancelled` for an account history.
- Add your database-backed product catalog and immutable order mapping.
- Implement webhook delivery with idempotency and retries, separately from wallet payment retries.
- Add mobile or WalletConnect adapters while retaining the chain and receipt checks.
- Add another vetted payment adapter only with tests covering its units, route, delivery and refund semantics.
