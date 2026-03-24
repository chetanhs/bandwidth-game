import { useEffect, useRef, useState } from 'react';

export const CYCLE_DURATION_SECONDS = 90;

/** E2E tests can set window.__testCycleDuration (seconds) to use a shorter cycle. */
function getD(): number {
  if (typeof window !== 'undefined') {
    const t = (window as unknown as Record<string, unknown>).__testCycleDuration;
    if (typeof t === 'number' && t > 0) return t;
  }
  return CYCLE_DURATION_SECONDS;
}

/**
 * Counts down from CYCLE_DURATION_SECONDS to 0.
 * - Pauses (no tick) when `active` is false.
 * - Resets to CYCLE_DURATION_SECONDS when `cycleKey` changes.
 * - Calls `onExpire` exactly once when the counter reaches 0.
 * All intervals are cleaned up on unmount or dependency change.
 */
export function useCycleTimer(
  active: boolean,
  cycleKey: number,
  onExpire: () => void,
): number {
  const duration = getD();
  const [timeLeft, setTimeLeft] = useState(duration);
  const onExpireRef = useRef(onExpire);
  const firedRef = useRef(false);
  onExpireRef.current = onExpire;

  // Reset timer whenever the cycle changes
  useEffect(() => {
    setTimeLeft(getD());
    firedRef.current = false;
  }, [cycleKey]);

  // Countdown — only ticks when active
  useEffect(() => {
    if (!active) return;

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          if (!firedRef.current) {
            firedRef.current = true;
            // Defer so we're not calling setState-in-setState
            setTimeout(() => onExpireRef.current(), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, cycleKey, duration]); // re-run when pause state or cycle changes

  return timeLeft;
}
