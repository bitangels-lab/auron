import { WalletButton } from "./WalletButton";
import { NavLinks } from "./NavLinks";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-8">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-auron-line pb-6">
        <div className="animate-rise">
          <p className="font-display text-3xl tracking-tight text-auron-foam">AURON</p>
          <p className="mt-1 max-w-lg text-sm text-auron-mist">
            Programmable collateral · stablecoin credit · risk-aware POC
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <NavLinks />
          <WalletButton />
        </div>
      </header>
      <main className="animate-rise [animation-delay:80ms]">{children}</main>
    </div>
  );
}
