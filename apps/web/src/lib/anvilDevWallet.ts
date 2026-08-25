import { createConnector } from "wagmi";
import {
  type Address,
  type Chain,
  createWalletClient,
  custom,
  http,
  numberToHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

/** Anvil default Account #0 — local POC only, never use on mainnet. */
export const ANVIL_ACCOUNT_0_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" as const;

const STORAGE_KEY = "auron.connector.anvilDev";

type ProviderRequest = {
  method: string;
  params?: unknown[] | Record<string, unknown>;
};

/**
 * In-browser Anvil burner wallet so Connect works without MetaMask.
 * Signs and sends real txs against the local RPC.
 */
export function anvilDevWallet(rpcUrl: string) {
  const account = privateKeyToAccount(ANVIL_ACCOUNT_0_KEY);

  return createConnector((config) => {
    let chain = config.chains[0] as Chain;

    const provider = {
      request: async ({ method, params = [] }: ProviderRequest) => {
        const list = Array.isArray(params) ? params : [];

        switch (method) {
          case "eth_requestAccounts":
          case "eth_accounts":
            return [account.address] satisfies Address[];
          case "eth_chainId":
            return numberToHex(chain.id);
          case "net_version":
            return String(chain.id);
          case "wallet_switchEthereumChain": {
            const requested = list[0] as { chainId?: string } | undefined;
            if (requested?.chainId) {
              const id = Number.parseInt(requested.chainId, 16);
              const next = config.chains.find((c) => c.id === id);
              if (next) chain = next;
            }
            return null;
          }
          case "eth_sendTransaction": {
            const tx = list[0] as {
              to?: Address;
              data?: `0x${string}`;
              value?: `0x${string}`;
              gas?: `0x${string}`;
            };
            const wallet = createWalletClient({
              account,
              chain,
              transport: http(rpcUrl),
            });
            return wallet.sendTransaction({
              to: tx.to,
              data: tx.data,
              value: tx.value ? BigInt(tx.value) : undefined,
              gas: tx.gas ? BigInt(tx.gas) : undefined,
              chain,
            });
          }
          case "personal_sign": {
            const [data] = list as [`0x${string}`, Address];
            return account.signMessage({ message: { raw: data } });
          }
          case "eth_signTypedData_v4": {
            const [, typedData] = list as [Address, string | object];
            const parsed = typeof typedData === "string" ? JSON.parse(typedData) : typedData;
            return account.signTypedData(parsed as never);
          }
          default: {
            const res = await fetch(rpcUrl, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                jsonrpc: "2.0",
                id: Date.now(),
                method,
                params: list,
              }),
            });
            const json = (await res.json()) as {
              result?: unknown;
              error?: { message?: string };
            };
            if (json.error) throw new Error(json.error.message ?? method);
            return json.result;
          }
        }
      },
      on() {},
      removeListener() {},
    };

    return {
      id: "anvilDev",
      name: "Anvil Dev (#0)",
      type: "anvilDev",
      async setup() {},
      async connect({ withCapabilities }: { withCapabilities?: boolean } = {}) {
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(STORAGE_KEY, "1");
        }
        config.emitter.emit("message", { type: "connecting" });
        const accounts = [account.address];
        return {
          accounts: (withCapabilities
            ? accounts.map((address) => ({ address, capabilities: {} }))
            : accounts) as never,
          chainId: chain.id,
        };
      },
      async disconnect() {
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem(STORAGE_KEY);
        }
      },
      async getAccounts() {
        return [account.address];
      },
      async getChainId() {
        return chain.id;
      },
      async isAuthorized() {
        if (typeof window === "undefined") return false;
        return window.sessionStorage.getItem(STORAGE_KEY) === "1";
      },
      async getProvider() {
        return provider;
      },
      async getClient() {
        return createWalletClient({
          account,
          chain,
          transport: custom(provider),
        });
      },
      onAccountsChanged() {},
      onChainChanged(id) {
        const next = config.chains.find((c) => c.id === Number(id));
        if (next) chain = next;
      },
      onDisconnect() {},
    };
  });
}
