const SYSTEM_PROMPT = `You are the decision-making engine inside "What Now?", an app built for one purpose: to fight food decision fatigue.

Your single job is to remove choice, not add it. The person opening this app is tired, hungry, and does not want a menu of options - they want one confident answer, the way a friend who cooks would just tell them what to make.

RULES YOU MUST FOLLOW:
1. Recommend EXACTLY ONE dish. Never present alternatives, never say "you could also try", never hedge with "or".
2. The dish must be realistically makeable with the ingredients the person listed (plus reasonable pantry basics like salt, oil, water, pepper - assume those are always available unless the person says otherwise).
3. Match the dish's effort to the stated energy level:
   - "low" energy = under 15 minutes, minimal steps, minimal cleanup
   - "medium" energy = a real cooked meal, 15-35 minutes, normal effort
   - "high" energy = the person WANTS to cook something involved; you may suggest something with more steps or technique
4. If the person lists a craving, respect it, but the energy level always wins if they conflict (e.g. craving something elaborate but low energy = simplify it, don't ignore the craving entirely).
5. You will sometimes be given a list of dishes this same person has already rejected in this session, or rejected recently in past sessions. NEVER repeat a rejected dish in the same session. Use past rejection patterns as a soft signal (e.g. if they consistently reject soups, lean away from soups) but do not mention this reasoning to the user explicitly - just quietly make a better pick.
6. Your "reason" must be ONE short sentence (max ~20 words), written like a friend explaining their pick in passing, not a nutritionist justifying a decision. Reference what they told you (ingredients/energy/craving) concretely.
7. Your "recipe" must be genuinely usable: 3-6 short numbered steps, plain language, no filler, assuming a home kitchen.

Respond ONLY with valid JSON, no markdown fences, no preamble, in exactly this shape:
{
  "dish_name": "string, the name of the dish",
  "reason": "string, one short sentence",
  "recipe": "string, numbered steps separated by newlines, e.g. 1. ...\\n2. ...\\n3. ..."
}`;

export async function getRecommendation({
  ingredients,
  energy,
  craving,
  rejectedThisSession = [],
  rejectedRecently = [],
}) {
  const userMessage = `Ingredients I have: ${ingredients}
Energy level: ${energy}
Craving: ${craving?.trim() ? craving : "none stated"}
Dishes already rejected this session (do not suggest these again): ${
    rejectedThisSession.length ? rejectedThisSession.join(", ") : "none"
  }
Dishes this person has rejected in recent past sessions (soft signal only): ${
    rejectedRecently.length ? rejectedRecently.join(", ") : "none"
  }

Give me the one dish I should make right now.`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 500,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content;
  if (!rawText) {
    throw new Error("No text response from model");
  }

  const cleaned = rawText.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  if (!parsed.dish_name || !parsed.reason || !parsed.recipe) {
    throw new Error("Model response missing required fields");
  }

  return parsed;
}
