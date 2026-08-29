import Link from "next/link";
import { listEndedTournaments } from "@/lib/data";
import { Card } from "@/components/ui/Card";
import { NewTournamentForm } from "@/components/tournament/NewTournamentForm";
import { CloneTournamentForm } from "@/components/tournament/CloneTournamentForm";

export default async function NewTournamentPage({
  searchParams,
}: {
  searchParams: Promise<{ clone?: string }>;
}) {
  const [ended, params] = await Promise.all([listEndedTournaments(), searchParams]);

  return (
    <main className="flex-1 max-w-md w-full mx-auto px-6 py-12 flex flex-col gap-8">
      <div>
        <Link
          href="/tournaments"
          className="text-sm text-foreground-dim hover:text-foreground"
        >
          ← Back
        </Link>
        <h1 className="text-4xl font-extrabold mt-1">New Tournament</h1>
      </div>

      <Card className="p-6">
        <NewTournamentForm />
      </Card>

      {ended.length > 0 && (
        <>
          <div className="flex items-center gap-3 text-foreground-dim text-sm">
            <div className="h-px flex-1 bg-border" />
            or start from a previous tournament
            <div className="h-px flex-1 bg-border" />
          </div>
          <Card className="p-6">
            <CloneTournamentForm tournaments={ended} defaultSourceId={params.clone} />
          </Card>
        </>
      )}
    </main>
  );
}
