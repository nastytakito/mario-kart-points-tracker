"use client";

import { useActionState } from "react";
import { cloneTournament } from "@/lib/actions/tournaments";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";
import { GAME_CONFIG, Game } from "@/lib/games";

type EndedTournament = { id: string; name: string; game: Game };

export function CloneTournamentForm({
  tournaments,
  defaultSourceId,
}: {
  tournaments: EndedTournament[];
  defaultSourceId?: string;
}) {
  const [state, formAction, pending] = useActionState(cloneTournament, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground-dim" htmlFor="sourceId">
          Based on
        </label>
        <Select id="sourceId" name="sourceId" required defaultValue={defaultSourceId}>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} · {GAME_CONFIG[t.game].shortLabel}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground-dim" htmlFor="cloneName">
          New tournament name
        </label>
        <Input id="cloneName" name="name" placeholder="Friday Night Karting — Round 2" required />
      </div>

      <FormError message={state.error} />

      <Button type="submit" disabled={pending} variant="blue">
        {pending ? "Creating…" : "Create From Previous"}
      </Button>
    </form>
  );
}
