import { LOG_TEMPLATES } from "../constants/logTemplates";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useEmergencySwapStore } from "../stores/EmergencySwapStore";
import { useFixtureStore } from "../stores/FixtureStore";
import { useShowProjectStore } from "../stores/ShowProjectStore";
import type { EmergencySwapRecord, SwapIssue } from "../types/EmergencySwap";
import { logOp } from "../utils/logger";
import { applySwap, validateSwap } from "../services/emergencySwapService";

export interface SubmitSwapResult {
  ok: boolean;
  issue?: SwapIssue;
  record?: EmergencySwapRecord;
}

/**
 * 应急换灯提交入口（controller 层）：
 * 先经 service 校验——任一 Cue 已归档或替身未就位等问题出现时整批不写入；
 * 全部通过后一次性落库并同步各 store，场景/时间轴/预览页即时可见。
 */
export async function submitEmergencySwap(faultyId: number | null, standinId: number | null): Promise<SubmitSwapResult> {
  const fixtures = useFixtureStore.getState().rows;
  const cues = useCueSceneStore.getState().rows;
  const projects = useShowProjectStore.getState().rows;

  const issue = validateSwap({ fixtures, cues, faultyId, standinId });
  if (issue) {
    logOp(LOG_TEMPLATES.EmergencySwap[0], `${issue.code}: ${issue.message}`);
    return { ok: false, issue };
  }

  const recordId = Date.now();
  const plan = applySwap(fixtures, cues, projects, faultyId!, standinId!, recordId);

  const faulty = fixtures.find((fixture) => fixture.id === faultyId);
  const standin = fixtures.find((fixture) => fixture.id === standinId);
  const changedCues = plan.cues.filter((cue) => plan.affectedCueIds.includes(cue.id));
  const changedFixtures = plan.fixtures.filter((fixture) => fixture.id === faultyId);
  const changedProjects = plan.projects.filter((project, index) => project !== projects[index]);

  // 落库 + 同步内存态：Cue、灯具、方案、换灯记录
  await useCueSceneStore.getState().upsertMany(changedCues);
  await useFixtureStore.getState().upsertMany(changedFixtures);
  for (const project of changedProjects) {
    await useShowProjectStore.getState().upsert(project);
  }
  await useEmergencySwapStore.getState().append(plan.record);

  // 写操作日志（模板集中在 constants/logTemplates）
  const pair = `${faulty?.fixture_code ?? faultyId} → ${standin?.fixture_code ?? standinId}`;
  logOp(LOG_TEMPLATES.CueScene[4], `${plan.affectedCueIds.length} 个 Cue 改用替身（${pair}），亮度颜色保持不变`);
  logOp(LOG_TEMPLATES.Fixture[4], `${faulty?.fixture_code ?? faultyId} 标记为故障`);
  for (const project of changedProjects) {
    logOp(LOG_TEMPLATES.ShowProject[4], `「${project.title}」灯具清单同步：${pair}`);
  }
  logOp(LOG_TEMPLATES.TimelineTrack[4], `时间轴沿用原 Cue，无需改轨道（${plan.affectedCueIds.length} 个 Cue 已换灯）`);
  logOp(LOG_TEMPLATES.EmergencySwap[1], `${pair}，影响 Cue：${plan.affectedCueIds.join(", ") || "无"}`);

  return { ok: true, record: plan.record };
}
