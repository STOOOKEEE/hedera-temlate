import { hbarDisplay, networkConfig, quotePayment } from "../src/index";

// Run from the repository root:
// npx tsx packages/checkout/examples/quote.ts
// This is a read-only call. No wallet, deployment or credentials are needed.
const config = networkConfig("testnet");
const quote = await quotePayment(config, {
  amount: "1",
  slippageBps: 50, // 0.5%; a spend limit, not a fee charged by this app.
});

console.log(
  JSON.stringify(
    {
      network: config.network,
      tokenId: config.tokenId,
      receive: `1 ${quote.token.symbol}`,
      quotedHbar: hbarDisplay(BigInt(quote.quotedTinybar)),
      maximumHbar: hbarDisplay(BigInt(quote.maximumTinybar)),
      validUntil: new Date(quote.validUntil * 1000).toISOString(),
      note: "Read-only quote; network fees are additional. No payment submitted.",
    },
    null,
    2,
  ),
);
