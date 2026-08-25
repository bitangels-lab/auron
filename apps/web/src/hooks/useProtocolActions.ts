"use client";

import { useCallback, useEffect, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { maxUint256 } from "viem";
import { aurwaAbi, erc20Abi, lendingPoolAbi } from "@auron/sdk";
import { contracts, toWei } from "@/lib/contracts";

export function useProtocolActions(onDone?: () => void) {
  const { writeContractAsync } = useWriteContract();
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    query: { enabled: Boolean(hash) },
  });

  useEffect(() => {
    if (!isSuccess) return;
    onDone?.();
    setHash(undefined);
  }, [isSuccess, onDone]);

  const run = useCallback(
    async (label: string, fn: () => Promise<`0x${string}`>) => {
      setError(null);
      setPendingLabel(label);
      try {
        const tx = await fn();
        setHash(tx);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg.slice(0, 220));
      } finally {
        setPendingLabel(null);
      }
    },
    [],
  );

  const faucet = (amount = 10_000) =>
    run("Faucet AURWA", () =>
      writeContractAsync({
        address: contracts.aurwa,
        abi: aurwaAbi,
        functionName: "faucet",
        args: [toWei(amount)],
      }),
    );

  const approveAurwa = () =>
    run("Approve AURWA", () =>
      writeContractAsync({
        address: contracts.aurwa,
        abi: erc20Abi,
        functionName: "approve",
        args: [contracts.lendingPool, maxUint256],
      }),
    );

  const approveAusUsd = () =>
    run("Approve ausUSD", () =>
      writeContractAsync({
        address: contracts.ausUsd,
        abi: erc20Abi,
        functionName: "approve",
        args: [contracts.lendingPool, maxUint256],
      }),
    );

  const deposit = (amount: number) =>
    run("Deposit collateral", () =>
      writeContractAsync({
        address: contracts.lendingPool,
        abi: lendingPoolAbi,
        functionName: "depositCollateral",
        args: [toWei(amount)],
      }),
    );

  const borrow = (amount: number) =>
    run("Borrow ausUSD", () =>
      writeContractAsync({
        address: contracts.lendingPool,
        abi: lendingPoolAbi,
        functionName: "borrow",
        args: [toWei(amount)],
      }),
    );

  const repay = (amount: number) =>
    run("Repay", () =>
      writeContractAsync({
        address: contracts.lendingPool,
        abi: lendingPoolAbi,
        functionName: "repay",
        args: [toWei(amount)],
      }),
    );

  const withdraw = (amount: number) =>
    run("Withdraw", () =>
      writeContractAsync({
        address: contracts.lendingPool,
        abi: lendingPoolAbi,
        functionName: "withdrawCollateral",
        args: [toWei(amount)],
      }),
    );

  return {
    faucet,
    approveAurwa,
    approveAusUsd,
    deposit,
    borrow,
    repay,
    withdraw,
    pendingLabel,
    confirming,
    error,
    busy: Boolean(pendingLabel) || confirming,
  };
}
