import {
  AURWA,
  DEFAULT_LTV_BPS,
  LIQUIDATION_THRESHOLD_BPS,
} from "@auron/config";
import { healthFactor } from "@auron/sdk";

export const ORACLE_LABEL = "Mock oracle · AURWA NAV $1.00";

export function bpsToPct(bps: number): number {
  return bps / 100;
}

/** USD of additional debt before HF hits 1.0 at current collateral. */
export function liquidationBufferUsd(
  collateralUsd: number,
  debtUsd: number,
  liquidationThresholdBps = LIQUIDATION_THRESHOLD_BPS,
): number {
  if (collateralUsd <= 0) return 0;
  const maxDebtAtLiq = collateralUsd * (liquidationThresholdBps / 10_000);
  return Math.max(0, maxDebtAtLiq - debtUsd);
}

/** HF if collateral NAV drops by `navDropPct` percent. */
export function hfAfterNavShock(
  collateralUsd: number,
  debtUsd: number,
  navDropPct: number,
  liquidationThresholdBps = LIQUIDATION_THRESHOLD_BPS,
): number {
  const shocked = collateralUsd * (1 - navDropPct / 100);
  return healthFactor(shocked, debtUsd, liquidationThresholdBps);
}

export function currentLtvPct(collateralUsd: number, debtUsd: number): number {
  if (collateralUsd <= 0) return 0;
  return (debtUsd / collateralUsd) * 100;
}

export function utilizationPct(debtUsd: number, maxBorrow: number): number {
  if (maxBorrow <= 0) return 0;
  return Math.min(100, (debtUsd / maxBorrow) * 100);
}

export const DEFAULT_RISK = {
  navUsd: AURWA.navUsd,
  ltvBps: DEFAULT_LTV_BPS,
  liquidationThresholdBps: LIQUIDATION_THRESHOLD_BPS,
} as const;
