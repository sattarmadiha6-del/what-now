"use client";

import { useState } from "react";

const ENERGY_OPTIONS = [
  { value: "low", label: "Low", hint: "just get me fed" },
  { value: "medium", label: "Medium", hint: "a real meal is fine" },
  { value: "high", label: "High", hint: "I actually want to cook" },
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
          className="bg-white/60 border border-clay rounded-sm p-6 space-y-6"
        >
          <div>
            <p className="font-card text-2xl mb-1">What&apos;s in reach?</p>
            <p className="text-sm text-ink-soft">
              No menu, no scrolling. Tell me what you&apos;ve got and I&apos;ll decide.
            </p>
          </div>

          <div>
            <label className="block font-meta text-xs uppercase tracking-wide text-ink-soft mb-1">
              Ingredients you have
            </label>
            <textarea
              required
              rows={3}
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="e.g. eggs, half a loaf of bread, tomatoes, cheddar"
              className="w-full border border-clay bg-cream rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage resize-none"
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
                  className={`rounded-sm border px-3 py-2 text-left transition-colors ${
                    energy === opt.value
                      ? "border-sage bg-sage-dim"
                      : "border-clay bg-cream hover:border-sage"
                  }`}
                >
                  <div className="font-medium text-sm">{opt.label}</div>
                  <div className="text-xs text-ink-soft">{opt.hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-meta text-xs uppercase tracking-wide text-ink-soft mb-1">
              Craving something specific? (optional)
            </label>
            <input
              type="text"
              value={craving}
              onChange={(e) => setCraving(e.target.value)}
              placeholder="e.g. something spicy, something warm"
              className="w-full border border-clay bg-cream rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage"
            />
          </div>

          <button
            type="submit"
            disabled={!ingredients.trim() || !energy}
            className="w-full bg-ink text-cream rounded-sm py-2.5 font-medium hover:bg-ink-soft transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Decide for me
          </button>
        </form>
      )}

      {stage === "loading" && (
        <div className="bg-white/60 border border-clay rounded-sm p-10 text-center">
          <p className="font-card text-lg animate-pulse">
            Thinking, not scrolling…
          </p>
        </div>
      )}

      {stage === "error" && (
        <div className="bg-white/60 border border-stamp rounded-sm p-6 text-center space-y-4">
          <p className="text-stamp text-sm">{errorMsg}</p>
          <button
            onClick={() => requestRecommendation(sessionId)}
            className="bg-ink text-cream rounded-sm px-4 py-2 text-sm hover:bg-ink-soft transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {stage === "result" && checkin && (
        <div className="space-y-4">
          <div className="relative bg-white border border-clay rounded-sm p-7">
            {decided && (
              <div className="absolute top-5 right-5 border-2 border-stamp text-stamp font-card text-xs tracking-widest uppercase px-3 py-1 rotate-6 rounded-sm select-none">
                Decided
              </div>
            )}
            <p className="font-meta text-xs uppercase tracking-widest text-sage mb-3">
              Today&apos;s pick
            </p>
            <h2 className="font-card text-2xl mb-3 pr-24">
              {checkin.dish_name}
            </h2>
            <p className="text-ink-soft text-sm italic mb-6">
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
                className="flex-1 border border-clay rounded-sm py-2.5 text-sm hover:border-stamp hover:text-stamp transition-colors"
              >
                Not feeling it
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 bg-sage text-cream rounded-sm py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                I&apos;ll make this
              </button>
            </div>
          )}

          {decided && (
            <button
              onClick={startOver}
              className="w-full border border-clay rounded-sm py-2.5 text-sm hover:border-sage transition-colors"
            >
              New check-in
            </button>
          )}

          {rejectedNames.length > 0 && (
            <div className="text-xs text-ink-soft font-meta">
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
