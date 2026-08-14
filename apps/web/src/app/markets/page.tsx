import { MARKETS } from "@auron/config";
import Link from "next/link";
import { apiGet } from "@/lib/api";

type Market = (typeof MARKETS)[number];

export default async function MarketsPage() {
  const markets = (await apiGet<Market[]>("/markets")) ?? [...MARKETS];

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl">Collateral markets</h1>
        <p className="mt-2 text-sm leading-relaxed text-auron-mist">
          Assets that can support borrowing capacity. Yield shown is illustrative asset yield — not
          the borrow rate. Only AURWA (US Treasury) executes on-chain in this POC; other markets
          explore product direction.
        </p>
      </div>
      <ul className="divide-y divide-auron-line border-y border-auron-line">
        {markets.map((m) => (
          <li key={m.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
            <div>
              <Link href={`/markets/${m.id}`} className="font-display text-xl hover:text-auron-accent">
                {m.name}
              </Link>
              <p className="mt-1 text-sm text-auron-mist">
                {m.role} · {m.token} · LTV {(m.ltvBps / 100).toFixed(0)}% · LT{" "}
                {(m.liquidationThresholdBps / 100).toFixed(0)}% · {m.valuation}
              </p>
              <p className="mt-1 text-xs text-auron-mist">
                Risk {m.risk} · Liquidity {m.liquidity}
                {m.borrowEnabled ? "" : " · Display-only"}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-auron-accent">Asset yield {m.apy}%</p>
              <Link
                href={m.borrowEnabled ? `/borrow?market=${m.id}` : `/markets/${m.id}`}
                className="mt-2 inline-block text-sm text-auron-foam underline-offset-4 hover:underline"
              >
                {m.borrowEnabled ? "Borrow against →" : "Details →"}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
