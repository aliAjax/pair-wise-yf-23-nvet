import { useEffect, useMemo, useState } from "react";
import { CueCard } from "../components/common/CueCard";
import { DmxBadge } from "../components/common/DmxBadge";
import { EmptyState } from "../components/common/EmptyState";
import { FixtureIcon } from "../components/common/FixtureIcon";
import { PropertyPanel } from "../components/common/PropertyPanel";
import { StageCanvas } from "../components/common/StageCanvas";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { ChannelModeText } from "../constants/ChannelMode";
import { ERROR_CODES } from "../constants/errorCodes";
import { FixtureTypeText } from "../constants/FixtureType";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { RigStatus, RigStatusText } from "../constants/RigStatus";
import { useDmxAddressCheck } from "../hooks/useDmxAddressCheck";
import { useIndexedDbStore } from "../hooks/useIndexedDbStore";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useFixtureReplacementStore } from "../stores/FixtureReplacementStore";
import { useFixtureStore } from "../stores/FixtureStore";
import { useShowProjectStore } from "../stores/ShowProjectStore";
import type { ChannelMode } from "../types/ChannelMode";
import type { Fixture } from "../types/Fixture";
import type { FixtureType } from "../types/FixtureType";
import type { RigStatus as RigStatusValue } from "../types/RigStatus";
import { findDmxConflicts } from "../utils/dmx";
import { parseFixtureStates } from "../utils/fixtureStates";
import { formatDate } from "../utils/formatters";
import { planFixtureReplacement } from "../utils/replacement";

export function FixturesPage() {
  const fixtures = useFixtureStore((state) => state.rows);
  const updateFixtureStatus = useFixtureStore((state) => state.updateStatus);
  const loadFixtures = useFixtureStore((state) => state.load);
  const cues = useCueSceneStore((state) => state.rows);
  const loadCues = useCueSceneStore((state) => state.load);
  const projects = useShowProjectStore((state) => state.rows);
  const loadProjects = useShowProjectStore((state) => state.load);
  const replacements = useFixtureReplacementStore((state) => state.rows);
  const busy = useFixtureReplacementStore((state) => state.busy);
  const lastProblem = useFixtureReplacementStore((state) => state.lastProblem);
  const lastDone = useFixtureReplacementStore((state) => state.lastDone);
  const execute = useFixtureReplacementStore((state) => state.execute);
  const clearFeedback = useFixtureReplacementStore((state) => state.clearFeedback);
  const loadReplacements = useFixtureReplacementStore((state) => state.load);

  const ready = useIndexedDbStore([loadFixtures, loadCues, loadProjects, loadReplacements]);

  const [failedId, setFailedId] = useState<number | null>(null);
  const [candidateId, setCandidateId] = useState<number | null>(null);

  const failed =
    fixtures.find((fixture) => fixture.id === failedId) ??
    fixtures.find((fixture) => fixture.rig_status === "FAULTY") ??
    null;

  useEffect(() => {
    clearFeedback();
  }, [failed?.id, candidateId, clearFeedback]);

  const candidates = useMemo(() => {
    if (!failed) return [] as Fixture[];
    const rank = (fixture: Fixture) => {
      if (fixture.rig_status === "FAULTY") return 3;
      if (fixture.rig_status !== "RIGGED") return 2;
      return findDmxConflicts(fixtures, fixture, [failed.id]).length > 0 ? 1 : 0;
    };
    return fixtures
      .filter((fixture) => fixture.id !== failed.id && fixture.fixture_type === failed.fixture_type)
      .sort((a, b) => rank(a) - rank(b) || a.id - b.id);
  }, [fixtures, failed]);

  const conflictMap = useMemo(() => {
    const map = new Map<number, Fixture[]>();
    if (!failed) return map;
    for (const candidate of candidates) {
      map.set(candidate.id, findDmxConflicts(fixtures, candidate, [failed.id]));
    }
    return map;
  }, [candidates, fixtures, failed]);

  const candidateCheck = useDmxAddressCheck(fixtures, candidateId, failed?.id ?? null);

  const affectedCues = useMemo(() => {
    if (!failed) return [];
    return cues
      .filter((cue) => parseFixtureStates(cue.fixture_states).some((state) => state.fixture_id === failed.id))
      .sort((a, b) => a.id - b.id);
  }, [cues, failed]);

  const livePlan = useMemo(() => {
    if (!failed || candidateId == null) return null;
    return planFixtureReplacement({ fixtures, cues, failedId: failed.id, replacementId: candidateId });
  }, [fixtures, cues, failed, candidateId]);

  // 校验类问题始终以当前数据实时重算为准；store 里的反馈只补充持久化失败这类实时算不出的问题。
  const problem =
    livePlan?.problem ??
    (lastProblem?.code === ERROR_CODES.REPLACEMENT_PERSIST_FAILED ? lastProblem : null);
  const nothingToSwap = livePlan?.ok === true && livePlan.affectedCueIds.length === 0;

  const codeOf = (fixtureId: number) =>
    fixtures.find((fixture) => fixture.id === fixtureId)?.fixture_code ?? `#${fixtureId}`;

  const project = projects[0];
  const faultyCount = fixtures.filter((fixture) => fixture.rig_status === "FAULTY").length;

  const onExecute = async () => {
    if (!failed || candidateId == null || busy) return;
    await execute(failed.id, candidateId);
  };

  const onExport = () => {
    console.info(LOG_TEMPLATES.FixtureReplacement[3], replacements);
    const blob = new Blob([JSON.stringify(replacements, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "fixture-replacements.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (!ready) {
    return (
      <main className="page">
        <EmptyState title="正在加载本地数据…" />
      </main>
    );
  }

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light · 应急换灯台</p>
          <h1>灯具布置</h1>
          <p className="sub">
            演出方案：{project?.title ?? "—"} · {project?.venue_name ?? "—"}
          </p>
        </div>
        {failed ? (
          <StatusBadge value="FAULTY" text={`故障灯：${failed.fixture_code}`} />
        ) : (
          <StatusBadge value="RIGGED" text="全部正常" />
        )}
      </section>

      <section className="metrics">
        <StatCard label="灯具总数" value={fixtures.length} />
        <StatCard label="故障灯具" value={faultyCount} />
        <StatCard label="受影响 Cue" value={affectedCues.length} />
        <StatCard label="已执行换灯" value={replacements.length} />
      </section>

      <section className="workbench">
        <div className="panel wide">
          <h2>灯位图（点击灯点设为故障灯）</h2>
          <StageCanvas fixtures={fixtures} selectedId={failed?.id ?? null} onSelectFixture={setFailedId} />
          <h2>灯具清单</h2>
          <div className="fixture-table">
            <div className="ft-row ft-head">
              <span>故障</span>
              <span>灯具</span>
              <span>DMX 地址</span>
              <span>通道</span>
              <span>色彩模式</span>
              <span>就位状态</span>
            </div>
            {fixtures.map((fixture) => (
              <div
                key={fixture.id}
                className={
                  "ft-row" +
                  (fixture.rig_status === "FAULTY" ? " faulty" : "") +
                  (failed?.id === fixture.id ? " active" : "")
                }
              >
                <input
                  type="radio"
                  name="failed-fixture"
                  checked={failed?.id === fixture.id}
                  onChange={() => setFailedId(fixture.id)}
                />
                <FixtureIcon fixture={fixture} />
                <DmxBadge fixture={fixture} />
                <span>{fixture.channel_count}</span>
                <span>{ChannelModeText[fixture.color_mode as ChannelMode] ?? fixture.color_mode}</span>
                <select
                  value={fixture.rig_status}
                  onChange={(event) => {
                    const rig_status = event.target.value;
                    void updateFixtureStatus({ ...fixture, rig_status });
                    if (rig_status === "FAULTY") setFailedId(fixture.id);
                  }}
                >
                  {RigStatus.map((status) => (
                    <option key={status} value={status}>
                      {RigStatusText[status]}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>应急换灯台</h2>
          {failed ? (
            <>
              <PropertyPanel
                title="故障灯"
                items={[
                  ["编号", failed.fixture_code],
                  ["类型", FixtureTypeText[failed.fixture_type as FixtureType] ?? failed.fixture_type],
                  ["DMX", <DmxBadge key="dmx" fixture={failed} />],
                  [
                    "状态",
                    <StatusBadge
                      key="status"
                      value={failed.rig_status}
                      text={RigStatusText[failed.rig_status as RigStatusValue] ?? failed.rig_status}
                    />
                  ]
                ]}
              />

              <h3>选择替身（同类型 · DMX 不冲突）</h3>
              <div className="candidate-list">
                {candidates.map((candidate) => {
                  const conflicts = conflictMap.get(candidate.id) ?? [];
                  const unusable = candidate.rig_status === "FAULTY";
                  return (
                    <label
                      key={candidate.id}
                      className={"candidate-row" + (problem?.fixture_id === candidate.id ? " danger" : "")}
                    >
                      <input
                        type="radio"
                        name="candidate-fixture"
                        disabled={unusable}
                        checked={candidateId === candidate.id}
                        onChange={() => setCandidateId(candidate.id)}
                      />
                      <FixtureIcon fixture={candidate} />
                      <DmxBadge fixture={candidate} />
                      {conflicts.length > 0 && (
                        <span className="hint warn">与 {conflicts[0].fixture_code} 地址冲突</span>
                      )}
                      {candidate.rig_status === "STANDBY" && <span className="hint warn">未就位</span>}
                      {unusable && <span className="hint warn">故障不可用</span>}
                    </label>
                  );
                })}
                {candidates.length === 0 && <EmptyState title="没有同类型灯具可作替身" />}
              </div>

              {candidateCheck.candidate && (
                <PropertyPanel
                  title="替身检查"
                  items={[
                    ["编号", candidateCheck.candidate.fixture_code],
                    ["DMX", <DmxBadge key="dmx" fixture={candidateCheck.candidate} />],
                    [
                      "地址冲突",
                      candidateCheck.hasConflict
                        ? `与 ${candidateCheck.conflicts[0].fixture_code} 冲突`
                        : "无冲突"
                    ]
                  ]}
                />
              )}

              <h3>受影响 Cue（{affectedCues.length}）</h3>
              <div className="affected-list">
                {affectedCues.map((cue) => (
                  <CueCard key={cue.id} cue={cue} fixtures={fixtures} highlight={problem?.cue_id === cue.id} />
                ))}
                {affectedCues.length === 0 && <EmptyState title="没有 Cue 引用该故障灯" />}
              </div>

              {problem && <div className="alert error">第一处问题：{problem.message}</div>}
              {!problem && livePlan?.ok && livePlan.affectedCueIds.length > 0 && (
                <div className="alert info">
                  校验通过：将批量改写 {livePlan.affectedCueIds.length} 个 Cue，亮度与颜色保持不变。
                </div>
              )}
              {!problem && nothingToSwap && !lastDone && (
                <div className="alert info">没有 Cue 引用该故障灯，无需换灯。</div>
              )}
              {lastDone && (
                <div className="alert success">
                  换灯完成：{codeOf(lastDone.failed_fixture_id)} → {codeOf(lastDone.replacement_fixture_id)}，已批量改写{" "}
                  {lastDone.affected_cue_ids.length} 个 Cue 并写入本地数据库。
                </div>
              )}
              <button
                type="button"
                className="btn-primary"
                disabled={candidateId == null || busy || nothingToSwap}
                onClick={() => void onExecute()}
              >
                {busy ? "正在写入…" : "执行应急换灯"}
              </button>
            </>
          ) : (
            <EmptyState title="当前没有故障灯：点击灯位图圆点，或在清单中选择" />
          )}
        </div>
      </section>

      <section className="panel wide">
        <div className="history-head">
          <h2>换灯记录（刷新页面后仍保留）</h2>
          <button type="button" onClick={onExport} disabled={replacements.length === 0}>
            导出记录
          </button>
        </div>
        {replacements.length === 0 && <EmptyState title="还没有执行过换灯" />}
        {[...replacements]
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .map((record) => (
            <div className="row" key={record.id}>
              <strong>
                {codeOf(record.failed_fixture_id)} → {codeOf(record.replacement_fixture_id)}
              </strong>
              <span>{record.affected_cue_ids.length} 个 Cue</span>
              <span>{formatDate(record.created_at)}</span>
            </div>
          ))}
      </section>
    </main>
  );
}
