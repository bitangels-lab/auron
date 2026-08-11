"use client";

import Link from "next/link";
import { formatUsd } from "@auron/sdk";
import { useProtocolPosition } from "@/hooks/useProtocolPosition";
import { ChainBanner } from "@/components/ChainBanner";

export function DashboardClient() {
  const p = useProtocolPosition();

  const rwaUsd = p.walletAurwaUsd + p.collateralUsd;
  const stable = p.walletAusUsdBal;
  const borrowed = p.debtUsd;
  const total = rwaUsd + stable;

  const rows = [
    { label: "RWA (wallet + collateral)", value: formatUsd(rwaUsd) },
    { label: "Collateral posted", value: formatUsd(p.collateralUsd) },
    { label: "Stablecoins (wallet)", value: formatUsd(stable) },
    { label: "Borrowed", value: formatUsd(borrowed) },
  ];

  return (
    <div className="space-y-10">
      <ChainBanner />

      {!p.isConnected && (
        <p className="text-sm text-auron-mist">
          Connect a wallet on Anvil to load live balances. Import an Anvil account into MetaMask
          (Account #0 private key is in Foundry docs).
        </p>
      )}

      <section>
        <p className="text-sm uppercase tracking-[0.2em] text-auron-mist">Total portfolio</p>
        <p className="mt-2 font-display text-5xl text-auron-foam">
          {p.isConnected ? formatUsd(total) : "—"}
        </p>
        <p className="mt-3 text-sm text-auron-mist">
          Health factor{" "}
          <span className="font-mono text-auron-accent animate-pulse-soft">
            {p.isConnected ? p.healthFactorLabel : "—"}
          </span>
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((row) => (
          <div key={row.label} className="border-t border-auron-line pt-4">
            <p className="text-sm text-auron-mist">{row.label}</p>
            <p className="mt-1 font-display text-2xl">{p.isConnected ? row.value : "—"}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/borrow"
          className="rounded bg-auron-accent px-4 py-2 text-sm font-medium text-auron-ink"
        >
          Deposit & borrow
        </Link>
        <Link
          href="/position"
          className="rounded border border-auron-line px-4 py-2 text-sm text-auron-foam hover:border-auron-accent"
        >
          View position
        </Link>
      </section>
    </div>
  );
}
