import { useMemo } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { PlaybackControls } from "../components/common/PlaybackControls";
import { StageCanvas } from "../components/common/StageCanvas";
import { StatCard } from "../components/common/StatCard";
import { TimelineRuler } from "../components/common/TimelineRuler";
import { useIndexedDbStore } from "../hooks/useIndexedDbStore";
import { useTimelinePlayback } from "../hooks/useTimelinePlayback";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useFixtureStore } from "../stores/FixtureStore";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import type { FixtureState } from "../types/FixtureState";
import { parseFixtureStates } from "../utils/fixtureStates";

const SKIP_PREVIEW_STATUS = new Set(["DISABLED", "ARCHIVED"]);

export function PreviewPage() {
  const fixtures = useFixtureStore((state) => state.rows);
  const loadFixtures = useFixtureStore((state) => state.load);
  const cues = useCueSceneStore((state) => state.rows);
  const loadCues = useCueSceneStore((state) => state.load);
  const tracks = useTimelineTrackStore((state) => state.rows);
  const loadTracks = useTimelineTrackStore((state) => state.load);
  const ready = useIndexedDbStore([loadFixtures, loadCues, loadTracks]);

  const playback = useTimelinePlayback(tracks);

  const activeStates = useMemo(() => {
    const map: Record<number, FixtureState> = {};
    const activeTracks = tracks
      .filter((track) => playback.activeTrackIds.includes(track.id))
      .sort(
        (a, b) =>
          (Number.parseInt(a.start_ms, 10) || 0) - (Number.parseInt(b.start_ms, 10) || 0)
      );
    for (const track of activeTracks) {
      const cue = cues.find((item) => item.id === track.cue_scene_id);
      if (!cue || SKIP_PREVIEW_STATUS.has(cue.scene_status)) continue;
      for (const state of parseFixtureStates(cue.fixture_states)) {
        map[state.fixture_id] = state;
      }
    }
    return map;
  }, [tracks, cues, playback.activeTrackIds]);

  if (!ready) {
    return (
      <main className="page">
        <EmptyState title="正在加载本地数据…" />
      </main>
    );
  }

  const litCount = Object.keys(activeStates).length;
  const faultyCount = fixtures.filter((fixture) => fixture.rig_status === "FAULTY").length;

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light</p>
          <h1>舞台预览</h1>
        </div>
      </section>

      <section className="metrics">
        <StatCard label="当前点亮" value={litCount} />
        <StatCard label="故障灯具" value={faultyCount} />
        <StatCard label="轨道数" value={tracks.length} />
      </section>

      <section className="panel wide">
        <h2>二维舞台预览</h2>
        <StageCanvas fixtures={fixtures} activeStates={activeStates} />
        <PlaybackControls
          playing={playback.playing}
          timeMs={playback.timeMs}
          totalMs={playback.totalMs}
          onPlay={playback.play}
          onPause={playback.pause}
          onReset={playback.reset}
          onSeek={playback.seek}
        />
        <p className="sub">停用与已归档的 Cue 不参与播放；故障灯具显示为 ✕，换灯后由替身按原亮度原颜色点亮。</p>
      </section>

      <section className="panel wide">
        <h2>时间轴</h2>
        <TimelineRuler tracks={tracks} cues={cues} timeMs={playback.timeMs} />
      </section>
    </main>
  );
}
