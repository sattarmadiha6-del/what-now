import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";

function groupBySession(rows) {
  const sessions = new Map();
  for (const row of rows) {
    if (!sessions.has(row.session_id)) {
      sessions.set(row.session_id, []);
    }
    sessions.get(row.session_id).push(row);
  }
  return Array.from(sessions.values());
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("checkins")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const sessions = groupBySession(rows || []);

  const rejectionCounts = {};
  for (const row of rows || []) {
    if (row.status === "rejected") {
      rejectionCounts[row.dish_name] =
        (rejectionCounts[row.dish_name] || 0) + 1;
    }
  }
  const topRejected = Object.entries(rejectionCounts)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-10">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <p className="font-meta text-xs uppercase tracking-widest text-sage mb-1">
              Your patterns
            </p>
            <h1 className="font-card text-2xl">History</h1>
          </div>

          {topRejected.length > 0 && (
            <div className="bg-stamp-dim border border-clay rounded-sm p-4">
              <p className="font-meta text-xs uppercase tracking-wide text-ink-soft mb-2">
                Dishes you keep saying no to
              </p>
              <div className="flex flex-wrap gap-2">
                {topRejected.map(([name, count]) => (
                  <span
                    key={name}
                    className="text-sm bg-white/70 border border-clay rounded-sm px-2 py-1"
                  >
                    {name} · {count}×
                  </span>
                ))}
              </div>
            </div>
          )}

          {sessions.length === 0 && (
            <p className="text-ink-soft text-sm">
              No check-ins yet — go make your first decision on the Decide
              page.
            </p>
          )}

          <div className="space-y-4">
            {sessions.map((session) => {
              const accepted = session.find((r) => r.status === "accepted");
              const rejected = session.filter((r) => r.status === "rejected");
              const latest = session[0];

              return (
                <div
                  key={latest.session_id}
                  className="bg-white/60 border border-clay rounded-sm p-5"
                >
                  <p className="font-meta text-xs text-ink-soft mb-2">
                    {new Date(latest.created_at).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric", year: "numeric" }
                    )}{" "}
                    · energy: {latest.energy}
                  </p>

                  {accepted ? (
                    <p className="font-card text-lg mb-1">
                      {accepted.dish_name}
                    </p>
                  ) : (
                    <p className="font-card text-lg mb-1 text-ink-soft">
                      Undecided
                    </p>
                  )}

                  {rejected.length > 0 && (
                    <p className="text-xs text-ink-soft font-meta">
                      <span className="uppercase tracking-wide">
                        Not today:{" "}
                      </span>
                      {rejected.map((r, i) => (
                        <span key={i} className="line-through mr-2">
                          {r.dish_name}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
