"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";

export function VoteButton({ proposalId }: { proposalId: string }) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      disabled={done}
      className="rounded bg-auron-accent px-4 py-2 text-sm font-medium text-auron-ink disabled:opacity-60"
      onClick={async () => {
        await apiPost(`/governance/proposals/${proposalId}/vote`, { support: true });
        setDone(true);
      }}
    >
      {done ? "Vote recorded (demo)" : "Vote"}
    </button>
  );
}
