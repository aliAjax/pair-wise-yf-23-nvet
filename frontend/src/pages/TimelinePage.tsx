import { EmptyState } from "../components/common/EmptyState";
import { StatCard } from "../components/common/StatCard";
import { TimelineRuler } from "../components/common/TimelineRuler";
import { useIndexedDbStore } from "../hooks/useIndexedDbStore";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import { formatMs } from "../utils/formatters";

export function TimelinePage() {
  const tracks = useTimelineTrackStore((state) => state.rows);
  const loadTracks = useTimelineTrackStore((state) => state.load);
  const updateTrack = useTimelineTrackStore((state) => state.update);
  const cues = useCueSceneStore((state) => state.rows);
  const loadCues = useCueSceneStore((state) => state.load);
  const ready = useIndexedDbStore([loadTracks, loadCues]);

  if (!ready) {
    return (
      <main className="page">
        <EmptyState title="正在加载本地数据…" />
      </main>
    );
  }

  const cueNameOf = (cueSceneId: number) =>
    cues.find((cue) => cue.id === cueSceneId)?.name ?? `Cue ${cueSceneId}`;
  const endOf = (start: string, duration: string) =>
    (Number.parseInt(start, 10) || 0) + (Number.parseInt(duration, 10) || 0);
  const totalMs = tracks.reduce((max, track) => Math.max(max, endOf(track.start_ms, track.duration_ms)), 0);
  const lockedCount = tracks.filter((track) => track.locked === "1").length;
  const sorted = [...tracks].sort(
    (a, b) => (Number.parseInt(a.start_ms, 10) || 0) - (Number.parseInt(b.start_ms, 10) || 0)
  );

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light</p>
          <h1>时间轴编排</h1>
        </div>
      </section>

      <section className="metrics">
        <StatCard label="轨道数" value={tracks.length} />
        <StatCard label="已锁定" value={lockedCount} />
        <StatCard label="总时长" value={formatMs(totalMs)} />
      </section>

      <section className="panel wide">
        <h2>时间轴预览</h2>
        <TimelineRuler tracks={tracks} cues={cues} />
      </section>

      <section className="panel wide">
        <h2>轨道明细</h2>
        <div className="fixture-table">
          <div className="ft-row tl-head">
            <span>场景</span>
            <span>开始</span>
            <span>时长</span>
            <span>层</span>
            <span>锁定</span>
          </div>
          {sorted.map((track) => (
            <div className="ft-row" key={track.id}>
              <strong>{cueNameOf(track.cue_scene_id)}</strong>
              <span>{formatMs(track.start_ms)}</span>
              <span>{formatMs(track.duration_ms)}</span>
              <span>{track.layer}</span>
              <input
                type="checkbox"
                checked={track.locked === "1"}
                onChange={(event) =>
                  void updateTrack({ ...track, locked: event.target.checked ? "1" : "0" })
                }
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
