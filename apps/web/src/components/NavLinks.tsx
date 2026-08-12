"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/markets", label: "Markets" },
  { href: "/borrow", label: "Borrow" },
  { href: "/position", label: "Position" },
  { href: "/governance", label: "Governance" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-3 text-sm">
      {NAV.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? "text-auron-foam underline decoration-auron-accent underline-offset-8"
                : "text-auron-mist hover:text-auron-foam"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
