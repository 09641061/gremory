"use client";

import { useSyncExternalStore } from "react";

const TICK_MS = 60_000;

const listeners = new Set<() => void>();
let snapshot: number | null = null;
let intervalId: number | undefined;

function tick() {
  snapshot = Date.now();
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  // Update snapshot with a fresh timestamp immediately on new subscriptions
  // so that new subscribers do not get stale data from the last tick.
  snapshot = Date.now();

  if (intervalId === undefined && typeof window !== "undefined") {
    intervalId = window.setInterval(tick, TICK_MS);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      if (intervalId !== undefined && typeof window !== "undefined") {
        window.clearInterval(intervalId);
        intervalId = undefined;
      }
    }
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot(): number | null {
  return null;
}

/**
 * Current wall-clock time, or `null` until the shared clock has started.
 *
 * Reading `Date.now()` during render makes server and client markup disagree,
 * and freezing it at mount leaves "overdue" styling permanently stale. One
 * external store keeps every subscriber on the same tick, so a calendar full
 * of appointment blocks costs a single interval.
 */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
