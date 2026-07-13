import type { ProposalView } from "@auron/config";
import { apiGet } from "@/lib/api";
import { VoteButton } from "./VoteButton";

export default async function GovernancePage() {
  const proposals =
    (await apiGet<ProposalView[]>("/governance/proposals")) ??
    ([
      {
        id: "AIP-003",
        title: "Change ausUSD LTV from 70% → 65%",
        description: "Tighten maximum LTV for AURWA-backed borrows.",
        forPct: 72,
        againstPct: 28,
        status: "active",
      },
    ] satisfies ProposalView[]);

  const p = proposals[0];

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="font-display text-3xl">Governance</h1>
        <p className="mt-2 text-sm text-auron-mist">
          Risk parameters are protocol surface area — intentionally unfinished for senior hires.
        </p>
      </div>

      <article className="space-y-6 border-y border-auron-line py-8">
        <p className="font-mono text-xs text-auron-accent">{p.id}</p>
        <h2 className="font-display text-2xl">{p.title}</h2>
        <p className="text-sm text-auron-mist">{p.description}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>For {p.forPct}%</span>
            <span className="text-auron-mist">Against {p.againstPct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-auron-panel">
            <div className="h-full bg-auron-accent" style={{ width: `${p.forPct}%` }} />
          </div>
        </div>

        <VoteButton proposalId={p.id} />
      </article>
    </div>
  );
}
