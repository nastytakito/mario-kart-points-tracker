"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Game } from "@/generated/prisma/enums";
import { maxPlaces } from "@/lib/games";

export type ActionResult = { error: string } | { error?: undefined };

function revalidateTournament(id: string) {
  revalidatePath(`/tournaments/${id}`);
  revalidatePath(`/tournaments/${id}/display`);
  revalidatePath("/tournaments");
}

export async function createTournament(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const game = String(formData.get("game") ?? "") as Game;

  if (!name) return { error: "Give the tournament a name." };
  if (!Object.values(Game).includes(game)) return { error: "Pick a game." };

  const tournament = await prisma.tournament.create({
    data: { name, game },
  });

  revalidatePath("/tournaments");
  redirect(`/tournaments/${tournament.id}`);
}

export async function cloneTournament(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const sourceId = String(formData.get("sourceId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Give the new tournament a name." };

  const source = await prisma.tournament.findUnique({
    where: { id: sourceId },
    include: { teams: { include: { members: true } } },
  });
  if (!source) return { error: "Original tournament not found." };

  const created = await prisma.tournament.create({
    data: {
      name,
      game: source.game,
      clonedFrom: source.id,
      teams: {
        create: source.teams.map((team) => ({
          name: team.name,
          members: {
            create: team.members.map((m) => ({ username: m.username })),
          },
        })),
      },
    },
  });

  revalidatePath("/tournaments");
  redirect(`/tournaments/${created.id}`);
}

export async function startTournament(tournamentId: string): Promise<ActionResult> {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { teams: { include: { members: true } } },
  });
  if (!tournament) return { error: "Tournament not found." };
  if (tournament.status !== "SETUP") return { error: "Tournament already started." };
  if (tournament.teams.length < 2) {
    return { error: "You need at least 2 teams to start." };
  }
  if (tournament.teams.some((t) => t.members.length === 0)) {
    return { error: "Every team needs at least one member." };
  }
  const totalMembers = tournament.teams.reduce((s, t) => s + t.members.length, 0);
  const cap = maxPlaces(tournament.game);
  if (totalMembers > cap) {
    return {
      error: `${tournament.game} supports at most ${cap} racers per race — you have ${totalMembers}.`,
    };
  }

  await prisma.$transaction([
    prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: "IN_PROGRESS", round: 1, startedAt: new Date() },
    }),
    prisma.round.create({ data: { tournamentId, index: 1 } }),
  ]);

  revalidateTournament(tournamentId);
  return {};
}

export async function startNextRound(tournamentId: string): Promise<ActionResult> {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      teams: {
        include: { members: { include: { placements: true } } },
      },
    },
  });
  if (!tournament) return { error: "Tournament not found." };
  if (tournament.status !== "IN_PROGRESS") return { error: "Tournament isn't running." };

  const currentRound = await prisma.round.findUnique({
    where: { tournamentId_index: { tournamentId, index: tournament.round } },
    include: { placements: true },
  });
  const allDone = tournament.teams.every(
    (team) =>
      team.members.length > 0 &&
      team.members.every((m) =>
        currentRound?.placements.some((p) => p.memberId === m.id)
      )
  );
  if (!allDone) {
    return { error: "Every team needs to record this race before starting the next one." };
  }

  const nextIndex = tournament.round + 1;
  await prisma.$transaction([
    prisma.round.create({ data: { tournamentId, index: nextIndex } }),
    prisma.tournament.update({
      where: { id: tournamentId },
      data: { round: nextIndex },
    }),
  ]);

  revalidateTournament(tournamentId);
  return {};
}

export async function deleteTournament(tournamentId: string): Promise<ActionResult> {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) return {};

  await prisma.tournament.delete({ where: { id: tournamentId } });

  revalidatePath("/tournaments");
  return {};
}

export async function setTournamentHidden(
  tournamentId: string,
  hidden: boolean
): Promise<ActionResult> {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) return { error: "Tournament not found." };

  await prisma.tournament.update({ where: { id: tournamentId }, data: { hidden } });

  revalidatePath("/tournaments");
  return {};
}

export async function endTournament(tournamentId: string): Promise<ActionResult> {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) return { error: "Tournament not found." };
  if (tournament.status === "ENDED") return {};

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: "ENDED", endedAt: new Date() },
  });

  revalidateTournament(tournamentId);
  return {};
}
