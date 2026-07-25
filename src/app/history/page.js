import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { Clock, TrendingDown, CalendarX, BatteryLow, BatteryMedium, BatteryFull } from "lucide-react";

const ENERGY_ICON = { low: BatteryLow, medium: BatteryMedium, high: BatteryFull };

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
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-sage-dim text-sage flex-shrink-0">
              <Clock size={20} />
            </span>
            <div>
              <p className="font-meta text-xs uppercase tracking-widest text-sage">
                Your patterns
              </p>
              <h1 className="font-card text-2xl leading-tight">History</h1>
            </div>
          </div>

          {topRejected.length > 0 && (
            <div className="bg-white rounded-2xl card-shadow p-5">
              <p className="font-meta text-xs uppercase tracking-wide text-ink-soft mb-3 flex items-center gap-1.5">
                <TrendingDown size={14} className="text-stamp" />
                Dishes you keep saying no to
              </p>
              <div className="flex flex-wrap gap-2">
                {topRejected.map(([name, count]) => (
                  <span
                    key={name}
                    className="text-sm bg-stamp-dim border border-clay rounded-lg px-2.5 py-1.5"
                  >
                    {name} · {count}×
                  </span>
                ))}
              </div>
            </div>
          )}

          {sessions.length === 0 && (
            <div className="bg-white rounded-2xl card-shadow p-10 text-center">
              <CalendarX className="mx-auto mb-3 text-ink-soft" size={28} />
              <p className="text-ink-soft text-sm">
                No check-ins yet — go make your first decision on the Decide
                page.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {sessions.map((session) => {
              const accepted = session.find((r) => r.status === "accepted");
              const rejected = session.filter((r) => r.status === "rejected");
              const latest = session[0];
              const EnergyIcon = ENERGY_ICON[latest.energy] || BatteryMedium;

              return (
                <div
                  key={latest.session_id}
                  className="bg-white rounded-2xl card-shadow p-5 hover:card-shadow-lg transition-shadow"
                >
                  <p className="font-meta text-xs text-ink-soft mb-2 flex items-center gap-1.5">
                    {new Date(latest.created_at).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
                    <span className="inline-flex items-center gap-1 ml-1">
                      <EnergyIcon size={12} />
                      {latest.energy}
                    </span>
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
