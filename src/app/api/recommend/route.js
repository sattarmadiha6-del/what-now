import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRecommendation } from "@/lib/ai/recommend";

export async function POST(request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json();
  const { ingredients, energy, craving, sessionId: incomingSessionId } = body;

  if (!ingredients?.trim() || !energy) {
    return NextResponse.json(
      { error: "Ingredients and energy level are required" },
      { status: 400 }
    );
  }

  const sessionId = incomingSessionId || crypto.randomUUID();

  // Dishes rejected earlier in THIS session (must never repeat)
  const { data: rejectedThisSessionRows } = await supabase
    .from("checkins")
    .select("dish_name")
    .eq("user_id", user.id)
    .eq("session_id", sessionId)
    .eq("status", "rejected");

  // Dishes rejected in past sessions, most recent first (soft pattern signal)
  const { data: rejectedRecentlyRows } = await supabase
    .from("checkins")
    .select("dish_name")
    .eq("user_id", user.id)
    .eq("status", "rejected")
    .neq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(15);

  const rejectedThisSession = (rejectedThisSessionRows || []).map(
    (r) => r.dish_name
  );
  const rejectedRecently = (rejectedRecentlyRows || []).map(
    (r) => r.dish_name
  );

  let recommendation;
  try {
    recommendation = await getRecommendation({
      ingredients,
      energy,
      craving,
      rejectedThisSession,
      rejectedRecently,
    });
  } catch (err) {
    console.error("AI recommendation failed:", err);
    return NextResponse.json(
      { error: "Couldn't get a recommendation right now. Try again." },
      { status: 502 }
    );
  }

  const { data: inserted, error: insertError } = await supabase
    .from("checkins")
    .insert({
      user_id: user.id,
      session_id: sessionId,
      ingredients,
      energy,
      craving: craving || null,
      dish_name: recommendation.dish_name,
      dish_reason: recommendation.reason,
      dish_recipe: recommendation.recipe,
      status: "suggested",
    })
    .select()
    .single();

  if (insertError) {
    console.error("Insert failed:", insertError);
    return NextResponse.json(
      { error: "Couldn't save that recommendation." },
      { status: 500 }
    );
  }

  return NextResponse.json({ sessionId, checkin: inserted });
}
