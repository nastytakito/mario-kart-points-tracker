"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTournament, setTournamentHidden } from "@/lib/actions/tournaments";

export function TournamentRowActions({
  id,
  hidden,
}: {
  id: string;
  hidden: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        title={hidden ? "Unhide tournament" : "Hide tournament"}
        disabled={isPending}
        onClick={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const res = await setTournamentHidden(id, !hidden);
            if (res.error) setError(res.error);
            router.refresh();
          });
        }}
        className="text-xs font-semibold text-foreground-dim hover:text-brand-blue px-2 py-1.5 rounded-lg hover:bg-background-elevated disabled:opacity-40"
      >
        {hidden ? "Unhide" : "Hide"}
      </button>
      <button
        type="button"
        title="Delete tournament"
        disabled={isPending}
        onClick={(e) => {
          e.preventDefault();
          if (
            !confirm(
              "Permanently delete this tournament and all of its teams, racers, and race history? This can't be undone."
            )
          )
            return;
          startTransition(async () => {
            const res = await deleteTournament(id);
            if (res.error) setError(res.error);
            router.refresh();
          });
        }}
        className="text-xs font-semibold text-foreground-dim hover:text-brand-red px-2 py-1.5 rounded-lg hover:bg-background-elevated disabled:opacity-40"
      >
        Delete
      </button>
      {error && <span className="text-brand-red text-xs">{error}</span>}
    </div>
  );
}
