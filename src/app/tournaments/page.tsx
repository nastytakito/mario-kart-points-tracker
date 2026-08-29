import Link from "next/link";
import { listTournaments } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge, GameBadge } from "@/components/tournament/Badges";

export const dynamic = "force-dynamic";

export default async function TournamentsPage() {
  const tournaments = await listTournaments();

  return (
    <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-foreground-dim hover:text-foreground">
            ← Back
          </Link>
          <h1 className="text-4xl font-extrabold mt-1">Tournaments</h1>
        </div>
        <Link href="/tournaments/new">
          <Button variant="red">+ New</Button>
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <Card className="p-10 text-center text-foreground-dim">
          No tournaments yet. Create your first one to get racing!
        </Card>
      ) : (
        <ul className="flex flex-col gap-4">
          {tournaments.map((t) => (
            <li key={t.id}>
              <Link href={`/tournaments/${t.id}`}>
                <Card className="p-5 flex items-center justify-between gap-4 hover:bg-card-hover transition-colors">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xl font-bold">{t.name}</span>
                    <div className="flex items-center gap-2">
                      <GameBadge game={t.game} />
                      <span className="text-sm text-foreground-dim">
                        {t.teamCount} teams · {t.memberCount} racers
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={t.status} />
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
