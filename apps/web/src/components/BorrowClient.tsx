"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MARKETS } from "@auron/config";
import { formatHf, healthFactor, maxBorrowUsd } from "@auron/sdk";
import { useProtocolPosition } from "@/hooks/useProtocolPosition";
import { useProtocolActions } from "@/hooks/useProtocolActions";
import { ChainBanner } from "@/components/ChainBanner";
import { RiskStrip } from "@/components/RiskStrip";
import { TxStatus } from "@/components/TxStatus";
import { LIQUIDATION_THRESHOLD_BPS } from "@auron/config";

export function BorrowClient() {
  const searchParams = useSearchParams();
  const marketId = searchParams.get("market");
  const market = MARKETS.find((m) => m.id === marketId) ?? MARKETS[0];

  const pos = useProtocolPosition();
  const actions = useProtocolActions(() => {
    void pos.refetch();
  });

  const [depositAmt, setDepositAmt] = useState(10_000);
  const [borrowAmt, setBorrowAmt] = useState(6_000);

  useEffect(() => {
    if (pos.collateralUsd > 0 && pos.maxBorrow > 0) {
      setBorrowAmt((prev) => Math.min(prev, Math.floor(pos.maxBorrow)));
    }
  }, [pos.collateralUsd, pos.maxBorrow]);

  const depositWeiNeeded = BigInt(Math.round(depositAmt * 1e6)) * BigInt(10) ** BigInt(12);
  const needsApprove = pos.aurwaAllowance < depositWeiNeeded;
  const hasWallet = pos.walletAurwaUsd >= depositAmt;
  const hasCollateral = pos.collateralUsd > 0;

  const previewColl = pos.collateralUsd > 0 ? pos.collateralUsd : depositAmt;
  const previewDebt = pos.debtUsd + borrowAmt;
  const previewMax = maxBorrowUsd(
    pos.collateralUsd > 0 ? pos.collateralUsd : depositAmt,
    pos.ltvBps || market.ltvBps,
  );
  const previewHf = useMemo(
    () =>
      healthFactor(
        pos.collateralUsd > 0 ? pos.collateralUsd : depositAmt,
        pos.debtUsd + borrowAmt,
        LIQUIDATION_THRESHOLD_BPS,
      ),
    [pos.collateralUsd, pos.debtUsd, depositAmt, borrowAmt],
  );

  const steps = [
    {
      id: "faucet",
      label: "Get AURWA",
      done: hasWallet || hasCollateral,
      active: !hasWallet && !hasCollateral,
    },
    {
      id: "approve",
      label: "Approve",
      done: !needsApprove && (hasWallet || hasCollateral),
      active: hasWallet && needsApprove,
    },
    {
      id: "deposit",
      label: "Deposit",
      done: hasCollateral,
      active: hasWallet && !needsApprove && !hasCollateral,
    },
    {
      id: "borrow",
      label: "Borrow",
      done: pos.debtUsd > 0,
      active: hasCollateral,
    },
  ];

  const liveDisabled = !pos.isConnected || !pos.deployed || actions.busy;

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <ChainBanner />
      <div>
        <h1 className="font-display text-3xl">Borrow</h1>
        <p className="mt-2 text-sm text-auron-mist">
          Post collateral, unlock ausUSD credit. Live Anvil loop for{" "}
          <span className="text-auron-foam">{market.name}</span> ({market.token}
          {market.borrowEnabled ? "" : " — display market; execution uses AURWA pool"}).
        </p>
      </div>

      <ol className="flex flex-wrap gap-2 text-xs">
        {steps.map((s, i) => (
          <li
            key={s.id}
            className={`rounded border px-3 py-1.5 ${
              s.done
                ? "border-auron-accent/50 text-auron-accent"
                : s.active
                  ? "border-auron-foam text-auron-foam"
                  : "border-auron-line text-auron-mist"
            }`}
          >
            <span className="font-mono">{i + 1}.</span> {s.label}
          </li>
        ))}
      </ol>

      <RiskStrip
        compact
        collateralUsd={pos.collateralUsd || depositAmt}
        debtUsd={previewDebt}
        healthFactor={previewHf}
        ltvBps={pos.ltvBps || market.ltvBps}
        liquidationThresholdBps={market.liquidationThresholdBps}
        maxBorrow={previewMax}
      />

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
        <div className="flex items-center justify-between">
          <span className="text-sm text-auron-mist">Borrow amount (ausUSD)</span>
          <button
            type="button"
            className="text-xs text-auron-accent hover:underline"
            onClick={() => setBorrowAmt(Math.floor(previewMax))}
          >
            Max
          </button>
        </div>
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
        <span className="ml-2">
          (collateral {(pos.collateralUsd || depositAmt).toLocaleString()} / debt{" "}
          {previewDebt.toLocaleString()})
        </span>
      </p>

      <TxStatus
        pendingLabel={actions.pendingLabel}
        confirming={actions.confirming}
        error={actions.error}
        lastHash={actions.lastHash}
      />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={liveDisabled}
          className="rounded border border-auron-line px-4 py-2 text-sm disabled:opacity-40"
          onClick={() => void actions.faucet(10_000)}
        >
          1. Faucet 10k AURWA
        </button>
        {needsApprove ? (
          <button
            type="button"
            disabled={liveDisabled}
            className="rounded border border-auron-line px-4 py-2 text-sm disabled:opacity-40"
            onClick={() => void actions.approveAurwa()}
          >
            2. Approve AURWA
          </button>
        ) : (
          <button
            type="button"
            disabled={liveDisabled || depositAmt <= 0}
            className="rounded border border-auron-line px-4 py-2 text-sm disabled:opacity-40"
            onClick={() => void actions.deposit(depositAmt)}
          >
            3. Deposit
          </button>
        )}
        <button
          type="button"
          disabled={liveDisabled || borrowAmt <= 0 || pos.collateralUsd <= 0}
          className="rounded bg-auron-accent px-4 py-2 text-sm font-medium text-auron-ink disabled:opacity-40"
          onClick={() => void actions.borrow(borrowAmt)}
        >
          4. Borrow ausUSD
        </button>
        <Link href="/position" className="rounded border border-auron-line px-4 py-2 text-sm">
          Position
        </Link>
      </div>
    </div>
  );
}
