"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { pointsForPlace, maxPlaces } from "@/lib/games";
import type { ActionResult } from "@/lib/actions/tournaments";

export type PlaceEntry = { memberId: string; place: number | null; dnf: boolean };

export async function recordTeamRound(
  tournamentId: string,
  teamId: string,
  entries: PlaceEntry[]
): Promise<ActionResult> {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
  });
  if (!tournament) return { error: "Tournament not found." };
  if (tournament.status !== "IN_PROGRESS") {
    return { error: "Tournament isn't running." };
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: true },
  });
  if (!team || team.tournamentId !== tournamentId) {
    return { error: "Team not found." };
  }

  const memberIds = new Set(team.members.map((m) => m.id));
  if (entries.length !== team.members.length) {
    return { error: "Every racer on the team needs a place." };
  }
  const seenMembers = new Set<string>();
  const seenPlaces = new Set<number>();
  const cap = maxPlaces(tournament.game);
  for (const entry of entries) {
    if (!memberIds.has(entry.memberId)) return { error: "Unknown racer." };
    if (seenMembers.has(entry.memberId)) return { error: "Duplicate racer submitted." };
    seenMembers.add(entry.memberId);
    if (entry.dnf) continue;
    if (entry.place === null || entry.place < 1 || entry.place > cap) {
      return { error: "Invalid place." };
    }
    if (seenPlaces.has(entry.place)) return { error: "Two racers can't share a place." };
    seenPlaces.add(entry.place);
  }

  const round = await prisma.round.findUnique({
    where: { tournamentId_index: { tournamentId, index: tournament.round } },
    include: { placements: true },
  });
  if (!round) return { error: "Current race not found." };

  const takenPlaces = new Set(
    round.placements.filter((p) => p.place !== null).map((p) => p.place)
  );
  for (const entry of entries) {
    if (!entry.dnf && entry.place !== null && takenPlaces.has(entry.place)) {
      return { error: `Place ${entry.place} was already taken by another team this race.` };
    }
  }
  const alreadyRecorded = round.placements.some((p) => memberIds.has(p.memberId));
  if (alreadyRecorded) {
    return { error: "This team's race has already been recorded." };
  }

  const pointsFor = (e: PlaceEntry) => (e.dnf ? 0 : pointsForPlace(tournament.game, e.place!));

  await prisma.$transaction([
    prisma.placement.createMany({
      data: entries.map((e) => ({
        memberId: e.memberId,
        roundId: round.id,
        teamId,
        place: e.dnf ? null : e.place,
        dnf: e.dnf,
        points: pointsFor(e),
      })),
    }),
    ...entries.map((e) =>
      prisma.member.update({
        where: { id: e.memberId },
        data: { totalPoints: { increment: pointsFor(e) } },
      })
    ),
  ]);

  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath(`/tournaments/${tournamentId}/display`);
  return {};
}
