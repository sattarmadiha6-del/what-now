import GreetingHeader from "@/components/GreetingHeader";
import BottomNav from "@/components/BottomNav";
import ExportHistoryButton from "@/components/ExportHistoryButton";
import { createClient } from "@/lib/supabase/server";
import { TrendingDown, CalendarX, Clock, Gauge } from "lucide-react";

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
    .slice(0, 6);

  return (
    <>
      <main className="flex-1 px-4 pt-8 pb-28">
        <div className="max-w-md mx-auto space-y-6">
          <GreetingHeader
            subtitle="Kitchen insights"
            title="Recipe History"
          />

          {topRejected.length > 0 && (
            <div className="bg-card rounded-3xl card-shadow p-5">
              <p className="font-heading font-semibold text-sm mb-3 flex items-center gap-1.5">
                <TrendingDown size={15} className="text-danger" />
                Foods you usually skip
              </p>
              <div className="flex flex-wrap gap-2">
                {topRejected.map(([name]) => (
                  <span
                    key={name}
                    className="text-xs font-medium bg-tag text-tag-text rounded-full px-3 py-1.5"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="font-heading font-semibold text-sm">
              Past sessions
            </p>
            <ExportHistoryButton rows={rows || []} />
          </div>

          {sessions.length === 0 && (
            <div className="bg-card rounded-3xl card-shadow p-10 text-center">
              <CalendarX className="mx-auto mb-3 text-ink-soft" size={28} />
              <p className="text-ink-soft text-sm">
                No check-ins yet — head to Home to make your first decision.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {sessions.map((session) => {
              const accepted = session.find((r) => r.status === "accepted");
              const rejected = session.filter((r) => r.status === "rejected");
              const latest = session[0];
              const dish = accepted || latest;
              const isDecided = !!accepted;

              return (
                <div
                  key={latest.session_id}
                  className="bg-card rounded-3xl card-shadow overflow-hidden"
                >
                  <div className="relative h-24 bg-gradient-to-br from-green to-green-dark flex items-end p-4">
                    <span
                      className={`absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        isDecided
                          ? "bg-cream text-green"
                          : "bg-danger-tint text-danger"
                      }`}
                    >
                      {isDecided ? "✓ Decided" : "✕ Undecided"}
                    </span>
                    <p className="font-heading font-bold text-lg text-cream leading-tight pr-24">
                      {dish.dish_name}
                    </p>
                  </div>

                  <div className="p-4 space-y-2">
                    <p className="font-meta text-xs text-ink-soft flex items-center gap-3">
                      {new Date(latest.created_at).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                      <span className="flex items-center gap-1">
                        <Gauge size={12} />
                        {latest.energy}
                      </span>
                      {dish.time_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {dish.time_minutes}m
                        </span>
                      )}
                    </p>

                    <p className="text-xs text-ink-soft">
                      <span className="font-medium">Ingredients: </span>
                      {latest.ingredients}
                    </p>

                    {rejected.length > 0 && (
                      <p className="text-xs text-ink-soft font-meta pt-1">
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
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
