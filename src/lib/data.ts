import { prisma } from "@/lib/prisma";
import { buildTournamentView } from "@/lib/view";

const tournamentInclude = {
  teams: {
    orderBy: { createdAt: "asc" as const },
    include: {
      members: {
        orderBy: { createdAt: "asc" as const },
        include: {
          placements: {
            include: { round: { select: { index: true } } },
          },
        },
      },
    },
  },
};

export async function getTournamentView(id: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: tournamentInclude,
  });
  if (!tournament) return null;
  return buildTournamentView(tournament);
}

export async function listTournaments({ hidden = false }: { hidden?: boolean } = {}) {
  const tournaments = await prisma.tournament.findMany({
    where: { hidden },
    orderBy: { createdAt: "desc" },
    include: {
      teams: {
        select: {
          id: true,
          members: { select: { id: true } },
        },
      },
    },
  });

  return tournaments.map((t) => ({
    id: t.id,
    name: t.name,
    game: t.game,
    status: t.status,
    hidden: t.hidden,
    createdAt: t.createdAt,
    teamCount: t.teams.length,
    memberCount: t.teams.reduce((sum, team) => sum + team.members.length, 0),
  }));
}

export async function getRaceEntryData(tournamentId: string, teamId: string) {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament || tournament.status !== "IN_PROGRESS") return null;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: { orderBy: { createdAt: "asc" }, select: { id: true, username: true } } },
  });
  if (!team || team.tournamentId !== tournamentId) return null;

  const round = await prisma.round.findUnique({
    where: { tournamentId_index: { tournamentId, index: tournament.round } },
    include: { placements: { select: { place: true, memberId: true } } },
  });

  const memberIds = new Set(team.members.map((m) => m.id));
  const alreadyDone = team.members.length > 0 &&
    team.members.every((m) => round?.placements.some((p) => p.memberId === m.id));
  const takenPlaces = (round?.placements ?? [])
    .filter((p) => !memberIds.has(p.memberId) && p.place !== null)
    .map((p) => p.place as number);

  return {
    game: tournament.game,
    round: tournament.round,
    team: { id: team.id, name: team.name, members: team.members },
    takenPlaces,
    alreadyDone,
  };
}

export async function listEndedTournaments() {
  return prisma.tournament.findMany({
    where: { status: "ENDED", hidden: false },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, game: true, createdAt: true },
  });
}
