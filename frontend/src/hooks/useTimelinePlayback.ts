import { useEffect, useMemo, useState } from "react";
import type { TimelineTrack } from "../types/TimelineTrack";

const toMs = (value: string) => Number.parseInt(value, 10) || 0;

export function useTimelinePlayback(tracks: TimelineTrack[]) {
  const [timeMs, setTimeMs] = useState(0);
  const [playing, setPlaying] = useState(false);

  const totalMs = useMemo(
    () => tracks.reduce((max, track) => Math.max(max, toMs(track.start_ms) + toMs(track.duration_ms)), 0),
    [tracks]
  );

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setTimeMs((current) => Math.min(current + 100, totalMs));
    }, 100);
    return () => clearInterval(timer);
  }, [playing, totalMs]);

  useEffect(() => {
    if (totalMs > 0 && timeMs >= totalMs) setPlaying(false);
  }, [timeMs, totalMs]);

  const activeTrackIds = useMemo(
    () =>
      tracks
        .filter((track) => {
          const start = toMs(track.start_ms);
          const end = start + toMs(track.duration_ms);
          return timeMs >= start && timeMs < end;
        })
        .map((track) => track.id),
    [tracks, timeMs]
  );

  return {
    timeMs,
    totalMs,
    playing,
    activeTrackIds,
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    reset: () => {
      setPlaying(false);
      setTimeMs(0);
    },
    seek: (value: number) => setTimeMs(Math.max(0, Math.min(value, totalMs)))
  };
}
