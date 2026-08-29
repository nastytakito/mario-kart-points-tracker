import { notFound } from "next/navigation";
import { getTournamentView } from "@/lib/data";
import { GameBadge } from "@/components/tournament/Badges";
import { TeamBanner } from "@/components/tournament/TeamBanner";
import { StatsScreen } from "@/components/tournament/StatsScreen";
import { AutoRefresh } from "@/components/AutoRefresh";
import { WakeLockBadge } from "@/components/WakeLockBadge";

export default async function DisplayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const view = await getTournamentView(id);
  if (!view) notFound();

  return (
    <main className="flex-1 w-full mx-auto px-8 py-10 flex flex-col gap-8 max-w-7xl">
      <AutoRefresh intervalMs={3000} />
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-extrabold">{view.name}</h1>
          <GameBadge game={view.game} />
        </div>
        <div className="flex items-center gap-4">
          {view.status === "IN_PROGRESS" && (
            <span className="text-2xl font-bold text-brand-yellow">Race #{view.round}</span>
          )}
          <WakeLockBadge />
        </div>
      </header>

      {view.status === "SETUP" && (
        <div className="flex-1 flex items-center justify-center text-3xl text-foreground-dim py-24">
          Waiting for the tournament to start…
        </div>
      )}

      {view.status === "IN_PROGRESS" && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {view.teams.map((team, i) => (
            <TeamBanner
              key={team.id}
              team={team}
              index={i}
              tournamentId={view.id}
              interactive={false}
            />
          ))}
        </div>
      )}

      {view.status === "ENDED" && <StatsScreen view={view} large />}
    </main>
  );
}
