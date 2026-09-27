import type { CueScene } from "../../types/CueScene";
import type { TimelineTrack } from "../../types/TimelineTrack";

const toMs = (value: string) => Number.parseInt(value, 10) || 0;

export function TimelineRuler({
  tracks,
  cues,
  timeMs
}: {
  tracks: TimelineTrack[];
  cues: CueScene[];
  timeMs?: number;
}) {
  const totalMs = Math.max(1, ...tracks.map((track) => toMs(track.start_ms) + toMs(track.duration_ms)));
  const layers = [...new Set(tracks.map((track) => track.layer))].sort();
  const cueOf = (id: number) => cues.find((cue) => cue.id === id);
  return (
    <div className="timeline">
      {layers.map((layer) => (
        <div className="tl-layer" key={layer}>
          <span className="tl-label">层 {layer}</span>
          <div className="tl-lane">
            {tracks
              .filter((track) => track.layer === layer)
              .map((track) => {
                const start = toMs(track.start_ms);
                const duration = toMs(track.duration_ms);
                return (
                  <div
                    key={track.id}
                    className={"tl-block" + (track.locked === "1" ? " locked" : "")}
                    style={{ left: `${(start / totalMs) * 100}%`, width: `${(duration / totalMs) * 100}%` }}
                    title={cueOf(track.cue_scene_id)?.name ?? `Cue ${track.cue_scene_id}`}
                  >
                    {cueOf(track.cue_scene_id)?.name ?? `Cue ${track.cue_scene_id}`}
                  </div>
                );
              })}
            {timeMs !== undefined && (
              <i className="tl-playhead" style={{ left: `${Math.min(100, (timeMs / totalMs) * 100)}%` }} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
