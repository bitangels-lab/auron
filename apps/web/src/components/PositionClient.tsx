"use client";

import Link from "next/link";
import { formatUsd } from "@auron/sdk";
import { useProtocolPosition } from "@/hooks/useProtocolPosition";
import { useProtocolActions } from "@/hooks/useProtocolActions";
import { ChainBanner } from "@/components/ChainBanner";

export function PositionClient() {
  const pos = useProtocolPosition();
  const actions = useProtocolActions(() => {
    void pos.refetch();
  });

  const needsAusApprove = pos.debtWei > BigInt(0) && pos.ausUsdAllowance < pos.debtWei;

  const rows = [
    { label: "Collateral", value: formatUsd(pos.collateralUsd) },
    { label: "Debt", value: formatUsd(pos.debtUsd) },
    { label: "Health factor", value: pos.healthFactorLabel },
    { label: "Wallet ausUSD", value: formatUsd(pos.walletAusUsdBal) },
  ];

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <ChainBanner />
      <div>
        <h1 className="font-display text-3xl">Position</h1>
        <p className="mt-2 text-sm text-auron-mist">On-chain AURWA-backed credit line</p>
      </div>

      {!pos.isConnected && (
        <p className="text-sm text-auron-mist">Connect wallet to load your position.</p>
      )}

      <dl className="space-y-4">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between border-b border-auron-line pb-3 text-sm">
            <dt className="text-auron-mist">{r.label}</dt>
            <dd className="font-mono">{pos.isConnected ? r.value : "—"}</dd>
          </div>
        ))}
      </dl>

      {actions.error && <p className="text-sm text-auron-danger">{actions.error}</p>}
      {actions.pendingLabel && (
        <p className="text-sm text-auron-accent">{actions.pendingLabel}…</p>
      )}

      <div className="flex flex-wrap gap-3">
        {needsAusApprove ? (
          <button
            type="button"
            disabled={!pos.isConnected || !pos.deployed || actions.busy || pos.debtUsd <= 0}
            className="rounded bg-auron-accent px-4 py-2 text-sm font-medium text-auron-ink disabled:opacity-40"
            onClick={() => void actions.approveAusUsd()}
          >
            Approve ausUSD
          </button>
        ) : (
          <button
            type="button"
            disabled={!pos.isConnected || !pos.deployed || actions.busy || pos.debtUsd <= 0}
            className="rounded bg-auron-accent px-4 py-2 text-sm font-medium text-auron-ink disabled:opacity-40"
            onClick={() => void actions.repay(pos.debtUsd)}
          >
            Repay all
          </button>
        )}
        <button
          type="button"
          disabled={
            !pos.isConnected ||
            !pos.deployed ||
            actions.busy ||
            pos.collateralUsd <= 0 ||
            pos.debtUsd > 0
          }
          className="rounded border border-auron-line px-4 py-2 text-sm hover:border-auron-accent disabled:opacity-40"
          onClick={() => void actions.withdraw(pos.collateralUsd)}
          title={pos.debtUsd > 0 ? "Repay debt before withdrawing" : undefined}
        >
          Withdraw all
        </button>
        <Link href="/borrow" className="px-2 py-2 text-sm text-auron-mist hover:text-auron-foam">
          Adjust borrow
        </Link>
      </div>
    </div>
  );
}
