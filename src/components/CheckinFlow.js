"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  UtensilsCrossed,
  Loader2,
  AlertCircle,
  Heart,
  RotateCcw,
  Clock,
  Gauge,
  RefreshCw,
} from "lucide-react";

const ENERGY_OPTIONS = ["Low", "Medium", "High"];

function parseIngredientList(ingredients) {
  return ingredients
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);
}

function parseRecipeSteps(recipe) {
  return recipe
    .split("\n")
    .map((line) => line.replace(/^\s*\d+[.)]\s*/, "").trim())
    .filter(Boolean);
}

export default function CheckinFlow() {
  const [stage, setStage] = useState("form"); // form | loading | result | error
  const [ingredients, setIngredients] = useState("");
  const [energy, setEnergy] = useState("");
  const [craving, setCraving] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [checkin, setCheckin] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [rejectedNames, setRejectedNames] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [decided, setDecided] = useState(false);

  const ingredientList = useMemo(
    () => (checkin ? parseIngredientList(checkin.ingredients) : []),
    [checkin]
  );
  const recipeSteps = useMemo(
    () => (checkin ? parseRecipeSteps(checkin.dish_recipe) : []),
    [checkin]
  );

  async function requestRecommendation(currentSessionId) {
    setStage("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients,
          energy: energy.toLowerCase(),
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
      setCheckedItems({});
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
    <div className="w-full max-w-md mx-auto">
      {stage === "form" && (
        <form
          onSubmit={handleSubmit}
          className="animate-card-in bg-card rounded-3xl card-shadow-lg p-6 space-y-6"
        >
          <h2 className="font-heading font-bold text-xl">
            What do you have today?
          </h2>

          <div>
            <label className="block font-meta text-xs uppercase tracking-wide text-ink-soft mb-2">
              Ingredients
            </label>
            <div className="relative">
              <textarea
                required
                rows={3}
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="Eggs, tomatoes, bread..."
                className="w-full border border-border bg-cream rounded-2xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-green resize-none"
              />
              <UtensilsCrossed
                size={16}
                className="absolute right-4 bottom-3.5 text-ink-soft"
              />
            </div>
          </div>

          <div>
            <label className="block font-meta text-xs uppercase tracking-wide text-ink-soft mb-2">
              Cooking energy
            </label>
            <div className="flex gap-2">
              {ENERGY_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setEnergy(opt)}
                  className={`flex-1 rounded-full py-2.5 text-sm font-medium border transition-colors ${
                    energy === opt
                      ? "bg-green text-cream border-green"
                      : "bg-cream text-ink-soft border-border hover:border-green/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-meta text-xs uppercase tracking-wide text-ink-soft mb-2">
              Craving
            </label>
            <div className="relative">
              <input
                type="text"
                value={craving}
                onChange={(e) => setCraving(e.target.value)}
                placeholder="Something spicy..."
                className="w-full border border-border bg-cream rounded-2xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-green"
              />
              <Sparkles
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!ingredients.trim() || !energy}
            className="w-full flex items-center justify-center gap-2 bg-green text-cream rounded-full py-3.5 font-medium text-sm hover:bg-green-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Suggest My Meal
            <Sparkles size={16} />
          </button>
        </form>
      )}

      {stage === "loading" && (
        <div className="animate-card-in bg-card rounded-3xl card-shadow p-12 text-center">
          <Loader2 className="animate-spin mx-auto mb-3 text-green" size={28} />
          <p className="font-heading font-medium">Thinking, not scrolling…</p>
        </div>
      )}

      {stage === "error" && (
        <div className="animate-card-in bg-card rounded-3xl card-shadow border border-danger/30 p-7 text-center space-y-4">
          <AlertCircle className="mx-auto text-danger" size={28} />
          <p className="text-danger text-sm">{errorMsg}</p>
          <button
            onClick={() => requestRecommendation(sessionId)}
            className="inline-flex items-center gap-2 bg-green text-cream rounded-full px-5 py-2.5 text-sm hover:bg-green-dark transition-colors"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      )}

      {stage === "result" && checkin && (
        <div className="space-y-4">
          <div className="animate-card-in bg-card rounded-3xl card-shadow-lg overflow-hidden">
            {/* photo-style hero block */}
            <div className="relative h-44 bg-gradient-to-br from-green to-green-dark flex items-end p-5">
              {decided && (
                <span className="animate-badge-in absolute top-4 right-4 flex items-center gap-1 bg-cream text-green text-xs font-semibold px-3 py-1 rounded-full">
                  ✓ Decided
                </span>
              )}
              <div>
                <h2 className="font-heading font-bold text-2xl text-cream leading-tight">
                  {checkin.dish_name}
                </h2>
                <div className="flex items-center gap-3 mt-2 text-cream/85 text-xs font-medium">
                  {checkin.time_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      {checkin.time_minutes}m
                    </span>
                  )}
                  {checkin.difficulty && (
                    <span className="flex items-center gap-1">
                      <Gauge size={13} />
                      {checkin.difficulty}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-green-tint rounded-2xl px-4 py-3">
                <p className="font-meta text-[11px] uppercase tracking-widest text-green mb-1">
                  Today&apos;s selection
                </p>
                <p className="text-sm italic text-ink">
                  &ldquo;{checkin.dish_reason}&rdquo;
                </p>
              </div>

              {ingredientList.length > 0 && (
                <div>
                  <p className="font-heading font-semibold text-sm mb-2.5">
                    Pantry checklist
                  </p>
                  <div className="space-y-1.5">
                    {ingredientList.map((item, i) => (
                      <label
                        key={i}
                        className="flex items-center gap-2.5 text-sm cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={!!checkedItems[i]}
                          onChange={() =>
                            setCheckedItems((prev) => ({
                              ...prev,
                              [i]: !prev[i],
                            }))
                          }
                          className="w-4 h-4 rounded accent-green"
                        />
                        <span
                          className={
                            checkedItems[i]
                              ? "line-through text-ink-soft"
                              : "text-ink"
                          }
                        >
                          {item}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {recipeSteps.length > 0 && (
                <div>
                  <p className="font-heading font-semibold text-sm mb-2.5">
                    The flow
                  </p>
                  <ol className="space-y-3">
                    {recipeSteps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="font-meta text-xs text-green font-medium flex-shrink-0 pt-0.5">
                          {String(i + 1).padStart(2, "0")}.
                        </span>
                        <span className="text-ink leading-relaxed">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>

          {!decided ? (
            <div className="space-y-2.5">
              <button
                onClick={handleAccept}
                className="w-full flex items-center justify-center gap-2 bg-green text-cream rounded-full py-3.5 text-sm font-medium hover:bg-green-dark transition-colors"
              >
                <Heart size={16} />
                I&apos;ll make this
              </button>
              <button
                onClick={handleReject}
                className="w-full flex items-center justify-center gap-2 border border-border bg-card rounded-full py-3.5 text-sm text-ink-soft hover:border-danger hover:text-danger transition-colors"
              >
                <RotateCcw size={15} />
                Not feeling it
              </button>
            </div>
          ) : (
            <button
              onClick={startOver}
              className="w-full flex items-center justify-center gap-2 border border-border bg-card rounded-full py-3.5 text-sm hover:border-green transition-colors"
            >
              <RefreshCw size={15} />
              New check-in
            </button>
          )}

          {rejectedNames.length > 0 && (
            <div className="text-xs text-ink-soft font-meta bg-card rounded-2xl px-4 py-2.5 border border-border">
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
