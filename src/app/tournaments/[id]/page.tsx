import Link from "next/link";
import { notFound } from "next/navigation";
import { getTournamentView } from "@/lib/data";
import { StatusBadge, GameBadge } from "@/components/tournament/Badges";
import { SetupBoard } from "@/components/tournament/SetupBoard";
import { LiveDashboard } from "@/components/tournament/LiveDashboard";
import { StatsScreen } from "@/components/tournament/StatsScreen";

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const view = await getTournamentView(id);
  if (!view) notFound();

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/tournaments"
            className="text-sm text-foreground-dim hover:text-foreground"
          >
            ← All tournaments
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-1">{view.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <GameBadge game={view.game} />
            <StatusBadge status={view.status} />
          </div>
        </div>
        {view.status !== "SETUP" && (
          <Link
            href={`/tournaments/${view.id}/display`}
            target="_blank"
            className="text-sm font-semibold text-brand-blue hover:underline self-start"
          >
            📺 Open Projector View
          </Link>
        )}
      </div>

      {view.status === "SETUP" && <SetupBoard view={view} />}
      {view.status === "IN_PROGRESS" && <LiveDashboard view={view} />}
      {view.status === "ENDED" && <StatsScreen view={view} />}
    </main>
  );
}
