"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatHf, healthFactor, maxBorrowUsd } from "@auron/sdk";
import { useProtocolPosition } from "@/hooks/useProtocolPosition";
import { useProtocolActions } from "@/hooks/useProtocolActions";
import { ChainBanner } from "@/components/ChainBanner";

export function BorrowClient() {
  const pos = useProtocolPosition();
  const actions = useProtocolActions(() => {
    void pos.refetch();
  });

  const [depositAmt, setDepositAmt] = useState(10_000);
  const [borrowAmt, setBorrowAmt] = useState(6_000);

  useEffect(() => {
    if (pos.collateralUsd > 0) {
      setBorrowAmt(Math.min(6_000, Math.floor(pos.maxBorrow)));
    }
  }, [pos.collateralUsd, pos.maxBorrow]);

  const previewColl = pos.collateralUsd + (pos.collateralUsd > 0 ? 0 : depositAmt);
  const previewDebt = pos.debtUsd + borrowAmt;
  const previewMax = maxBorrowUsd(pos.collateralUsd || depositAmt, pos.ltvBps);
  const previewHf = useMemo(
    () => healthFactor(pos.collateralUsd || depositAmt, pos.debtUsd + borrowAmt),
    [pos.collateralUsd, pos.debtUsd, depositAmt, borrowAmt],
  );

  const needsApprove =
    pos.aurwaAllowance < BigInt(Math.round(depositAmt * 1e6)) * BigInt(10) ** BigInt(12);

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <ChainBanner />
      <div>
        <h1 className="font-display text-3xl">Borrow</h1>
        <p className="mt-2 text-sm text-auron-mist">
          Live Anvil flow: faucet AURWA → approve → deposit → borrow ausUSD.
        </p>
      </div>

      <dl className="space-y-4 text-sm">
        <div className="flex justify-between border-b border-auron-line pb-3">
          <dt className="text-auron-mist">Wallet AURWA</dt>
          <dd className="font-mono">{pos.walletAurwaUsd.toLocaleString()}</dd>
        </div>
        <div className="flex justify-between border-b border-auron-line pb-3">
          <dt className="text-auron-mist">Posted collateral</dt>
          <dd className="font-mono">{pos.collateralUsd.toLocaleString()} AURWA</dd>
        </div>
        <div className="flex justify-between border-b border-auron-line pb-3">
          <dt className="text-auron-mist">Max borrow (LTV)</dt>
          <dd className="font-mono">{previewMax.toLocaleString()} ausUSD</dd>
        </div>
      </dl>

      <label className="block space-y-2">
        <span className="text-sm text-auron-mist">Deposit amount (AURWA)</span>
        <input
          type="number"
          min={0}
          value={depositAmt}
          onChange={(e) => setDepositAmt(Number(e.target.value))}
          className="w-full rounded border border-auron-line bg-auron-panel px-3 py-2 font-mono text-auron-foam outline-none focus:border-auron-accent"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-auron-mist">Borrow amount (ausUSD)</span>
        <input
          type="number"
          min={0}
          max={previewMax}
          value={borrowAmt}
          onChange={(e) => setBorrowAmt(Number(e.target.value))}
          className="w-full rounded border border-auron-line bg-auron-panel px-3 py-2 font-mono text-auron-foam outline-none focus:border-auron-accent"
        />
      </label>

      <p className="text-sm text-auron-mist">
        Preview health factor{" "}
        <span className={`font-mono ${previewHf < 1.2 ? "text-auron-danger" : "text-auron-accent"}`}>
          {formatHf(previewHf)}
        </span>
        <span className="ml-2 text-auron-mist">
          (after deposit {previewColl.toLocaleString()} / debt {previewDebt.toLocaleString()})
        </span>
      </p>

      {actions.error && <p className="text-sm text-auron-danger">{actions.error}</p>}
      {actions.pendingLabel && (
        <p className="text-sm text-auron-accent">{actions.pendingLabel}…</p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!pos.isConnected || !pos.deployed || actions.busy}
          className="rounded border border-auron-line px-4 py-2 text-sm disabled:opacity-40"
          onClick={() => void actions.faucet(10_000)}
        >
          Faucet 10k AURWA
        </button>
        {needsApprove ? (
          <button
            type="button"
            disabled={!pos.isConnected || !pos.deployed || actions.busy}
            className="rounded border border-auron-line px-4 py-2 text-sm disabled:opacity-40"
            onClick={() => void actions.approveAurwa()}
          >
            Approve AURWA
          </button>
        ) : (
          <button
            type="button"
            disabled={!pos.isConnected || !pos.deployed || actions.busy || depositAmt <= 0}
            className="rounded border border-auron-line px-4 py-2 text-sm disabled:opacity-40"
            onClick={() => void actions.deposit(depositAmt)}
          >
            Deposit
          </button>
        )}
        <button
          type="button"
          disabled={
            !pos.isConnected ||
            !pos.deployed ||
            actions.busy ||
            borrowAmt <= 0 ||
            pos.collateralUsd <= 0
          }
          className="rounded bg-auron-accent px-4 py-2 text-sm font-medium text-auron-ink disabled:opacity-40"
          onClick={() => void actions.borrow(borrowAmt)}
        >
          Borrow ausUSD
        </button>
        <Link href="/position" className="rounded border border-auron-line px-4 py-2 text-sm">
          Position
        </Link>
      </div>
    </div>
  );
}
