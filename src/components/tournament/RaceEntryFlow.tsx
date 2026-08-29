"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PlaceCarousel } from "@/components/tournament/PlaceCarousel";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { recordTeamRound, type PlaceEntry } from "@/lib/actions/placements";

export function RaceEntryFlow({
  tournamentId,
  teamId,
  teamName,
  members,
  maxPlaces,
  takenPlaces,
  round,
}: {
  tournamentId: string;
  teamId: string;
  teamName: string;
  members: { id: string; username: string }[];
  maxPlaces: number;
  takenPlaces: number[];
  round: number;
}) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [assignments, setAssignments] = useState<PlaceEntry[]>([]);
  const [centerValue, setCenterValue] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const usedThisRound = useMemo(
    () =>
      new Set([
        ...takenPlaces,
        ...assignments.filter((a) => !a.dnf && a.place !== null).map((a) => a.place as number),
      ]),
    [takenPlaces, assignments]
  );

  const options = useMemo(
    () =>
      Array.from({ length: maxPlaces }, (_, i) => i + 1).filter(
        (p) => !usedThisRound.has(p)
      ),
    [maxPlaces, usedThisRound]
  );

  const currentMember = members[currentIndex];
  const isLast = currentIndex === members.length - 1;

  function advance(entry: PlaceEntry) {
    const next = [...assignments, entry];

    if (!isLast) {
      setAssignments(next);
      setCenterValue(null);
      setCurrentIndex((i) => i + 1);
      return;
    }

    startTransition(async () => {
      const res = await recordTeamRound(tournamentId, teamId, next);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.push(`/tournaments/${tournamentId}`);
    });
  }

  function handleConfirm() {
    if (centerValue === null || !currentMember) return;
    advance({ memberId: currentMember.id, place: centerValue, dnf: false });
  }

  function handleDnf() {
    if (!currentMember) return;
    advance({ memberId: currentMember.id, place: null, dnf: true });
  }

  if (!currentMember) {
    return <p className="text-center text-foreground-dim">This team has no racers.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-8 py-10">
      <div className="text-center flex flex-col gap-1">
        <span className="text-sm uppercase tracking-[0.2em] text-foreground-dim">
          {teamName} · Race #{round}
        </span>
        <h2 className="text-4xl font-extrabold animate-pop-in" key={currentMember.id}>
          {currentMember.username}
        </h2>
        <span className="text-foreground-dim text-sm">
          Racer {currentIndex + 1} of {members.length}
        </span>
      </div>

      <PlaceCarousel
        key={currentMember.id}
        options={options}
        value={centerValue}
        onCenterChange={setCenterValue}
      />

      <FormError message={error} />

      <div className="flex flex-col items-center gap-3 w-full">
        <Button
          size="xl"
          variant="green"
          disabled={centerValue === null || isPending}
          onClick={handleConfirm}
        >
          {isPending
            ? "Saving…"
            : isLast
              ? `Confirm P${centerValue ?? ""} & Finish`
              : `Confirm P${centerValue ?? ""} & Next`}
        </Button>

        <button
          type="button"
          onClick={handleDnf}
          disabled={isPending}
          className="text-sm font-semibold text-brand-red/80 hover:text-brand-red underline underline-offset-4 disabled:opacity-40"
        >
          Didn&apos;t finish (DNF) · 0 pts
        </button>
      </div>

      <div className="flex gap-1.5">
        {members.map((m, i) => (
          <span
            key={m.id}
            className={`w-2.5 h-2.5 rounded-full ${
              i < currentIndex
                ? "bg-brand-green"
                : i === currentIndex
                  ? "bg-brand-blue"
                  : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
