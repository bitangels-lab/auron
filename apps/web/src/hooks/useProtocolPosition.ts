"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { aurwaAbi, erc20Abi, lendingPoolAbi, formatHf } from "@auron/sdk";
import { contracts, fromWei, hfFromWad, isDeployed } from "@/lib/contracts";
import { maxBorrowUsd } from "@auron/sdk";

export function useProtocolPosition() {
  const { address, isConnected } = useAccount();
  const enabled = Boolean(isConnected && address && isDeployed());

  const position = useReadContract({
    address: contracts.lendingPool,
    abi: lendingPoolAbi,
    functionName: "getPosition",
    args: address ? [address] : undefined,
    query: { enabled, refetchInterval: 4_000 },
  });

  const balances = useReadContracts({
    contracts: address
      ? [
          {
            address: contracts.aurwa,
            abi: aurwaAbi,
            functionName: "balanceOf",
            args: [address],
          },
          {
            address: contracts.ausUsd,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [address],
          },
          {
            address: contracts.aurwa,
            abi: erc20Abi,
            functionName: "allowance",
            args: [address, contracts.lendingPool],
          },
          {
            address: contracts.ausUsd,
            abi: erc20Abi,
            functionName: "allowance",
            args: [address, contracts.lendingPool],
          },
          {
            address: contracts.lendingPool,
            abi: lendingPoolAbi,
            functionName: "ltvBps",
          },
        ]
      : [],
    query: { enabled, refetchInterval: 4_000 },
  });

  const coll = position.data?.[0] ?? BigInt(0);
  const debt = position.data?.[1] ?? BigInt(0);
  const hfWad = position.data?.[2] ?? BigInt(0);
  const walletAurwa = (balances.data?.[0]?.result as bigint | undefined) ?? BigInt(0);
  const walletAusUsd = (balances.data?.[1]?.result as bigint | undefined) ?? BigInt(0);
  const aurwaAllowance = (balances.data?.[2]?.result as bigint | undefined) ?? BigInt(0);
  const ausUsdAllowance = (balances.data?.[3]?.result as bigint | undefined) ?? BigInt(0);
  const ltvBps = Number((balances.data?.[4]?.result as bigint | undefined) ?? BigInt(7000));

  const collateralUsd = fromWei(coll);
  const debtUsd = fromWei(debt);
  const hf = debt === BigInt(0) ? Number.POSITIVE_INFINITY : hfFromWad(hfWad);
  const walletAurwaUsd = fromWei(walletAurwa);
  const walletAusUsdBal = fromWei(walletAusUsd);
  const maxBorrow = maxBorrowUsd(collateralUsd, ltvBps);

  const refetch = async () => {
    await Promise.all([position.refetch(), balances.refetch()]);
  };

  return {
    address,
    isConnected,
    deployed: isDeployed(),
    loading: enabled && (position.isLoading || balances.isLoading),
    collateralUsd,
    debtUsd,
    healthFactor: hf,
    healthFactorLabel: formatHf(hf),
    walletAurwaUsd,
    walletAusUsdBal,
    aurwaAllowance,
    ausUsdAllowance,
    ltvBps,
    maxBorrow,
    collateralWei: coll,
    debtWei: debt,
    refetch,
  };
}
