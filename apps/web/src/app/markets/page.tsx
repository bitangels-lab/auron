import { MARKETS } from "@auron/config";
import Link from "next/link";
import { apiGet } from "@/lib/api";

type Market = (typeof MARKETS)[number];

export default async function MarketsPage() {
  const markets = (await apiGet<Market[]>("/markets")) ?? [...MARKETS];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">RWA Markets</h1>
        <p className="mt-2 text-sm text-auron-mist">
          Simulated tokenized assets for the POC. Production will plug real NAV feeds and transfer restrictions.
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
                Risk {m.risk} · Liquidity {m.liquidity}
              </p>
            </div>
            <p className="font-mono text-auron-accent">Yield {m.apy}%</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
