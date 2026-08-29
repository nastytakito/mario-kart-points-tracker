"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/actions/tournaments";

function revalidateTournament(id: string) {
  revalidatePath(`/tournaments/${id}`);
  revalidatePath(`/tournaments/${id}/display`);
}

export async function addTeam(
  tournamentId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const teamName = String(formData.get("teamName") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();

  if (!username) return { error: "Enter at least one racer's username." };

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { status: true },
  });
  if (!tournament) return { error: "Tournament not found." };
  if (tournament.status !== "SETUP") {
    return { error: "Teams can only be added before the tournament starts." };
  }

  await prisma.team.create({
    data: {
      tournamentId,
      name: teamName || username,
      members: { create: [{ username }] },
    },
  });

  revalidateTournament(tournamentId);
  return {};
}

export async function addMember(
  teamId: string,
  tournamentId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const username = String(formData.get("username") ?? "").trim();
  if (!username) return { error: "Enter a username." };

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { status: true },
  });
  if (!tournament) return { error: "Tournament not found." };
  if (tournament.status !== "SETUP") {
    return { error: "Members can only be added before the tournament starts." };
  }

  await prisma.member.create({ data: { teamId, username } });

  revalidateTournament(tournamentId);
  return {};
}

export async function renameTeam(
  teamId: string,
  tournamentId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Team name can't be empty." };

  await prisma.team.update({ where: { id: teamId }, data: { name } });

  revalidateTournament(tournamentId);
  return {};
}

export async function renameMember(
  memberId: string,
  tournamentId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const username = String(formData.get("username") ?? "").trim();
  if (!username) return { error: "Username can't be empty." };

  await prisma.$transaction(async (tx) => {
    const member = await tx.member.update({
      where: { id: memberId },
      data: { username },
      include: { team: { include: { members: true } } },
    });
    if (member.team.members.length === 1) {
      await tx.team.update({ where: { id: member.teamId }, data: { name: username } });
    }
  });

  revalidateTournament(tournamentId);
  return {};
}

export async function removeMember(
  memberId: string,
  tournamentId: string
): Promise<ActionResult> {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { status: true },
  });
  if (!tournament) return { error: "Tournament not found." };
  if (tournament.status !== "SETUP") {
    return { error: "Racers can only be removed before the tournament starts." };
  }

  await prisma.$transaction(async (tx) => {
    const member = await tx.member.delete({ where: { id: memberId } });
    const remaining = await tx.member.count({ where: { teamId: member.teamId } });
    if (remaining === 0) {
      await tx.team.delete({ where: { id: member.teamId } });
    } else if (remaining === 1) {
      const last = await tx.member.findFirstOrThrow({ where: { teamId: member.teamId } });
      await tx.team.update({ where: { id: member.teamId }, data: { name: last.username } });
    }
  });

  revalidateTournament(tournamentId);
  return {};
}

export async function deleteTeam(teamId: string, tournamentId: string): Promise<ActionResult> {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { status: true },
  });
  if (!tournament) return { error: "Tournament not found." };
  if (tournament.status !== "SETUP") {
    return { error: "Teams can only be removed before the tournament starts." };
  }

  await prisma.team.delete({ where: { id: teamId } });

  revalidateTournament(tournamentId);
  return {};
}

export async function moveMember(
  memberId: string,
  tournamentId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const targetTeamId = String(formData.get("targetTeamId") ?? "");
  if (!targetTeamId) return { error: "Pick a team to move to." };

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { status: true },
  });
  if (!tournament) return { error: "Tournament not found." };

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { team: true },
  });
  if (!member) return { error: "Racer not found." };
  if (member.team.tournamentId !== tournamentId) {
    return { error: "That racer isn't part of this tournament." };
  }
  if (member.teamId === targetTeamId) return {};

  const targetTeam = await prisma.team.findUnique({ where: { id: targetTeamId } });
  if (!targetTeam || targetTeam.tournamentId !== tournamentId) {
    return { error: "Target team not found." };
  }

  const originTeamId = member.teamId;
  const resetPoints = tournament.status === "IN_PROGRESS";

  await prisma.$transaction(async (tx) => {
    if (resetPoints) {
      await tx.placement.deleteMany({ where: { memberId } });
    }
    await tx.member.update({
      where: { id: memberId },
      data: {
        teamId: targetTeamId,
        totalPoints: resetPoints ? 0 : member.totalPoints,
      },
    });

    const originRemaining = await tx.member.findMany({ where: { teamId: originTeamId } });
    if (originRemaining.length === 0) {
      await tx.team.delete({ where: { id: originTeamId } });
    } else if (originRemaining.length === 1) {
      await tx.team.update({
        where: { id: originTeamId },
        data: { name: originRemaining[0].username },
      });
    }

    const targetMembers = await tx.member.findMany({ where: { teamId: targetTeamId } });
    if (targetMembers.length === 1) {
      await tx.team.update({
        where: { id: targetTeamId },
        data: { name: targetMembers[0].username },
      });
    }
  });

  revalidateTournament(tournamentId);
  return {};
}
