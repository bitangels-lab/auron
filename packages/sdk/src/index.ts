import { DEFAULT_LTV_BPS, HEALTH_FACTOR_LIQUIDATION } from "@auron/config";

/** Health factor ≈ (collateralUsd * liquidationThreshold) / debtUsd */
export function healthFactor(
  collateralUsd: number,
  debtUsd: number,
  liquidationThresholdBps = 8000,
): number {
  if (debtUsd <= 0) return Number.POSITIVE_INFINITY;
  return (collateralUsd * (liquidationThresholdBps / 10_000)) / debtUsd;
}

export function maxBorrowUsd(collateralUsd: number, ltvBps = DEFAULT_LTV_BPS): number {
  return collateralUsd * (ltvBps / 10_000);
}

export function isLiquidatable(hf: number): boolean {
  return hf < HEALTH_FACTOR_LIQUIDATION;
}

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatHf(hf: number): string {
  if (!Number.isFinite(hf)) return "∞";
  return hf.toFixed(2);
}

export * from "./abis.js";
