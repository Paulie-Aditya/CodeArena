"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/problems", label: "Problems" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/profile", label: "Profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:block w-60 shrink-0">
      <div className="rounded-lg border-[hsl(var(--border))] bg-[hsl(var(--background))]">
        <nav className="p-3 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm",
                pathname.startsWith(l.href)
                  ? "bg-foreground/5 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
