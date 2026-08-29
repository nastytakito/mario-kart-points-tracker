"use client";

import { useWakeLock } from "@/hooks/useWakeLock";

export function WakeLockBadge() {
  const active = useWakeLock(true);

  return (
    <span
      title={active ? "Screen will stay awake" : "Keeping screen awake…"}
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
        active
          ? "text-brand-green border-brand-green/40 bg-brand-green/10"
          : "text-foreground-dim border-border"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${active ? "bg-brand-green" : "bg-foreground-dim"}`}
      />
      {active ? "Screen awake" : "Waking screen…"}
    </span>
  );
}
