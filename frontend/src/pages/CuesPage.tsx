import { useMemo, useState } from "react";
import { CueStatus } from "../constants/CueStatus";
import { STATUS_TEXT } from "../constants/statusText";
import { parseFixtureStates, serializeFixtureStates } from "../constructors/CueSceneConstructor";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useFixtureStore } from "../stores/FixtureStore";
import { ColorChannelSlider } from "../components/common/ColorChannelSlider";
import { CueCard } from "../components/common/CueCard";
import { EmptyState } from "../components/common/EmptyState";
import { FixtureIcon } from "../components/common/FixtureIcon";
import { PropertyPanel } from "../components/common/PropertyPanel";
import { StatCard } from "../components/common/StatCard";
import type { CueScene } from "../types/CueScene";

export function CuesPage() {
  const cues = useCueSceneStore((state) => state.rows);
  const upsertCue = useCueSceneStore((state) => state.upsert);
  const fixtures = useFixtureStore((state) => state.rows);

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filtered = useMemo(
    () => (statusFilter === "ALL" ? cues : cues.filter((cue) => cue.scene_status === statusFilter)),
    [cues, statusFilter]
  );
  const selected = cues.find((cue) => cue.id === selectedId) ?? null;
  const selectedStates = useMemo(
    () => (selected ? parseFixtureStates(selected.fixture_states) : []),
    [selected]
  );

  const patchState = (cue: CueScene, fixtureId: number, patch: Partial<{ intensity: number; color: string }>) => {
    const states = parseFixtureStates(cue.fixture_states).map((state) =>
      state.fixture_id === fixtureId ? { ...state, ...patch } : state
    );
    void upsertCue({ ...cue, fixture_states: serializeFixtureStates(states) });
  };

  return (
    <>
      <section className="metrics">
        <StatCard label="Cue 总数" value={cues.length} />
        <StatCard label="就绪" value={cues.filter((cue) => cue.scene_status === "READY").length} />
        <StatCard label="已归档" value={cues.filter((cue) => cue.scene_status === "ARCHIVED").length} />
      </section>

      <section className="filter-bar">
        {["ALL", ...CueStatus].map((status) => (
          <button
            key={status}
            type="button"
            className={statusFilter === status ? "active" : ""}
            onClick={() => setStatusFilter(status)}
          >
            {status === "ALL" ? "全部" : STATUS_TEXT.CueStatus[status as keyof typeof STATUS_TEXT.CueStatus] ?? status}
          </button>
        ))}
      </section>

      <section className="workbench">
        <div className="panel wide">
          <h2>场景列表</h2>
          {filtered.length === 0 && <EmptyState title="该状态下没有 Cue" />}
          <div className="cue-list">
            {filtered.map((cue) => (
              <CueCard key={cue.id} cue={cue} active={cue.id === selectedId} onClick={() => setSelectedId(cue.id)} />
            ))}
          </div>
        </div>

        <PropertyPanel title={selected ? `灯具状态 · ${selected.name}` : "灯具状态"}>
          {!selected && <p className="hint">选一个 Cue 查看并调整每盏灯的亮度与颜色。</p>}
          {selected && selectedStates.length === 0 && <p className="hint">该 Cue 还没有灯具状态。</p>}
          {selectedStates.map((state) => {
            const fixture = fixtures.find((item) => item.id === state.fixture_id);
            const editingCue = selected as CueScene;
            return (
              <div key={state.fixture_id} className="cue-fixture-state">
                <div className="cue-fixture-head">
                  {fixture && <FixtureIcon fixture={fixture} size={24} />}
                  <strong>{fixture?.fixture_code ?? `灯具 #${state.fixture_id}`}</strong>
                  <input
                    type="color"
                    value={state.color}
                    onChange={(event) => patchState(editingCue, state.fixture_id, { color: event.target.value })}
                  />
                </div>
                <ColorChannelSlider
                  label="亮度"
                  value={state.intensity}
                  color={state.color}
                  onChange={(value) => patchState(editingCue, state.fixture_id, { intensity: value })}
                />
              </div>
            );
          })}
        </PropertyPanel>
      </section>
    </>
  );
}
