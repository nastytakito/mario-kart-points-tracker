import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Confetti } from "@/components/Confetti";
import { accentFor } from "@/components/tournament/TeamBanner";
import { buildLeaderboard, teamLeaderboard, type TournamentView } from "@/lib/view";

export function StatsScreen({ view, large = false }: { view: TournamentView; large?: boolean }) {
  const teams = teamLeaderboard(view);
  const leaderboard = buildLeaderboard(view);
  const champion = leaderboard[0];

  return (
    <div className="flex flex-col gap-10">
      {champion && (
        <div className="relative text-center flex flex-col items-center gap-2 animate-pop-in">
          <Confetti />
          <span className="text-sm uppercase tracking-[0.3em] text-foreground-dim">
            Champion
          </span>
          <h2
            className={`font-extrabold ${large ? "text-6xl" : "text-4xl"} text-brand-yellow`}
          >
            🏆 {champion.username}
          </h2>
          <span className="text-foreground-dim">
            {champion.teamName} · {champion.totalPoints} pts
          </span>
        </div>
      )}

      <section className="flex flex-col gap-4">
        <h3 className={`font-bold text-foreground-dim uppercase tracking-wide ${large ? "text-xl" : "text-sm"}`}>
          Team Results
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {teams.map((team, i) => {
            const originalIndex = view.teams.findIndex((t) => t.id === team.id);
            return (
              <Card
                key={team.id}
                className="p-5 flex flex-col gap-3"
                style={{ borderTopWidth: 6, borderTopColor: accentFor(originalIndex) }}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-extrabold ${large ? "text-2xl" : "text-lg"}`}>
                    {i === 0 && "🥇 "}
                    {i === 1 && "🥈 "}
                    {i === 2 && "🥉 "}
                    {team.name}
                  </span>
                  <span className={`font-extrabold tabular-nums ${large ? "text-3xl" : "text-xl"}`}>
                    {team.totalPoints}
                  </span>
                </div>
                <span className="text-xs text-foreground-dim">
                  {team.avgPointsPerMember.toFixed(1)} avg / racer · {team.members.length}{" "}
                  racer{team.members.length === 1 ? "" : "s"}
                </span>
                <ul className="flex flex-col gap-1">
                  {[...team.members]
                    .sort((a, b) => b.totalPoints - a.totalPoints)
                    .map((m) => (
                      <li
                        key={m.id}
                        className="flex justify-between text-sm text-foreground-dim"
                      >
                        <span>{m.username}</span>
                        <span className="tabular-nums">{m.totalPoints}</span>
                      </li>
                    ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className={`font-bold text-foreground-dim uppercase tracking-wide ${large ? "text-xl" : "text-sm"}`}>
          Individual Leaderboard
        </h3>
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs uppercase text-foreground-dim border-b border-border">
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Racer</th>
                <th className="px-5 py-3">Team</th>
                <th className="px-5 py-3 text-right">Races</th>
                <th className="px-5 py-3 text-right">Avg</th>
                <th className="px-5 py-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, i) => (
                <tr
                  key={entry.memberId}
                  className={`border-b border-border last:border-0 ${large ? "text-lg" : ""}`}
                >
                  <td className="px-5 py-3 font-bold text-foreground-dim">{i + 1}</td>
                  <td className="px-5 py-3 font-semibold">{entry.username}</td>
                  <td className="px-5 py-3 text-foreground-dim">{entry.teamName}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{entry.racesPlayed}</td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {entry.avgPoints.toFixed(1)}
                  </td>
                  <td className="px-5 py-3 text-right font-bold tabular-nums">
                    {entry.totalPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {!large && (
        <div className="flex justify-center pt-4">
          <Link href={`/tournaments/new?clone=${view.id}`}>
            <Button variant="red" size="lg">
              🔁 Start New Tournament From This One
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
