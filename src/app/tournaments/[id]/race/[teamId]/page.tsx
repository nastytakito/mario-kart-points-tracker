import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getRaceEntryData } from "@/lib/data";
import { maxPlaces } from "@/lib/games";
import { RaceEntryFlow } from "@/components/tournament/RaceEntryFlow";

export default async function RacePage({
  params,
}: {
  params: Promise<{ id: string; teamId: string }>;
}) {
  const { id, teamId } = await params;
  const data = await getRaceEntryData(id, teamId);
  if (!data) notFound();
  if (data.alreadyDone) redirect(`/tournaments/${id}`);

  return (
    <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-8 flex flex-col gap-4">
      <Link href={`/tournaments/${id}`} className="text-sm text-foreground-dim hover:text-foreground">
        ← Back to dashboard
      </Link>

      <RaceEntryFlow
        tournamentId={id}
        teamId={teamId}
        teamName={data.team.name}
        members={data.team.members}
        maxPlaces={maxPlaces(data.game)}
        takenPlaces={data.takenPlaces}
        round={data.round}
      />
    </main>
  );
}
