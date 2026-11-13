import { useEffect, useState } from "react";

/** Live countdown synced from Firebase timer fields (endsAt / remainingSeconds). */
export function useSyncedTimer(timer) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!timer?.running || !timer?.endsAt) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [timer?.running, timer?.endsAt]);

  if (!timer) return { seconds: 0, label: "0:00", expired: true };

  const seconds = timer.running && timer.endsAt
    ? Math.max(0, Math.ceil((timer.endsAt - now) / 1000))
    : Math.max(0, timer.remainingSeconds ?? 0);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const label = `${mins}:${String(secs).padStart(2, "0")}`;

  return { seconds, label, expired: seconds <= 0 };
}
