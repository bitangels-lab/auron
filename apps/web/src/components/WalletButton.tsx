"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export function WalletButton() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error, reset } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="rounded bg-auron-accent/50 px-3 py-1.5 text-xs font-medium text-auron-ink"
        disabled
      >
        Connect wallet
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <button
        type="button"
        onClick={() => disconnect()}
        className="rounded border border-auron-line px-3 py-1.5 font-mono text-xs text-auron-mist hover:border-auron-accent hover:text-auron-foam"
        title="Click to disconnect"
      >
        {address.slice(0, 6)}…{address.slice(-4)}
      </button>
    );
  }

  const anvil = connectors.find((c) => c.id === "anvilDev");
  const injected = connectors.find((c) => c.id === "injected");
  const hasEthereum =
    typeof window !== "undefined" &&
    Boolean((window as Window & { ethereum?: unknown }).ethereum);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          reset();
          setOpen((v) => !v);
        }}
        className="rounded bg-auron-accent px-3 py-1.5 text-xs font-medium text-auron-ink hover:brightness-110 disabled:opacity-50"
      >
        {isPending ? "Connecting…" : "Connect wallet"}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded border border-auron-line bg-auron-panel p-2 shadow-lg">
          {anvil && (
            <button
              type="button"
              className="block w-full rounded px-3 py-2 text-left text-sm text-auron-foam hover:bg-auron-ink"
              onClick={() => {
                connect(
                  { connector: anvil },
                  {
                    onSuccess: () => setOpen(false),
                  },
                );
              }}
            >
              Anvil Dev (#0)
              <span className="mt-0.5 block text-xs text-auron-mist">
                No MetaMask needed — local demo
              </span>
            </button>
          )}
          {injected && (
            <button
              type="button"
              className="mt-1 block w-full rounded px-3 py-2 text-left text-sm text-auron-foam hover:bg-auron-ink disabled:opacity-40"
              disabled={!hasEthereum}
              onClick={() => {
                connect(
                  { connector: injected },
                  {
                    onSuccess: () => setOpen(false),
                  },
                );
              }}
            >
              Browser wallet
              <span className="mt-0.5 block text-xs text-auron-mist">
                {hasEthereum ? "MetaMask / injected" : "No extension detected"}
              </span>
            </button>
          )}
          {error && (
            <p className="mt-2 px-2 text-xs text-auron-danger">
              {error.message.slice(0, 160)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
