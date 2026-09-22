import { BrowserProvider, type Eip1193Provider } from "ethers";
import type { CheckoutConfig } from "@saucerpay/checkout";

export async function connectWallet(config: CheckoutConfig) {
  if (config.network !== "testnet")
    throw new Error("The reference app supports testnet signing only.");
  const ethereum = (window as unknown as { ethereum?: Eip1193Provider })
    .ethereum;
  if (!ethereum)
    throw new Error(
      "Open this page with an EVM wallet such as MetaMask to sign on Hedera testnet.",
    );
  const chainId = "0x128";
  const current = await ethereum.request({ method: "eth_chainId" });
  if (current !== chainId) {
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });
    } catch (error) {
      if ((error as { code?: number }).code !== 4902) throw error;
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId,
            chainName: "Hedera Testnet",
            rpcUrls: [config.rpcUrl],
            nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 18 },
            blockExplorerUrls: ["https://hashscan.io/testnet"],
          },
        ],
      });
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });
    }
  }
  await ethereum.request({ method: "eth_requestAccounts" });
  const provider = new BrowserProvider(ethereum);
  if ((await provider.getNetwork()).chainId !== 296n)
    throw new Error("Switch your wallet to Hedera testnet.");
  const signer = await provider.getSigner();
  return { provider, signer, address: await signer.getAddress() };
}

export async function api<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(60_000),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Request failed.");
  return body as T;
}

export function message(error: unknown): string {
  const value = error as {
    code?: string | number;
    shortMessage?: string;
    message?: string;
  };
  if (value.code === "ACTION_REJECTED" || value.code === 4001)
    return "Wallet request cancelled.";
  return (
    value.shortMessage ||
    value.message ||
    "The operation could not be completed."
  );
}
export const shortAddress = (value: string) =>
  `${value.slice(0, 6)}…${value.slice(-4)}`;
