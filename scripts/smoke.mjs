import assert from "node:assert/strict";
const origin = process.env.SMOKE_ORIGIN || "http://localhost:3000";
for (const route of ["/", "/guide", "/pay/0x" + "ab".repeat(32)]) {
  const response = await fetch(origin + route);
  assert.equal(
    response.status,
    200,
    `${route} should boot without credentials`,
  );
  assert.match(await response.text(), /saucerpay/i);
  console.log(`OK ${route}`);
}
const invalid = await fetch(origin + "/api/quote?network=invalid");
assert.equal(invalid.status, 400);
assert.equal((await invalid.json()).code, "INVALID_NETWORK");
console.log("OK invalid-network error contract");
