import Link from "next/link";
import type { TeamView } from "@/lib/view";

const ACCENTS = [
  "var(--brand-red)",
  "var(--brand-blue)",
  "var(--brand-yellow)",
  "var(--brand-green)",
  "var(--brand-purple)",
  "var(--brand-orange)",
];

export function accentFor(index: number) {
  return ACCENTS[index % ACCENTS.length];
}

export function TeamBanner({
  team,
  index,
  tournamentId,
  interactive,
}: {
  team: TeamView;
  index: number;
  tournamentId: string;
  interactive: boolean;
}) {
  const accent = accentFor(index);
  const clickable = interactive && !team.doneCurrentRound;

  const body = (
    <div
      className={`relative overflow-hidden rounded-3xl border bg-card p-5 flex flex-col gap-4 transition-all ${
        team.doneCurrentRound
          ? "border-brand-green/40 opacity-80"
          : "border-border"
      } ${clickable ? "hover:bg-card-hover hover:-translate-y-0.5 cursor-pointer active:translate-y-0" : ""}`}
      style={{ borderTopWidth: 6, borderTopColor: accent }}
    >
      {team.doneCurrentRound && (
        <span className="absolute top-4 right-4 text-brand-green text-2xl">✓</span>
      )}
      {clickable && (
        <span className="absolute top-4 right-4 text-xs font-bold uppercase tracking-wide text-foreground-dim animate-pulse-ring rounded-full px-2 py-1 bg-background-elevated">
          Tap to record
        </span>
      )}

      <div className="flex items-end justify-between gap-3">
        <h3 className="text-2xl font-extrabold truncate" style={{ color: accent }}>
          {team.name}
        </h3>
        <div className="text-right shrink-0">
          <div className="text-3xl font-extrabold tabular-nums">{team.totalPoints}</div>
          <div className="text-[11px] text-foreground-dim uppercase tracking-wide">
            {team.avgPointsPerMember.toFixed(1)} avg/racer
          </div>
        </div>
      </div>

      <ul className="flex flex-col gap-1.5">
        {team.members.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between text-sm bg-background-elevated rounded-lg px-3 py-2"
          >
            <span className="font-medium truncate">{m.username}</span>
            <span className="flex items-center gap-2 text-foreground-dim tabular-nums shrink-0">
              {m.lastDnf && <span className="text-xs text-brand-red">DNF</span>}
              {!m.lastDnf && m.lastPlace && (
                <span className="text-xs">
                  P{m.lastPlace} · +{m.lastPoints}
                </span>
              )}
              <span className="font-bold text-foreground">{m.totalPoints}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  if (!clickable) return body;

  return (
    <Link href={`/tournaments/${tournamentId}/race/${team.id}`} className="block">
      {body}
    </Link>
  );
}
