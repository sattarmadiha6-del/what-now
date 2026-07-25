"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, LogOut } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  const navItem = (href, label) => (
    <Link
      href={href}
      className={`transition-colors ${
        pathname === href
          ? "text-stamp"
          : "text-ink-soft hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-10 border-b border-clay bg-cream/85 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-ink text-cream group-hover:bg-stamp transition-colors">
            <ChefHat size={16} strokeWidth={2.25} />
          </span>
          <span className="font-card text-lg tracking-tight">What Now?</span>
        </Link>
        <nav className="flex items-center gap-5 font-meta text-xs uppercase tracking-wide">
          {navItem("/", "Decide")}
          {navItem("/history", "History")}
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="flex items-center gap-1 text-ink-soft hover:text-stamp transition-colors"
            >
              <LogOut size={13} />
              Log out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
