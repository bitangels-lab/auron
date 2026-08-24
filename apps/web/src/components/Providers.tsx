"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected } from "@wagmi/core";
import { WagmiProvider, createConfig, http } from "wagmi";
import { anvil } from "viem/chains";
import { useState, type ReactNode } from "react";
import { anvilDevWallet } from "@/lib/anvilDevWallet";
import { contracts } from "@/lib/contracts";

const chain = { ...anvil, id: contracts.chainId };

const config = createConfig({
  chains: [chain],
  connectors: [
    anvilDevWallet(contracts.rpcUrl),
    injected({ shimDisconnect: true }),
  ],
  transports: {
    [chain.id]: http(contracts.rpcUrl),
  },
  ssr: true,
});

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config} reconnectOnMount>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
