"use client";

import { useState, useTransition } from "react";
import { RosterManager } from "@/components/tournament/RosterManager";
import { startTournament } from "@/lib/actions/tournaments";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import type { TournamentView } from "@/lib/view";

export function SetupBoard({ view }: { view: TournamentView }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <div className="flex flex-col gap-6">
      <RosterManager tournamentId={view.id} teams={view.teams} locked={false} />

      <div className="flex flex-col items-center gap-3 pt-4">
        <FormError message={error} />
        <Button
          size="xl"
          variant="green"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const res = await startTournament(view.id);
              setError(res.error);
            })
          }
        >
          {isPending ? "Starting…" : "🏁 Start Tournament"}
        </Button>
        <p className="text-xs text-foreground-dim">
          {view.totalMembers} racer{view.totalMembers === 1 ? "" : "s"} across{" "}
          {view.teams.length} team{view.teams.length === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}
