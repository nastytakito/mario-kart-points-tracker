"use client";

import { useEffect, useRef } from "react";

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const TILE_WIDTH = 104;

export function PlaceCarousel({
  options,
  value,
  onCenterChange,
}: {
  options: number[];
  value: number | null;
  onCenterChange: (place: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const scrollToIndex = (index: number, smooth = true) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * TILE_WIDTH, behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    const initialIndex = value ? options.indexOf(value) : 0;
    scrollToIndex(Math.max(initialIndex, 0), false);
    if (!value && options.length > 0) onCenterChange(options[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.join(",")]);

  function handleScroll() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const track = trackRef.current;
      if (!track) return;
      const index = Math.round(track.scrollLeft / TILE_WIDTH);
      const place = options[Math.min(Math.max(index, 0), options.length - 1)];
      if (place !== undefined) onCenterChange(place);
    });
  }

  return (
    <div className="relative w-full max-w-xl">
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 w-[104px] -translate-x-1/2 rounded-2xl border-2 border-brand-yellow z-10"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-20" />

      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-4"
        style={{ paddingLeft: "calc(50% - 52px)", paddingRight: "calc(50% - 52px)" }}
      >
        {options.map((place, i) => {
          const isCentered = value === place;
          return (
            <button
              key={place}
              type="button"
              onClick={() => scrollToIndex(i)}
              className={`shrink-0 snap-center w-[88px] h-[88px] mx-2 rounded-2xl flex flex-col items-center justify-center font-extrabold transition-all ${
                isCentered
                  ? "bg-brand-blue text-white scale-110 shadow-lg shadow-brand-blue/30"
                  : "bg-background-elevated text-foreground-dim scale-90"
              }`}
            >
              <span className="text-2xl leading-none">{MEDALS[place] ?? place}</span>
              {MEDALS[place] && <span className="text-xs mt-1">P{place}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
