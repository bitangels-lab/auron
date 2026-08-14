import Link from "next/link";

const STEPS = [
  {
    title: "Collateral",
    body: "Assets you post that create borrowing capacity. In this POC, simulated treasury exposure (AURWA) stands in for real-world and digital collateral.",
  },
  {
    title: "Valuation",
    body: "An oracle prices collateral. Here NAV is fixed at $1.00 so you can see how price feeds into risk — production would use live NAV and staleness checks.",
  },
  {
    title: "Credit limits",
    body: "LTV caps how much ausUSD you can borrow against collateral. Liquidation threshold and health factor define when the position is no longer safely backed.",
  },
  {
    title: "Liquidity & stress",
    body: "Borrowed ausUSD is stablecoin credit. When markets move and collateral no longer covers debt, liquidation is the safety valve — surfaced here as HF and NAV shock previews.",
  },
];

export function CreditExplainer() {
  return (
    <section className="space-y-6 border-t border-auron-line pt-10">
      <div className="max-w-2xl">
        <h2 className="font-display text-2xl text-auron-foam">How credit works here</h2>
        <p className="mt-2 text-sm leading-relaxed text-auron-mist">
          Auron is exploring how assets become programmable collateral for stablecoin credit —
          connecting valuation, risk limits, and what happens when conditions change. This UI is a
          proof of concept, not a finished production product.
        </p>
      </div>

      <ol className="grid gap-6 sm:grid-cols-2">
        {STEPS.map((step, i) => (
          <li key={step.title} className="border-t border-auron-line pt-4">
            <p className="font-mono text-xs text-auron-accent">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-2 font-display text-lg">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-auron-mist">{step.body}</p>
          </li>
        ))}
      </ol>

      <p className="text-sm text-auron-mist">
        Start with{" "}
        <Link href="/markets" className="text-auron-foam underline-offset-4 hover:underline">
          markets
        </Link>{" "}
        to see collateral types, then{" "}
        <Link href="/borrow" className="text-auron-foam underline-offset-4 hover:underline">
          borrow
        </Link>{" "}
        to run the live Anvil loop.
      </p>
    </section>
  );
}
