"use client";

import { useState } from "react";
import {
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  ThumbsDown,
  ChefHat,
  RotateCcw,
  Stamp,
} from "lucide-react";

const ENERGY_OPTIONS = [
  { value: "low", label: "Low", hint: "just get me fed", Icon: BatteryLow },
  { value: "medium", label: "Medium", hint: "a real meal is fine", Icon: BatteryMedium },
  { value: "high", label: "High", hint: "I actually want to cook", Icon: BatteryFull },
];

export default function CheckinFlow() {
  const [stage, setStage] = useState("form"); // form | loading | result | error
  const [ingredients, setIngredients] = useState("");
  const [energy, setEnergy] = useState("");
  const [craving, setCraving] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [checkin, setCheckin] = useState(null);
  const [rejectedNames, setRejectedNames] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [decided, setDecided] = useState(false);

  async function requestRecommendation(currentSessionId) {
    setStage("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients,
          energy,
          craving,
          sessionId: currentSessionId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }
      setSessionId(data.sessionId);
      setCheckin(data.checkin);
      setStage("result");
    } catch (err) {
      setErrorMsg(err.message);
      setStage("error");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!ingredients.trim() || !energy) return;
    setDecided(false);
    setRejectedNames([]);
    setSessionId(null);
    await requestRecommendation(null);
  }

  async function handleAccept() {
    setDecided(true);
    await fetch(`/api/checkins/${checkin.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "accepted" }),
    });
  }

  async function handleReject() {
    await fetch(`/api/checkins/${checkin.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected" }),
    });
    setRejectedNames((prev) => [...prev, checkin.dish_name]);
    await requestRecommendation(sessionId);
  }

  function startOver() {
    setStage("form");
    setIngredients("");
    setEnergy("");
    setCraving("");
    setSessionId(null);
    setCheckin(null);
    setRejectedNames([]);
    setDecided(false);
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {stage === "form" && (
        <form
          onSubmit={handleSubmit}
          className="animate-card-in bg-white rounded-2xl card-shadow-lg p-7 space-y-6"
        >
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-sage-dim text-sage">
              <Sparkles size={20} />
            </span>
            <div>
              <p className="font-card text-2xl leading-tight">
                What&apos;s in reach?
              </p>
              <p className="text-sm text-ink-soft mt-0.5">
                No menu, no scrolling. Tell me what you&apos;ve got and I&apos;ll decide.
              </p>
            </div>
          </div>

          <div>
            <label className="block font-meta text-xs uppercase tracking-wide text-ink-soft mb-1.5">
              Ingredients you have
            </label>
            <textarea
              required
              rows={3}
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="e.g. eggs, half a loaf of bread, tomatoes, cheddar"
              className="w-full border border-clay bg-cream/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage resize-none transition-shadow"
            />
          </div>

          <div>
            <label className="block font-meta text-xs uppercase tracking-wide text-ink-soft mb-2">
              Energy to cook
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ENERGY_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setEnergy(opt.value)}
                  className={`rounded-xl border px-3 py-3 text-left transition-all ${
                    energy === opt.value
                      ? "border-sage bg-sage-dim ring-1 ring-sage"
                      : "border-clay bg-cream/60 hover:border-sage/60"
                  }`}
                >
                  <opt.Icon
                    size={16}
                    className={energy === opt.value ? "text-sage" : "text-ink-soft"}
                  />
                  <div className="font-medium text-sm mt-1.5">{opt.label}</div>
                  <div className="text-[11px] text-ink-soft leading-tight">
                    {opt.hint}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-meta text-xs uppercase tracking-wide text-ink-soft mb-1.5">
              Craving something specific? (optional)
            </label>
            <input
              type="text"
              value={craving}
              onChange={(e) => setCraving(e.target.value)}
              placeholder="e.g. something spicy, something warm"
              className="w-full border border-clay bg-cream/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage transition-shadow"
            />
          </div>

          <button
            type="submit"
            disabled={!ingredients.trim() || !energy}
            className="w-full flex items-center justify-center gap-2 bg-ink text-cream rounded-xl py-3 font-medium text-sm hover:bg-stamp transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-ink"
          >
            Decide for me
            <ArrowRight size={16} />
          </button>
        </form>
      )}

      {stage === "loading" && (
        <div className="animate-card-in bg-white rounded-2xl card-shadow p-12 text-center">
          <Loader2 className="animate-spin mx-auto mb-3 text-sage" size={28} />
          <p className="font-card text-lg">Thinking, not scrolling…</p>
        </div>
      )}

      {stage === "error" && (
        <div className="animate-card-in bg-white rounded-2xl card-shadow border border-stamp/30 p-7 text-center space-y-4">
          <AlertCircle className="mx-auto text-stamp" size={28} />
          <p className="text-stamp text-sm">{errorMsg}</p>
          <button
            onClick={() => requestRecommendation(sessionId)}
            className="inline-flex items-center gap-2 bg-ink text-cream rounded-xl px-4 py-2.5 text-sm hover:bg-stamp transition-colors"
          >
            <RotateCcw size={14} />
            Try again
          </button>
        </div>
      )}

      {stage === "result" && checkin && (
        <div className="space-y-4">
          <div className="animate-card-in relative bg-white rounded-2xl card-shadow-lg p-7 overflow-hidden">
            <div className="absolute left-0 top-8 bottom-8 w-1 rounded-r bg-sage" />
            {decided && (
              <div className="animate-stamp-in absolute top-6 right-6 flex items-center gap-1.5 border-2 border-stamp text-stamp font-card text-xs tracking-widest uppercase px-3 py-1.5 rotate-6 rounded-md select-none">
                <Stamp size={13} />
                Decided
              </div>
            )}
            <p className="font-meta text-xs uppercase tracking-widest text-sage mb-3 flex items-center gap-1.5">
              <ChefHat size={13} />
              Today&apos;s pick
            </p>
            <h2 className="font-card text-2xl mb-3 pr-20">
              {checkin.dish_name}
            </h2>
            <p className="text-ink-soft text-sm italic mb-6 border-l-2 border-clay pl-3">
              {checkin.dish_reason}
            </p>
            <p className="font-meta text-xs uppercase tracking-wide text-ink-soft mb-2">
              How to make it
            </p>
            <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed">
              {checkin.dish_recipe}
            </pre>
          </div>

          {!decided && (
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                className="flex-1 flex items-center justify-center gap-2 border border-clay bg-white rounded-xl py-3 text-sm hover:border-stamp hover:text-stamp transition-colors"
              >
                <ThumbsDown size={15} />
                Not feeling it
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 flex items-center justify-center gap-2 bg-sage text-cream rounded-xl py-3 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                I&apos;ll make this
              </button>
            </div>
          )}

          {decided && (
            <button
              onClick={startOver}
              className="w-full flex items-center justify-center gap-2 border border-clay bg-white rounded-xl py-3 text-sm hover:border-sage transition-colors"
            >
              <RotateCcw size={15} />
              New check-in
            </button>
          )}

          {rejectedNames.length > 0 && (
            <div className="text-xs text-ink-soft font-meta bg-white/60 rounded-xl px-3.5 py-2.5 border border-clay">
              <span className="uppercase tracking-wide">Not today: </span>
              {rejectedNames.map((name, i) => (
                <span key={i} className="line-through mr-2">
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
