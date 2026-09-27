import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TimelineTrack } from "../types/TimelineTrack";

/**
 * 时间轴播放：requestAnimationFrame 驱动当前毫秒，
 * 并根据轨道区间给出当前激活的 cue_scene_id 列表。
 */
export function useTimelinePlayback(tracks: TimelineTrack[]) {
  const totalMs = useMemo(
    () => tracks.reduce((max, track) => Math.max(max, Number(track.start_ms) + Number(track.duration_ms)), 0),
    [tracks]
  );

  const [currentMs, setCurrentMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    if (!playing) return;
    lastTickRef.current = performance.now();
    const tick = (now: number) => {
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      setCurrentMs((prev) => {
        const next = prev + delta;
        if (next >= totalMs) {
          setPlaying(false);
          return totalMs;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, totalMs]);

  const play = useCallback(() => {
    setCurrentMs((prev) => (prev >= totalMs ? 0 : prev));
    setPlaying(true);
  }, [totalMs]);
  const pause = useCallback(() => setPlaying(false), []);
  const stop = useCallback(() => {
    setPlaying(false);
    setCurrentMs(0);
  }, []);
  const seek = useCallback(
    (ms: number) => setCurrentMs(Math.min(Math.max(0, ms), totalMs)),
    [totalMs]
  );

  const activeCueIds = useMemo(
    () =>
      tracks
        .filter((track) => {
          const start = Number(track.start_ms);
          const end = start + Number(track.duration_ms);
          return currentMs >= start && currentMs < end;
        })
        .map((track) => track.cue_scene_id),
    [tracks, currentMs]
  );

  return { currentMs, totalMs, playing, play, pause, stop, seek, activeCueIds };
}
