import Link from "next/link";
import { listTournaments } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge, GameBadge } from "@/components/tournament/Badges";
import { TournamentRowActions } from "@/components/tournament/TournamentRowActions";
import type { TournamentStatus, Game } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  name: string;
  game: Game;
  status: TournamentStatus;
  hidden: boolean;
  teamCount: number;
  memberCount: number;
};

export default async function TournamentsPage() {
  const [tournaments, hiddenTournaments] = await Promise.all([
    listTournaments(),
    listTournaments({ hidden: true }),
  ]);

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
        <TournamentList rows={tournaments} />
      )}

      {hiddenTournaments.length > 0 && (
        <details className="flex flex-col gap-4">
          <summary className="cursor-pointer text-sm font-semibold text-foreground-dim hover:text-foreground">
            Hidden tournaments ({hiddenTournaments.length})
          </summary>
          <TournamentList rows={hiddenTournaments} />
        </details>
      )}
    </main>
  );
}

function TournamentList({ rows }: { rows: Row[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {rows.map((t) => (
        <li key={t.id}>
          <Card
            className={`p-5 flex items-center justify-between gap-4 hover:bg-card-hover transition-colors ${
              t.hidden ? "opacity-60" : ""
            }`}
          >
            <Link
              href={`/tournaments/${t.id}`}
              className="flex flex-col gap-1.5 min-w-0 flex-1"
            >
              <span className="text-xl font-bold truncate">{t.name}</span>
              <div className="flex items-center gap-2">
                <GameBadge game={t.game} />
                <span className="text-sm text-foreground-dim">
                  {t.teamCount} team{t.teamCount === 1 ? "" : "s"} ·{" "}
                  {t.memberCount} racer{t.memberCount === 1 ? "" : "s"}
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-3 shrink-0">
              <StatusBadge status={t.status} />
              <TournamentRowActions id={t.id} hidden={t.hidden} />
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
