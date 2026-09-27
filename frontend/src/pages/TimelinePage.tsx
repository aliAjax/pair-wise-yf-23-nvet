import { useMemo } from "react";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import { useTimelinePlayback } from "../hooks/useTimelinePlayback";
import { PlaybackControls } from "../components/common/PlaybackControls";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { TimelineRuler } from "../components/common/TimelineRuler";
import { CueStatusText } from "../constants/CueStatus";
import { formatMs } from "../utils/formatters";

export function TimelinePage() {
  const tracks = useTimelineTrackStore((state) => state.rows);
  const cues = useCueSceneStore((state) => state.rows);

  const { currentMs, totalMs, playing, play, pause, stop, seek, activeCueIds } = useTimelinePlayback(tracks);

  const layers = useMemo(() => [...new Set(tracks.map((track) => track.layer))].sort(), [tracks]);
  const cueById = useMemo(() => new Map(cues.map((cue) => [cue.id, cue])), [cues]);

  return (
    <>
      <section className="metrics">
        <StatCard label="轨道数" value={tracks.length} />
        <StatCard label="总时长" value={formatMs(totalMs)} />
        <StatCard label="锁定轨道" value={tracks.filter((track) => track.locked === "true").length} />
      </section>

      <section className="panel">
        <h2>时间轴</h2>
        <PlaybackControls
          playing={playing}
          currentMs={currentMs}
          totalMs={totalMs}
          onPlay={play}
          onPause={pause}
          onStop={stop}
          onSeek={seek}
        />
        <TimelineRuler totalMs={totalMs} currentMs={currentMs} />
        <div className="timeline-layers">
          {layers.map((layer) => (
            <div key={layer} className="timeline-layer">
              <span className="layer-label">层 {layer}</span>
              <div className="layer-lane">
                {tracks
                  .filter((track) => track.layer === layer)
                  .map((track) => {
                    const cue = cueById.get(track.cue_scene_id);
                    const start = Number(track.start_ms);
                    const duration = Number(track.duration_ms);
                    const active = activeCueIds.includes(track.cue_scene_id);
                    const archived = cue?.scene_status === "ARCHIVED";
                    return (
                      <div
                        key={track.id}
                        className={`track-block${active ? " active" : ""}${archived ? " archived" : ""}`}
                        style={{
                          left: `${(start / Math.max(totalMs, 1)) * 100}%`,
                          width: `${(duration / Math.max(totalMs, 1)) * 100}%`
                        }}
                        title={`${cue?.name ?? track.cue_scene_id} · ${formatMs(start)} 起 ${formatMs(duration)}`}
                      >
                        <strong>{cue?.name ?? `Cue #${track.cue_scene_id}`}</strong>
                        <span className="track-block-meta">
                          {track.locked === "true" && <em>🔒</em>}
                          {cue && (
                            <StatusBadge
                              value={cue.scene_status}
                              label={CueStatusText[cue.scene_status as keyof typeof CueStatusText] ?? cue.scene_status}
                            />
                          )}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
