"use client";

import { isDeployed, contracts } from "@/lib/contracts";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

export function ChainBanner() {
  const deployed = isDeployed();
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  if (!deployed) {
    return (
      <div className="mb-6 rounded border border-auron-warn/40 bg-auron-warn/10 px-4 py-3 text-sm text-auron-foam">
        Contracts not deployed. In two terminals:{" "}
        <code className="font-mono text-auron-accent">npm run chain</code> then{" "}
        <code className="font-mono text-auron-accent">npm run deploy:local</code>, then restart{" "}
        <code className="font-mono text-auron-accent">npm run dev</code>.
      </div>
    );
  }

  if (isConnected && chainId !== contracts.chainId) {
    return (
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded border border-auron-danger/40 bg-auron-danger/10 px-4 py-3 text-sm">
        <span>Wrong network (need chain {contracts.chainId} / Anvil).</span>
        <button
          type="button"
          className="rounded bg-auron-accent px-3 py-1 text-xs font-medium text-auron-ink"
          onClick={() => switchChain?.({ chainId: contracts.chainId })}
        >
          Switch network
        </button>
      </div>
    );
  }

  return null;
}
