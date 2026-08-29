import { Game, TournamentStatus } from "@/generated/prisma/enums";
import { pointsForPlace } from "@/lib/games";

export type MemberView = {
  id: string;
  username: string;
  totalPoints: number;
  racesPlayed: number;
  avgPoints: number;
  lastPlace: number | null;
  lastPoints: number | null;
  lastDnf: boolean;
};

export type TeamView = {
  id: string;
  name: string;
  totalPoints: number;
  avgPointsPerMember: number;
  members: MemberView[];
  doneCurrentRound: boolean;
};

export type TournamentView = {
  id: string;
  name: string;
  game: Game;
  status: TournamentStatus;
  round: number;
  clonedFrom: string | null;
  createdAt: Date;
  teams: TeamView[];
  allTeamsDoneCurrentRound: boolean;
  totalMembers: number;
};

type RawPlacement = {
  place: number | null;
  dnf: boolean;
  points: number;
  roundId: string;
  round: { index: number };
};

type RawMember = {
  id: string;
  username: string;
  totalPoints: number;
  placements: RawPlacement[];
};

type RawTeam = {
  id: string;
  name: string;
  members: RawMember[];
};

type RawTournament = {
  id: string;
  name: string;
  game: Game;
  status: TournamentStatus;
  round: number;
  clonedFrom: string | null;
  createdAt: Date;
  teams: RawTeam[];
};

export function buildTournamentView(t: RawTournament): TournamentView {
  const teams: TeamView[] = t.teams.map((team) => {
    const members: MemberView[] = team.members.map((member) => {
      const racesPlayed = member.placements.length;
      const last = member.placements.reduce<RawPlacement | null>(
        (acc, p) => (acc === null || p.round.index > acc.round.index ? p : acc),
        null
      );
      return {
        id: member.id,
        username: member.username,
        totalPoints: member.totalPoints,
        racesPlayed,
        avgPoints: racesPlayed > 0 ? member.totalPoints / racesPlayed : 0,
        lastPlace: last && !last.dnf ? last.place : null,
        lastPoints: last?.points ?? null,
        lastDnf: last?.dnf ?? false,
      };
    });

    const totalPoints = members.reduce((sum, m) => sum + m.totalPoints, 0);
    const doneCurrentRound =
      members.length > 0 &&
      members.every((m) =>
        team.members
          .find((raw) => raw.id === m.id)!
          .placements.some((p) => p.round.index === t.round)
      );

    return {
      id: team.id,
      name: team.name,
      totalPoints,
      avgPointsPerMember: members.length > 0 ? totalPoints / members.length : 0,
      members,
      doneCurrentRound: t.status === "IN_PROGRESS" ? doneCurrentRound : false,
    };
  });

  const totalMembers = teams.reduce((sum, tm) => sum + tm.members.length, 0);

  return {
    id: t.id,
    name: t.name,
    game: t.game,
    status: t.status,
    round: t.round,
    clonedFrom: t.clonedFrom,
    createdAt: t.createdAt,
    teams,
    allTeamsDoneCurrentRound:
      teams.length > 0 && teams.every((team) => team.doneCurrentRound),
    totalMembers,
  };
}

export type LeaderboardEntry = {
  memberId: string;
  username: string;
  teamName: string;
  totalPoints: number;
  avgPoints: number;
  racesPlayed: number;
};

export function buildLeaderboard(view: TournamentView): LeaderboardEntry[] {
  return view.teams
    .flatMap((team) =>
      team.members.map((m) => ({
        memberId: m.id,
        username: m.username,
        teamName: team.name,
        totalPoints: m.totalPoints,
        avgPoints: m.avgPoints,
        racesPlayed: m.racesPlayed,
      }))
    )
    .sort((a, b) => b.totalPoints - a.totalPoints);
}

export function teamLeaderboard(view: TournamentView): TeamView[] {
  return [...view.teams].sort((a, b) => b.totalPoints - a.totalPoints);
}

export { pointsForPlace };
