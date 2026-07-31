import Link from "next/link";
import { WalletButton } from "./WalletButton";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/markets", label: "RWA Markets" },
  { href: "/borrow", label: "Borrow" },
  { href: "/position", label: "Position" },
  { href: "/governance", label: "Governance" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-8">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-auron-line pb-6">
        <div className="animate-rise">
          <p className="font-display text-3xl tracking-tight text-auron-foam">AURON</p>
          <p className="mt-1 max-w-md text-sm text-auron-mist">
            RWA collateral · stablecoin credit · protocol POC
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <nav className="flex flex-wrap gap-3 text-sm text-auron-mist">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-auron-foam">
                {item.label}
              </Link>
            ))}
          </nav>
          <WalletButton />
        </div>
      </header>
      <main className="animate-rise [animation-delay:80ms]">{children}</main>
    </div>
  );
}
