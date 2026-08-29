"use client";

import { useEffect, useRef, useState } from "react";

type WakeLockSentinel = {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: "release", listener: () => void) => void;
};

type NavigatorWithWakeLock = Navigator & {
  wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinel> };
};

export function useWakeLock(enabled: boolean) {
  const [active, setActive] = useState(false);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const nav = navigator as NavigatorWithWakeLock;
    if (!nav.wakeLock) return;

    let cancelled = false;

    async function requestLock() {
      try {
        const sentinel = await nav.wakeLock!.request("screen");
        if (cancelled) {
          sentinel.release().catch(() => {});
          return;
        }
        sentinelRef.current = sentinel;
        setActive(true);
        sentinel.addEventListener("release", () => setActive(false));
      } catch {
        setActive(false);
      }
    }

    requestLock();

    function handleVisibility() {
      if (document.visibilityState === "visible" && !sentinelRef.current) {
        requestLock();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      sentinelRef.current?.release().catch(() => {});
      sentinelRef.current = null;
      setActive(false);
    };
  }, [enabled]);

  return active;
}
