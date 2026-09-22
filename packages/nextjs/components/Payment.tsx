"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Contract, formatUnits } from "ethers";
import {
  CHECKOUT_ABI,
  hbarDisplay,
  paymentTransaction,
  verifyPaymentReceipt,
  type CheckoutConfig,
  type Invoice,
  type TokenInfo,
  type Quote,
  type PaymentReceipt,
} from "@saucerpay/checkout";
import { api, connectWallet, message, shortAddress } from "@/lib/wallet";

type InvoiceData = {
  config: CheckoutConfig;
  invoice: Invoice;
  token: TokenInfo;
  payment?: PaymentReceipt;
};

export function Payment({ id }: { id: string }) {
  const [data, setData] = useState<InvoiceData | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [slippage, setSlippage] = useState("50");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [now, setNow] = useState(0);
  const [txHash, setTxHash] = useState("");
  const [payment, setPayment] = useState<PaymentReceipt | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const hash = new URLSearchParams(window.location.search).get("tx");
      const endpoint = `/api/invoices/${encodeURIComponent(id)}`;
      const result = await api<InvoiceData>(endpoint);
      setData(result);
      if (hash) {
        setTxHash(hash);
        const verified = await api<InvoiceData>(
          `${endpoint}?tx=${encodeURIComponent(hash)}`,
        );
        if (verified.payment) setPayment(verified.payment);
      }
    } catch (error) {
      setError(message(error));
    }
  }, [id]);
  useEffect(() => {
    void load();
    const timer = setInterval(
      () => setNow(Math.floor(Date.now() / 1000)),
      1000,
    );
    return () => clearInterval(timer);
  }, [load]);

  async function run(action: string, work: () => Promise<void>) {
    setBusy(action);
    setError("");
    setNotice("");
    try {
      await work();
    } catch (error) {
      setError(message(error));
    } finally {
      setBusy("");
    }
  }
  async function refreshQuote() {
    setQuote(null);
    const result = await api<{ quote: Quote }>(
      `/api/quote?invoiceId=${encodeURIComponent(id)}&slippageBps=${slippage}`,
    );
    setQuote(result.quote);
    setNow(Math.floor(Date.now() / 1000));
  }
  async function pay() {
    if (!data || !quote) return;
    const { signer } = await connectWallet(data.config);
    const tx = await signer.sendTransaction(
      paymentTransaction(data.config, quote),
    );
    setTxHash(tx.hash);
    // Persist the hash before waiting so refreshing can reconcile a submitted payment.
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?tx=${tx.hash}`,
    );
    setNotice("Payment submitted. Waiting for its receipt…");
    const receipt = await tx.wait();
    if (!receipt)
      throw new Error(
        "Receipt not available yet. Use Refresh status to reconcile the transaction.",
      );
    const verified = verifyPaymentReceipt(data.config, data.invoice, receipt);
    setPayment(verified);
    setData({ ...data, invoice: { ...data.invoice, status: "paid" } });
    setQuote(null);
    setNotice("Payment confirmed and matched to this invoice.");
  }
  async function cancel() {
    if (!data?.config.checkout) return;
    const { signer, address } = await connectWallet(data.config);
    if (address.toLowerCase() !== data.invoice.merchant.toLowerCase())
      throw new Error("Only the merchant wallet can cancel this invoice.");
    const tx = await new Contract(
      data.config.checkout,
      CHECKOUT_ABI,
      signer,
    ).cancelInvoice(id);
    const receipt = await tx.wait();
    if (!receipt || receipt.status !== 1)
      throw new Error("Cancellation was not confirmed.");
    setData({ ...data, invoice: { ...data.invoice, status: "cancelled" } });
    setQuote(null);
    setNotice("Invoice cancelled.");
  }

  const status =
    data?.invoice.status === "open" && now >= data.invoice.expiresAt
      ? "expired"
      : data?.invoice.status;
  return (
    <div className="payment-page">
      <Link href="/" className="back-link">
        ← Merchant workspace
      </Link>
      <p className="eyebrow">Secure the amount. Simplify the payment.</p>
      <h1>
        {payment ? "Payment received." : "An exact amount.\nPaid your way."}
      </h1>
      <p className="lead">
        Pay in HBAR. The merchant receives the requested tokens through
        SaucerSwap.
      </p>
      <section className="panel payment-card">
        <div className="section-heading">
          <h2>Payment request</h2>
          <span className={`status-pill ${status === "paid" ? "paid" : ""}`}>
            {status || "Loading"}
          </span>
        </div>
        {data && (
          <>
            <div className="invoice-total">
              <span className="small-label">MERCHANT RECEIVES</span>
              <strong>
                {formatUnits(BigInt(data.invoice.amount), data.token.decimals)}{" "}
                <small>{data.token.symbol}</small>
              </strong>
            </div>
            <dl className="payment-details">
              <div>
                <dt>Recipient</dt>
                <dd>
                  <a
                    title={data.invoice.merchant}
                    href={`https://hashscan.io/${data.config.network}/account/${data.invoice.merchant}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {shortAddress(data.invoice.merchant)} ↗
                  </a>
                </dd>
              </div>
              <div>
                <dt>Expires</dt>
                <dd>
                  {new Date(data.invoice.expiresAt * 1000).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt>Network</dt>
                <dd>Hedera {data.config.network}</dd>
              </div>
              <div>
                <dt>Invoice</dt>
                <dd title={id}>{shortAddress(id)}</dd>
              </div>
            </dl>
            {status === "open" && !payment && (
              <>
                <label htmlFor="slippage">Maximum price movement</label>
                <select
                  id="slippage"
                  value={slippage}
                  disabled={!!busy}
                  onChange={(event) => {
                    setSlippage(event.target.value);
                    setQuote(null);
                  }}
                >
                  <option value="10">0.1%</option>
                  <option value="50">0.5%</option>
                  <option value="100">1%</option>
                </select>
                <button
                  className="button secondary full spaced"
                  disabled={!!busy}
                  onClick={() => void run("quote", refreshQuote)}
                >
                  {busy === "quote"
                    ? "Checking invoice and liquidity…"
                    : "Get payment quote"}
                </button>
                {quote && (
                  <div className="payment-quote">
                    <div>
                      <span>Estimated conversion</span>
                      <strong>
                        {hbarDisplay(BigInt(quote.quotedTinybar))} HBAR
                      </strong>
                    </div>
                    <div>
                      <span>Maximum spend</span>
                      <strong>
                        {hbarDisplay(BigInt(quote.maximumTinybar))} HBAR
                      </strong>
                    </div>
                    <p>
                      Network fees are additional. Unused conversion funds
                      return to your wallet.
                    </p>
                    <span className="quote-expiry">
                      {quote.validUntil > now
                        ? `Quote expires in ${quote.validUntil - now}s`
                        : "Quote expired — request a new one."}
                    </span>
                  </div>
                )}
                <button
                  className="button primary full"
                  disabled={
                    !!busy ||
                    !!txHash ||
                    !quote ||
                    quote.validUntil <= now ||
                    data.config.network !== "testnet"
                  }
                  onClick={() => void run("pay", pay)}
                >
                  {busy === "pay"
                    ? "Confirming payment…"
                    : txHash
                      ? "Refresh the submitted payment status"
                      : "Connect wallet & pay"}{" "}
                  <span>→</span>
                </button>
              </>
            )}
            {payment && (
              <div className="payment-confirmed">
                <span className="check-circle">✓</span>
                <h2>Settled and verified</h2>
                <p>
                  {hbarDisplay(BigInt(payment.spentTinybar))} HBAR converted
                  <br />
                  {hbarDisplay(BigInt(payment.refundedTinybar))} HBAR returned
                </p>
                <a
                  href={`https://hashscan.io/${data.config.network}/transaction/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View transaction on HashScan ↗
                </a>
              </div>
            )}
            <div className="payment-actions">
              <button
                className="text-button"
                onClick={() =>
                  void run("copy", async () => {
                    await navigator.clipboard.writeText(window.location.href);
                    setNotice("Payment link copied.");
                  })
                }
              >
                Copy payment link
              </button>
              <button
                className="text-button"
                disabled={!!busy}
                onClick={() => void load()}
              >
                Refresh status
              </button>
              {status === "open" && (
                <button
                  className="text-button"
                  disabled={!!busy}
                  onClick={() => void run("cancel", cancel)}
                >
                  Cancel as merchant
                </button>
              )}
            </div>
          </>
        )}
        {error && (
          <div className="alert error" role="alert">
            {error}
            {!data && (
              <button className="text-button" onClick={() => void load()}>
                Retry
              </button>
            )}
          </div>
        )}
        {notice && (
          <div className="alert success" role="status">
            {notice}
          </div>
        )}
        {txHash && !payment && (
          <p className="muted">
            Submitted transaction:{" "}
            <a
              href={`https://hashscan.io/testnet/transaction/${txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {shortAddress(txHash)} ↗
            </a>
            . Refresh status before retrying payment.
          </p>
        )}
      </section>
      <p className="payment-footnote">
        Invoice terms and settlement are enforced by the checkout contract.
        <br />
        This reference application signs on Hedera testnet only.
      </p>
    </div>
  );
}
