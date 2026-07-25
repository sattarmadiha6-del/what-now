"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UtensilsCrossed, ArrowRight, Loader2 } from "lucide-react";

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
      <div className="w-full max-w-sm animate-card-in">
        <div className="text-center mb-8">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green text-cream mb-4">
            <UtensilsCrossed size={22} strokeWidth={2.25} />
          </span>
          <p className="font-heading font-bold text-lg">What Now?</p>
          <p className="text-sm text-ink-soft mt-1">
            Stop wondering what to eat. Let AI decide.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-3xl card-shadow-lg p-6 space-y-4"
        >
          <div>
            <label className="block font-meta text-xs uppercase tracking-wide text-ink-soft mb-1.5">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border bg-cream rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green"
              placeholder="chef@kitchen.com"
            />
          </div>
          <div>
            <label className="block font-meta text-xs uppercase tracking-wide text-ink-soft mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border bg-cream rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green"
              placeholder="At least 6 characters"
            />
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}
          {info && <p className="text-green text-sm">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green text-cream rounded-full py-3.5 font-medium text-sm hover:bg-green-dark transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Login" : "Sign up"}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-ink-soft mt-5">
          {mode === "login" ? "New to the kitchen?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
              setInfo("");
            }}
            className="underline underline-offset-2 hover:text-green transition-colors"
          >
            {mode === "login" ? "Create account" : "Log in"}
          </button>
        </p>
      </div>
    </main>
  );
}
