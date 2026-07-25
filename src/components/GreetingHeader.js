import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function GreetingHeader({ title, subtitle }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const namePart = user?.email ? user.email.split("@")[0] : "Chef";
  const displayName =
    namePart.charAt(0).toUpperCase() + namePart.slice(1);
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        {subtitle && (
          <p className="font-meta text-xs uppercase tracking-widest text-green mb-1">
            {subtitle}
          </p>
        )}
        <h1 className="font-heading font-bold text-2xl leading-tight">
          {title || `Hello, ${displayName}`}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border text-ink-soft">
          <Bell size={17} />
        </span>
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-green text-cream font-heading font-semibold text-sm">
          {initial}
        </span>
      </div>
    </div>
  );
}
