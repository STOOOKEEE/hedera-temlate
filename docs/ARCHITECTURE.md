# Payment architecture

```mermaid
sequenceDiagram
    participant M as Merchant wallet
    participant C as SaucerPay contract
    participant P as Payer wallet
    participant A as Quote API
    participant S as SaucerSwap V1
    M->>C: createInvoice(reference, token amount, expiry)
    P->>A: Quote invoice ID
    A->>C: Verify deployment and immutable invoice terms
    A->>S: getAmountsIn(amount, [WHBAR, token])
    A-->>P: Quote + rounded maximum tinybar + deadline
    P->>C: payInvoice(id, deadline), payable HBAR
    C->>S: swapETHForExactTokens(amount, path, merchant, deadline)
    S-->>M: Exact settlement token amount
    S-->>C: Unused HBAR
    C->>C: Verify actual merchant token balance delta
    C-->>P: Unused HBAR
    C-->>P: InvoicePaid event
```

## Source of truth

The contract stores invoices. References are random bytes32 in the demo; IDs are `keccak256(abi.encode(merchant, reference))`. Merchant namespaces prevent another account reserving someone else's reference. Creating the same invoice reference twice for one merchant is rejected, including after cancellation or payment.

The token, router and WHBAR token address are immutable for a deployment. An invoice fixes merchant, output amount and expiry. Only the merchant can cancel. Only open, unexpired invoices can be paid. The payment deadline must also be within the invoice lifetime.

Invoice status is set before external calls and protected by a reentrancy guard. Any swap, balance-check or refund failure reverts the transaction, including that state update. There is no background worker that must reconcile a partially completed swap and transfer.

## Amount units

| Boundary                                                           | Unit                                              |
| ------------------------------------------------------------------ | ------------------------------------------------- |
| Invoice output and ERC20-compatible HTS methods                    | Token smallest unit, determined by token decimals |
| SaucerSwap `getAmountsIn()[0]`                                     | Tinybar (8 decimal places per HBAR)               |
| Hedera EVM `msg.value`, `address.balance`, Solidity internal sends | Tinybar                                           |
| Ethereum JSON-RPC transaction `value`                              | Weibars / RPC wei (18 decimal places per HBAR)    |

`tinybarToRpcWei` performs the **single** conversion at the wallet boundary: multiply by 10^10. `maximumSpend` rounds upward with integer arithmetic. ABI values remain in their actual native units. See the official [Hedera transaction unit documentation](https://docs.hedera.com/hedera/sdks-and-apis/sdks/smart-contracts/ethereum-transaction).

## Integration choices

SaucerSwap V1 RouterV3 provides an exact-output HBAR method with automatic surplus refund. The path is exactly `[WHBAR HTS token, settlement token]`. The WHBAR wrapper contract and the WHBAR HTS token are different addresses: path construction uses the token.

The application reads a current quote from the real router and checks the settlement token's metadata. For invoice payment it also checks the deployed immutable configuration, invoice state and merchant's token relationship through the mirror node. It does not assert that a successful quote guarantees successful execution: balances, association policy and liquidity can change.

The contract receives no settlement tokens: the router delivers directly to the merchant. This avoids requiring the checkout contract to associate every output asset. Before/after balance checks enforce exact receipt and reject under-delivery, including ordinary transfer-fee effects. The UI rejects tokens declaring custom fees before quoting.

## Proof and recovery

After submission the payment page stores the transaction hash in the URL before waiting for a receipt. Refreshing reads the on-chain invoice and verifies the receipt independently through the server's RPC endpoint. Verification checks successful status, destination, event emitter, invoice ID, merchant and output amount. It never interprets a bare transaction hash as success.

If a receipt is not available, keep the transaction hash and refresh; do not blindly resubmit. If a transaction is confirmed reverted, its invoice remains open and the `tx` query parameter can be removed to request a new quote. Off-chain fulfillment needs an idempotent server-side order update keyed by chain ID, checkout address and invoice ID; see CUSTOMIZATION.md.

## Deliberate limitations

No fee-on-transfer assets, route optimization, order indexing service, account abstraction or mainnet signing. No HTS emulation is claimed for Hardhat unit tests. A production merchant should review token admin controls and deployment code; this starter is not audited.
