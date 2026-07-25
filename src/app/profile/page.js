import GreetingHeader from "@/components/GreetingHeader";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/server";
import { LogOut, ChefHat, ThumbsUp, ThumbsDown } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("checkins")
    .select("status")
    .eq("user_id", user.id);

  const total = rows?.length || 0;
  const accepted = rows?.filter((r) => r.status === "accepted").length || 0;
  const rejected = rows?.filter((r) => r.status === "rejected").length || 0;

  return (
    <>
      <main className="flex-1 px-4 pt-8 pb-28">
        <div className="max-w-md mx-auto space-y-6">
          <GreetingHeader subtitle="Your account" title="Profile" />

          <div className="bg-card rounded-3xl card-shadow p-6 text-center">
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green text-cream font-heading font-bold text-2xl mb-3">
              {user.email.charAt(0).toUpperCase()}
            </span>
            <p className="font-heading font-semibold text-base">
              {user.email}
            </p>
            <p className="text-xs text-ink-soft mt-1">
              Member since{" "}
              {new Date(user.created_at).toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card rounded-2xl card-shadow p-4 text-center">
              <ChefHat className="mx-auto mb-1.5 text-green" size={18} />
              <p className="font-heading font-bold text-lg">{total}</p>
              <p className="text-[11px] text-ink-soft">Check-ins</p>
            </div>
            <div className="bg-card rounded-2xl card-shadow p-4 text-center">
              <ThumbsUp className="mx-auto mb-1.5 text-green" size={18} />
              <p className="font-heading font-bold text-lg">{accepted}</p>
              <p className="text-[11px] text-ink-soft">Decided</p>
            </div>
            <div className="bg-card rounded-2xl card-shadow p-4 text-center">
              <ThumbsDown className="mx-auto mb-1.5 text-danger" size={18} />
              <p className="font-heading font-bold text-lg">{rejected}</p>
              <p className="text-[11px] text-ink-soft">Skipped</p>
            </div>
          </div>

          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 border border-border bg-card rounded-full py-3.5 text-sm text-ink-soft hover:border-danger hover:text-danger transition-colors"
            >
              <LogOut size={15} />
              Log out
            </button>
          </form>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
