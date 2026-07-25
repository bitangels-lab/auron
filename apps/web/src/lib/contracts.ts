import { localDeployment } from "@auron/config";
import type { Address } from "viem";

const ZERO = "0x0000000000000000000000000000000000000000";

function addr(envValue: string | undefined, fallback: string): Address {
  const v = (envValue || fallback || ZERO) as Address;
  return v;
}

export const contracts = {
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? localDeployment.chainId ?? 31337),
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? localDeployment.rpcUrl ?? "http://127.0.0.1:8545",
  aurwa: addr(process.env.NEXT_PUBLIC_AURWA_ADDRESS, localDeployment.aurwa),
  ausUsd: addr(process.env.NEXT_PUBLIC_STABLECOIN_ADDRESS, localDeployment.ausUsd),
  lendingPool: addr(process.env.NEXT_PUBLIC_LENDING_POOL_ADDRESS, localDeployment.lendingPool),
  oracle: addr(process.env.NEXT_PUBLIC_ORACLE_ADDRESS, localDeployment.oracle),
  governance: addr(process.env.NEXT_PUBLIC_GOVERNANCE_ADDRESS, localDeployment.governance),
} as const;

export function isDeployed(): boolean {
  return contracts.lendingPool !== ZERO && contracts.aurwa !== ZERO;
}

export const WAD = BigInt(10) ** BigInt(18);

export function toWei(amount: number | string): bigint {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n) || n < 0) return BigInt(0);
  return BigInt(Math.round(n * 1e6)) * BigInt(10) ** BigInt(12);
}

export function fromWei(value: bigint): number {
  return Number(value) / 1e18;
}

export function hfFromWad(value: bigint): number {
  if (value >= BigInt(2) ** BigInt(128)) return Number.POSITIVE_INFINITY;
  return Number(value) / 1e18;
}
