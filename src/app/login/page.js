"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      setInfo(
        "Check your email to confirm your account, then come back and log in."
      );
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-meta text-xs tracking-widest uppercase text-ink-soft mb-2">
            What Now?
          </p>
          <h1 className="font-card text-2xl">
            {mode === "login" ? "Welcome back." : "Let's set you up."}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/60 border border-clay rounded-sm p-6 space-y-4"
        >
          <div>
            <label className="block font-meta text-xs uppercase tracking-wide text-ink-soft mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-clay bg-cream rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block font-meta text-xs uppercase tracking-wide text-ink-soft mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-clay bg-cream rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage"
              placeholder="At least 6 characters"
            />
          </div>

          {error && <p className="text-stamp text-sm">{error}</p>}
          {info && <p className="text-sage text-sm">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-cream rounded-sm py-2.5 font-medium hover:bg-ink-soft transition-colors disabled:opacity-50"
          >
            {loading
              ? "One moment…"
              : mode === "login"
              ? "Log in"
              : "Sign up"}
          </button>
        </form>

        <p className="text-center text-sm text-ink-soft mt-4">
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
              setInfo("");
            }}
            className="underline underline-offset-2 hover:text-ink"
          >
            {mode === "login" ? "Create an account" : "Log in"}
          </button>
        </p>
      </div>
    </main>
  );
}
