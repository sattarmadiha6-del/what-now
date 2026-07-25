import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-clay">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-card text-lg tracking-tight">
          What Now?
        </Link>
        <nav className="flex items-center gap-5 font-meta text-xs uppercase tracking-wide">
          <Link href="/" className="hover:text-sage transition-colors">
            Decide
          </Link>
          <Link href="/history" className="hover:text-sage transition-colors">
            History
          </Link>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="hover:text-stamp transition-colors"
            >
              Log out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
