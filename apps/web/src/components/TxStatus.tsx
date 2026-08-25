"use client";

type Props = {
  pendingLabel: string | null;
  confirming: boolean;
  error: string | null;
  lastHash?: `0x${string}`;
};

export function TxStatus({ pendingLabel, confirming, error, lastHash }: Props) {
  if (!pendingLabel && !confirming && !error && !lastHash) return null;

  return (
    <div className="space-y-2 text-sm" role="status">
      {(pendingLabel || confirming) && (
        <p className="text-auron-accent">
          {pendingLabel ? `${pendingLabel}…` : "Confirming on-chain…"}
        </p>
      )}
      {lastHash && !pendingLabel && !confirming && (
        <p className="text-auron-mist">
          Confirmed{" "}
          <span className="font-mono text-auron-foam">
            {lastHash.slice(0, 10)}…{lastHash.slice(-6)}
          </span>
        </p>
      )}
      {error && <p className="break-words text-auron-danger">{error}</p>}
    </div>
  );
}
