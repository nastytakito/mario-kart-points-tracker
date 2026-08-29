import { Game } from "@/generated/prisma/enums";

export { Game };

type GameConfig = {
  label: string;
  shortLabel: string;
  /** Points awarded per finishing place, index 0 = 1st place. */
  points: number[];
};

export const GAME_CONFIG: Record<Game, GameConfig> = {
  MK64: {
    label: "Mario Kart 64",
    shortLabel: "MK64",
    points: [9, 6, 3, 1, 0, 0, 0, 0],
  },
  MK8DX: {
    label: "Mario Kart 8 Deluxe",
    shortLabel: "MK8 Deluxe",
    points: [15, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  },
  MKWORLD: {
    label: "Mario Kart World",
    shortLabel: "MK World",
    points: [
      15, 12, 10, 9, 9, 8, 8, 7, 7, 6, 6, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 1,
    ],
  },
};

export const GAME_OPTIONS = Object.entries(GAME_CONFIG).map(([value, cfg]) => ({
  value: value as Game,
  ...cfg,
}));

export function maxPlaces(game: Game): number {
  return GAME_CONFIG[game].points.length;
}

export function pointsForPlace(game: Game, place: number): number {
  const table = GAME_CONFIG[game].points;
  if (place < 1) return 0;
  return table[place - 1] ?? 0;
}

export function gameLabel(game: Game): string {
  return GAME_CONFIG[game].label;
}
