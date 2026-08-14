"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LIQUIDATION_THRESHOLD_BPS } from "@auron/config";
import { formatUsd } from "@auron/sdk";
import { useProtocolPosition } from "@/hooks/useProtocolPosition";
import { useProtocolActions } from "@/hooks/useProtocolActions";
import { ChainBanner } from "@/components/ChainBanner";
import { RiskStrip } from "@/components/RiskStrip";
import { TxStatus } from "@/components/TxStatus";

export function PositionClient() {
  const pos = useProtocolPosition();
  const actions = useProtocolActions(() => {
    void pos.refetch();
  });

  const [repayAmt, setRepayAmt] = useState(0);
  const [withdrawAmt, setWithdrawAmt] = useState(0);

  useEffect(() => {
    setRepayAmt(pos.debtUsd > 0 ? Number(pos.debtUsd.toFixed(2)) : 0);
    setWithdrawAmt(pos.collateralUsd > 0 ? Number(pos.collateralUsd.toFixed(2)) : 0);
  }, [pos.debtUsd, pos.collateralUsd]);

  const needsAusApprove =
    repayAmt > 0 && pos.ausUsdAllowance < BigInt(Math.round(repayAmt * 1e6)) * BigInt(10) ** BigInt(12);
  const liveDisabled = !pos.isConnected || !pos.deployed || actions.busy;

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <ChainBanner />
      <div>
        <h1 className="font-display text-3xl">Position</h1>
        <p className="mt-2 text-sm text-auron-mist">
          AURWA-backed credit line — monitor valuation, LTV, and distance to liquidation.
        </p>
      </div>

      {!pos.isConnected && (
        <p className="text-sm text-auron-mist">Connect wallet to load your position.</p>
      )}

      <RiskStrip
        collateralUsd={pos.collateralUsd}
        debtUsd={pos.debtUsd}
        healthFactor={pos.healthFactor}
        ltvBps={pos.ltvBps}
        liquidationThresholdBps={LIQUIDATION_THRESHOLD_BPS}
        maxBorrow={pos.maxBorrow}
      />

      <dl className="space-y-4">
        {[
          { label: "Collateral", value: formatUsd(pos.collateralUsd) },
          { label: "Debt", value: formatUsd(pos.debtUsd) },
          { label: "Health factor", value: pos.healthFactorLabel },
          { label: "Wallet ausUSD", value: formatUsd(pos.walletAusUsdBal) },
        ].map((r) => (
          <div key={r.label} className="flex justify-between border-b border-auron-line pb-3 text-sm">
            <dt className="text-auron-mist">{r.label}</dt>
            <dd className="font-mono">{pos.isConnected ? r.value : "—"}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block space-y-2">
          <div className="flex justify-between text-sm text-auron-mist">
            <span>Repay (ausUSD)</span>
            <button
              type="button"
              className="text-xs text-auron-accent hover:underline"
              onClick={() => setRepayAmt(Number(pos.debtUsd.toFixed(2)))}
            >
              All
            </button>
          </div>
          <input
            type="number"
            min={0}
            max={pos.debtUsd}
            step="any"
            value={repayAmt}
            onChange={(e) => setRepayAmt(Number(e.target.value))}
            className="w-full rounded border border-auron-line bg-auron-panel px-3 py-2 font-mono text-sm text-auron-foam outline-none focus:border-auron-accent"
          />
        </label>

        <label className="block space-y-2">
          <div className="flex justify-between text-sm text-auron-mist">
            <span>Withdraw (AURWA)</span>
            <button
              type="button"
              className="text-xs text-auron-accent hover:underline"
              onClick={() => setWithdrawAmt(Number(pos.collateralUsd.toFixed(2)))}
            >
              All
            </button>
          </div>
          <input
            type="number"
            min={0}
            max={pos.collateralUsd}
            step="any"
            value={withdrawAmt}
            onChange={(e) => setWithdrawAmt(Number(e.target.value))}
            className="w-full rounded border border-auron-line bg-auron-panel px-3 py-2 font-mono text-sm text-auron-foam outline-none focus:border-auron-accent"
            title={pos.debtUsd > 0 ? "Repay debt before withdrawing in this POC" : undefined}
          />
        </label>
      </div>

      <TxStatus
        pendingLabel={actions.pendingLabel}
        confirming={actions.confirming}
        error={actions.error}
        lastHash={actions.lastHash}
      />

      <div className="flex flex-wrap gap-3">
        {needsAusApprove ? (
          <button
            type="button"
            disabled={liveDisabled || pos.debtUsd <= 0}
            className="rounded bg-auron-accent px-4 py-2 text-sm font-medium text-auron-ink disabled:opacity-40"
            onClick={() => void actions.approveAusUsd()}
          >
            Approve ausUSD
          </button>
        ) : (
          <button
            type="button"
            disabled={liveDisabled || repayAmt <= 0 || pos.debtUsd <= 0}
            className="rounded bg-auron-accent px-4 py-2 text-sm font-medium text-auron-ink disabled:opacity-40"
            onClick={() => void actions.repay(Math.min(repayAmt, pos.debtUsd))}
          >
            Repay
          </button>
        )}
        <button
          type="button"
          disabled={
            liveDisabled ||
            withdrawAmt <= 0 ||
            pos.collateralUsd <= 0 ||
            pos.debtUsd > 0
          }
          className="rounded border border-auron-line px-4 py-2 text-sm hover:border-auron-accent disabled:opacity-40"
          onClick={() => void actions.withdraw(Math.min(withdrawAmt, pos.collateralUsd))}
          title={pos.debtUsd > 0 ? "Repay debt before withdrawing" : undefined}
        >
          Withdraw
        </button>
        <Link href="/borrow" className="px-2 py-2 text-sm text-auron-mist hover:text-auron-foam">
          Adjust borrow
        </Link>
      </div>
    </div>
  );
}
