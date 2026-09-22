import {
  assertDeployment,
  readInvoice,
  readToken,
  rpc,
  verifyPaymentReceipt,
  CheckoutError,
} from "@saucerpay/checkout";
import { getConfig, errorResponse } from "@/lib/server";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const config = getConfig();
    await assertDeployment(config);
    const { id } = await context.params;
    const [invoice, token] = await Promise.all([
      readInvoice(config, id),
      readToken(config),
    ]);
    const hash = new URL(request.url).searchParams.get("tx");
    let payment;
    if (hash) {
      if (!/^0x[0-9a-fA-F]{64}$/.test(hash))
        throw new CheckoutError("INVALID_RECEIPT", "Invalid transaction hash.");
      const receipt = (await rpc(config, "eth_getTransactionReceipt", [
        hash,
      ])) as {
        status: string;
        to: string;
        logs: { address: string; topics: string[]; data: string }[];
      } | null;
      if (!receipt)
        throw new CheckoutError(
          "PENDING_RECEIPT",
          "Receipt is not indexed yet. Refresh shortly.",
        );
      payment = verifyPaymentReceipt(config, invoice, {
        ...receipt,
        status: Number(receipt.status),
      });
    }
    return Response.json({
      config,
      invoice,
      token,
      ...(payment ? { payment } : {}),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
