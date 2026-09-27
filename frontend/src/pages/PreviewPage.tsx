import { useMemo } from "react";
import { parseFixtureStates } from "../constructors/CueSceneConstructor";
import { CueStatusText } from "../constants/CueStatus";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useFixtureStore } from "../stores/FixtureStore";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import { useTimelinePlayback } from "../hooks/useTimelinePlayback";
import { PlaybackControls } from "../components/common/PlaybackControls";
import { StageCanvas } from "../components/common/StageCanvas";
import { StatusBadge } from "../components/common/StatusBadge";
import { StatCard } from "../components/common/StatCard";
import type { FixtureState } from "../types/FixtureState";
import { formatMs } from "../utils/formatters";

export function PreviewPage() {
  const fixtures = useFixtureStore((state) => state.rows);
  const cues = useCueSceneStore((state) => state.rows);
  const tracks = useTimelineTrackStore((state) => state.rows);

  const { currentMs, totalMs, playing, play, pause, stop, seek, activeCueIds } = useTimelinePlayback(tracks);

  const cueById = useMemo(() => new Map(cues.map((cue) => [cue.id, cue])), [cues]);
  const activeCues = useMemo(
    () => activeCueIds.map((id) => cueById.get(id)).filter((cue): cue is NonNullable<typeof cue> => Boolean(cue)),
    [activeCueIds, cueById]
  );

  // 多个 Cue 同时激活时，priority 数字大的覆盖同灯状态
  const litStates = useMemo(() => {
    const byFixture = new Map<number, FixtureState>();
    for (const cue of [...activeCues].sort((a, b) => Number(a.priority) - Number(b.priority))) {
      for (const state of parseFixtureStates(cue.fixture_states)) {
        byFixture.set(state.fixture_id, state);
      }
    }
    return byFixture;
  }, [activeCues]);

  const litCount = [...litStates.values()].filter(
    (state) => state.intensity > 0 && fixtures.find((fixture) => fixture.id === state.fixture_id)?.fixture_status !== "FAULT"
  ).length;

  return (
    <>
      <section className="metrics">
        <StatCard label="当前时刻" value={formatMs(currentMs)} />
        <StatCard label="激活 Cue" value={activeCues.length} />
        <StatCard label="点亮灯具" value={litCount} />
      </section>

      <section className="panel">
        <h2>舞台预览</h2>
        <PlaybackControls
          playing={playing}
          currentMs={currentMs}
          totalMs={totalMs}
          onPlay={play}
          onPause={pause}
          onStop={stop}
          onSeek={seek}
        />
        <div className="active-cue-strip">
          {activeCues.length === 0 && <span className="hint">此刻没有激活的 Cue</span>}
          {activeCues.map((cue) => (
            <StatusBadge
              key={cue.id}
              value={cue.scene_status}
              label={`${cue.name} · ${CueStatusText[cue.scene_status as keyof typeof CueStatusText] ?? cue.scene_status}`}
            />
          ))}
        </div>
        <StageCanvas
          items={fixtures.map((fixture) => ({ fixture, state: litStates.get(fixture.id) }))}
        />
      </section>
    </>
  );
}
