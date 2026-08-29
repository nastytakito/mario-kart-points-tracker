import { Game, TournamentStatus } from "@/generated/prisma/enums";
import { GAME_CONFIG } from "@/lib/games";

const statusStyles: Record<TournamentStatus, string> = {
  SETUP: "text-brand-yellow border-brand-yellow/40 bg-brand-yellow/10",
  IN_PROGRESS: "text-brand-green border-brand-green/40 bg-brand-green/10",
  ENDED: "text-foreground-dim border-border bg-background-elevated",
};

const statusLabel: Record<TournamentStatus, string> = {
  SETUP: "Setup",
  IN_PROGRESS: "Live",
  ENDED: "Ended",
};

export function StatusBadge({ status }: { status: TournamentStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${statusStyles[status]}`}
    >
      {status === "IN_PROGRESS" && (
        <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
      )}
      {statusLabel[status]}
    </span>
  );
}

export function GameBadge({ game }: { game: Game }) {
  return (
    <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border border-border text-foreground-dim">
      {GAME_CONFIG[game].shortLabel}
    </span>
  );
}
