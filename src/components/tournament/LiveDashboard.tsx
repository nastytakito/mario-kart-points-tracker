"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TeamBanner } from "@/components/tournament/TeamBanner";
import { RosterManager } from "@/components/tournament/RosterManager";
import { WakeLockBadge } from "@/components/WakeLockBadge";
import { AutoRefresh } from "@/components/AutoRefresh";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { startNextRound, endTournament } from "@/lib/actions/tournaments";
import type { TournamentView } from "@/lib/view";

export function LiveDashboard({ view }: { view: TournamentView }) {
  const router = useRouter();
  const [rosterOpen, setRosterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <div className="flex flex-col gap-6">
      <AutoRefresh intervalMs={4000} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold bg-background-elevated border border-border rounded-full px-4 py-1.5">
            Race #{view.round}
          </span>
          <WakeLockBadge />
        </div>
        <Button
          variant={view.allTeamsDoneCurrentRound ? "green" : "ghost"}
          size="md"
          disabled={!view.allTeamsDoneCurrentRound || isPending}
          onClick={() =>
            startTransition(async () => {
              const res = await startNextRound(view.id);
              setError(res.error);
              router.refresh();
            })
          }
        >
          {isPending ? "Starting…" : "🏁 Start Race!"}
        </Button>
      </div>

      <FormError message={error} />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {view.teams.map((team, i) => (
          <TeamBanner
            key={team.id}
            team={team}
            index={i}
            tournamentId={view.id}
            interactive
          />
        ))}
      </div>

      <div className="pt-4 border-t border-border flex flex-col gap-4">
        <button
          onClick={() => setRosterOpen((v) => !v)}
          className="text-sm font-semibold text-foreground-dim hover:text-foreground self-start"
        >
          {rosterOpen ? "▾" : "▸"} Manage roster (rename or move racers)
        </button>
        {rosterOpen && (
          <RosterManager tournamentId={view.id} teams={view.teams} locked />
        )}
      </div>

      <EndTournamentButton tournamentId={view.id} />
    </div>
  );
}

function EndTournamentButton({ tournamentId }: { tournamentId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="self-center pt-2">
      <button
        onClick={() => {
          if (
            !confirm(
              "End the tournament? Points will be locked and the final stats screen will be shown."
            )
          )
            return;
          startTransition(async () => {
            await endTournament(tournamentId);
            router.refresh();
          });
        }}
        disabled={isPending}
        className="text-xs text-foreground-dim hover:text-brand-red underline underline-offset-4 disabled:opacity-40"
      >
        {isPending ? "Ending…" : "End Tournament"}
      </button>
    </div>
  );
}
