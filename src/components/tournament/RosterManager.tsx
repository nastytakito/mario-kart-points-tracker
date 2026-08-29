"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { useResetFormOnSuccess } from "@/hooks/useResetFormOnSuccess";
import {
  addTeam,
  addMember,
  renameTeam,
  renameMember,
  moveMember,
  removeMember,
  deleteTeam,
} from "@/lib/actions/teams";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";
import { Card } from "@/components/ui/Card";

export type RosterTeam = {
  id: string;
  name: string;
  totalPoints?: number;
  members: { id: string; username: string; totalPoints?: number }[];
};

export function RosterManager({
  tournamentId,
  teams,
  locked,
}: {
  tournamentId: string;
  teams: RosterTeam[];
  locked: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {teams.map((team) => (
          <TeamEditor
            key={team.id}
            tournamentId={tournamentId}
            team={team}
            otherTeams={teams.filter((t) => t.id !== team.id)}
            locked={locked}
          />
        ))}
      </div>
      {!locked && <AddTeamForm tournamentId={tournamentId} />}
    </div>
  );
}

function TeamEditor({
  tournamentId,
  team,
  otherTeams,
  locked,
}: {
  tournamentId: string;
  team: RosterTeam;
  otherTeams: RosterTeam[];
  locked: boolean;
}) {
  const [editingName, setEditingName] = useState(false);
  const canDeleteTeam = !locked && team.members.length <= 1;

  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        {editingName ? (
          <InlineRenameTeam
            tournamentId={tournamentId}
            teamId={team.id}
            currentName={team.name}
            singleMember={team.members.length === 1}
            onDone={() => setEditingName(false)}
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            disabled={team.members.length === 1}
            className="text-lg font-bold text-left disabled:cursor-default truncate"
            title={
              team.members.length === 1
                ? "Solo teams take their racer's username"
                : "Rename team"
            }
          >
            {team.name}
            {team.members.length > 1 && (
              <span className="text-foreground-dim text-xs ml-2">✎</span>
            )}
          </button>
        )}
        {canDeleteTeam && (
          <DeleteTeamButton tournamentId={tournamentId} teamId={team.id} />
        )}
      </div>

      <ul className="flex flex-col gap-2">
        {team.members.map((member) => (
          <MemberRow
            key={member.id}
            tournamentId={tournamentId}
            member={member}
            otherTeams={otherTeams}
            locked={locked}
          />
        ))}
      </ul>

      {!locked && <AddMemberForm tournamentId={tournamentId} teamId={team.id} />}
    </Card>
  );
}

function InlineRenameTeam({
  tournamentId,
  teamId,
  currentName,
  singleMember,
  onDone,
}: {
  tournamentId: string;
  teamId: string;
  currentName: string;
  singleMember: boolean;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    renameTeam.bind(null, teamId, tournamentId),
    {}
  );

  if (singleMember) return <span className="text-lg font-bold">{currentName}</span>;

  return (
    <form
      action={(fd) => {
        formAction(fd);
        onDone();
      }}
      className="flex items-center gap-2 flex-1"
    >
      <Input
        name="name"
        defaultValue={currentName}
        autoFocus
        onBlur={onDone}
        className="py-1.5 text-base flex-1"
      />
      <FormError message={state.error} />
      <button type="submit" disabled={pending} className="text-brand-green text-sm font-bold">
        Save
      </button>
    </form>
  );
}

function MemberRow({
  tournamentId,
  member,
  otherTeams,
  locked,
}: {
  tournamentId: string;
  member: { id: string; username: string; totalPoints?: number };
  otherTeams: RosterTeam[];
  locked: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [renameState, renameAction, renamePending] = useActionState(
    renameMember.bind(null, member.id, tournamentId),
    {}
  );
  const [isRemoving, startRemove] = useTransition();
  const [removeError, setRemoveError] = useState<string>();

  return (
    <li className="flex items-center gap-2 bg-background-elevated rounded-xl px-3 py-2">
      {editing ? (
        <form
          action={(fd) => {
            renameAction(fd);
            setEditing(false);
          }}
          className="flex items-center gap-2 flex-1"
        >
          <Input
            name="username"
            defaultValue={member.username}
            autoFocus
            onBlur={() => setEditing(false)}
            className="py-1 text-sm flex-1"
          />
          <button
            type="submit"
            disabled={renamePending}
            className="text-brand-green text-xs font-bold"
          >
            Save
          </button>
        </form>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="flex-1 text-left text-sm font-medium truncate"
        >
          {member.username}
          {locked && typeof member.totalPoints === "number" && (
            <span className="text-foreground-dim ml-2 text-xs">
              {member.totalPoints} pts
            </span>
          )}
        </button>
      )}

      {otherTeams.length > 0 && (
        <MoveMemberSelect
          tournamentId={tournamentId}
          memberId={member.id}
          otherTeams={otherTeams}
          warnPointLoss={locked}
        />
      )}

      {!locked && (
        <button
          onClick={() =>
            startRemove(async () => {
              const res = await removeMember(member.id, tournamentId);
              if (res.error) setRemoveError(res.error);
            })
          }
          disabled={isRemoving}
          className="text-brand-red text-sm px-1 disabled:opacity-40"
          title="Remove racer"
        >
          ✕
        </button>
      )}
      <FormError message={renameState.error ?? removeError} />
    </li>
  );
}

function MoveMemberSelect({
  tournamentId,
  memberId,
  otherTeams,
  warnPointLoss,
}: {
  tournamentId: string;
  memberId: string;
  otherTeams: RosterTeam[];
  warnPointLoss: boolean;
}) {
  const [, startMove] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <>
      <Select
        defaultValue=""
        onChange={(e) => {
          const targetTeamId = e.target.value;
          if (!targetTeamId) return;
          if (
            warnPointLoss &&
            !confirm(
              "Moving this racer mid-tournament resets their points to zero on the new team. Continue?"
            )
          ) {
            e.target.value = "";
            return;
          }
          const fd = new FormData();
          fd.set("targetTeamId", targetTeamId);
          startMove(async () => {
            const res = await moveMember(memberId, tournamentId, {}, fd);
            if (res.error) setError(res.error);
            e.target.value = "";
          });
        }}
        className="py-1 text-xs w-28"
      >
        <option value="">Move to…</option>
        {otherTeams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </Select>
      <FormError message={error} />
    </>
  );
}

function AddMemberForm({
  tournamentId,
  teamId,
}: {
  tournamentId: string;
  teamId: string;
}) {
  const [state, formAction, pending] = useActionState(
    addMember.bind(null, teamId, tournamentId),
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);
  useResetFormOnSuccess(formRef, pending, Boolean(state.error));

  return (
    <form ref={formRef} action={formAction} className="flex items-center gap-2">
      <Input
        name="username"
        placeholder="Add racer username"
        required
        className="py-2 text-sm flex-1"
      />
      <Button type="submit" size="md" variant="ghost" disabled={pending} className="px-3 py-2">
        +
      </Button>
      <FormError message={state.error} />
    </form>
  );
}

function AddTeamForm({ tournamentId }: { tournamentId: string }) {
  const [state, formAction, pending] = useActionState(addTeam.bind(null, tournamentId), {});
  const formRef = useRef<HTMLFormElement>(null);
  useResetFormOnSuccess(formRef, pending, Boolean(state.error));

  return (
    <Card className="p-4">
      <form ref={formRef} action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-foreground-dim">Team name (optional)</label>
          <Input name="teamName" placeholder="Blue Shells" className="py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-foreground-dim">First racer</label>
          <Input name="username" placeholder="Username" required className="py-2 text-sm" />
        </div>
        <Button type="submit" variant="red" size="md" disabled={pending}>
          + Add Team
        </Button>
      </form>
      <FormError message={state.error} />
    </Card>
  );
}

function DeleteTeamButton({
  tournamentId,
  teamId,
}: {
  tournamentId: string;
  teamId: string;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() => {
        if (!confirm("Remove this team and its racer?")) return;
        startTransition(async () => {
          await deleteTeam(teamId, tournamentId);
        });
      }}
      disabled={isPending}
      className="text-foreground-dim hover:text-brand-red text-sm disabled:opacity-40"
      title="Delete team"
    >
      🗑
    </button>
  );
}
