"use client";

import { formatHf, formatUsd } from "@auron/sdk";
import {
  ORACLE_LABEL,
  bpsToPct,
  currentLtvPct,
  hfAfterNavShock,
  liquidationBufferUsd,
  utilizationPct,
} from "@/lib/risk";

type Props = {
  collateralUsd: number;
  debtUsd: number;
  healthFactor: number;
  ltvBps: number;
  liquidationThresholdBps?: number;
  maxBorrow?: number;
  compact?: boolean;
};

export function RiskStrip({
  collateralUsd,
  debtUsd,
  healthFactor: hf,
  ltvBps,
  liquidationThresholdBps = 8000,
  maxBorrow,
  compact = false,
}: Props) {
  const buffer = liquidationBufferUsd(collateralUsd, debtUsd, liquidationThresholdBps);
  const ltvNow = currentLtvPct(collateralUsd, debtUsd);
  const maxLtv = bpsToPct(ltvBps);
  const ltPct = bpsToPct(liquidationThresholdBps);
  const shock5 = hfAfterNavShock(collateralUsd, debtUsd, 5, liquidationThresholdBps);
  const util =
    maxBorrow !== undefined ? utilizationPct(debtUsd, maxBorrow) : undefined;
  const hfTone =
    !Number.isFinite(hf) || hf >= 1.5
      ? "text-auron-accent"
      : hf >= 1.2
        ? "text-auron-warn"
        : "text-auron-danger";

  const cells: { label: string; value: string; mono: boolean; className?: string }[] = [
    { label: "NAV / oracle", value: ORACLE_LABEL, mono: false },
    { label: "Max LTV", value: `${maxLtv.toFixed(0)}%`, mono: true },
    { label: "Liq. threshold", value: `${ltPct.toFixed(0)}%`, mono: true },
    {
      label: "Current LTV",
      value: collateralUsd > 0 ? `${ltvNow.toFixed(1)}%` : "—",
      mono: true,
    },
    {
      label: "Health factor",
      value: formatHf(hf),
      mono: true,
      className: hfTone,
    },
    {
      label: "Buffer to liq.",
      value: debtUsd > 0 || collateralUsd > 0 ? formatUsd(buffer) : "—",
      mono: true,
    },
  ];

  if (util !== undefined) {
    cells.push({
      label: "Credit used",
      value: `${util.toFixed(0)}%`,
      mono: true,
    });
  }

  return (
    <section
      className={`border-y border-auron-line ${compact ? "py-4" : "py-5"}`}
      aria-label="Risk parameters"
    >
      <div
        className={`grid gap-4 ${compact ? "sm:grid-cols-3 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}
      >
        {cells.map((c) => (
          <div key={c.label}>
            <p className="text-xs uppercase tracking-[0.14em] text-auron-mist">{c.label}</p>
            <p
              className={`mt-1 text-sm ${c.mono ? "font-mono" : ""} ${c.className ?? "text-auron-foam"}`}
            >
              {c.value}
            </p>
          </div>
        ))}
      </div>
      {collateralUsd > 0 && debtUsd > 0 && (
        <p className="mt-4 text-xs text-auron-mist">
          If NAV −5%, health factor →{" "}
          <span className="font-mono text-auron-foam">{formatHf(shock5)}</span>
          {shock5 < 1 ? " — would be liquidatable in this POC model." : "."}
        </p>
      )}
    </section>
  );
}
