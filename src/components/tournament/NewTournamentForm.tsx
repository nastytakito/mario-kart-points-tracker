"use client";

import { useActionState } from "react";
import { createTournament } from "@/lib/actions/tournaments";
import { GAME_OPTIONS } from "@/lib/games";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";

export function NewTournamentForm() {
  const [state, formAction, pending] = useActionState(createTournament, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground-dim" htmlFor="name">
          Tournament name
        </label>
        <Input id="name" name="name" placeholder="Friday Night Karting" required autoFocus />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground-dim" htmlFor="game">
          Game
        </label>
        <Select id="game" name="game" defaultValue={GAME_OPTIONS[1].value}>
          {GAME_OPTIONS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </Select>
      </div>

      <FormError message={state.error} />

      <Button type="submit" disabled={pending} variant="red">
        {pending ? "Creating…" : "Create Tournament"}
      </Button>
    </form>
  );
}
