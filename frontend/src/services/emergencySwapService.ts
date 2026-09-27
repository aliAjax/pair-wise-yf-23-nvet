import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { parseFixtureStates, serializeFixtureStates } from "../constructors/CueSceneConstructor";
import { createDefaultEmergencySwapRecord } from "../constructors/EmergencySwapConstructor";
import type { CueScene } from "../types/CueScene";
import type { EmergencySwapRecord, SwapIssue } from "../types/EmergencySwap";
import type { Fixture } from "../types/Fixture";
import type { ShowProject } from "../types/ShowProject";
import { findDmxConflict } from "../utils/dmx";

export interface SwapCandidateView {
  fixture: Fixture;
  eligible: boolean;
  /** 不可选时的原因（未就位 / DMX 冲突对象），可选时不填 */
  reason?: string;
}

export interface SwapPlanInput {
  fixtures: Fixture[];
  cues: CueScene[];
  faultyId: number | null;
  standinId: number | null;
}

export interface SwapPlanResult {
  cues: CueScene[];
  fixtures: Fixture[];
  projects: ShowProject[];
  record: EmergencySwapRecord;
  affectedCueIds: number[];
}

function fill(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

/** 引用故障灯的 Cue，按 id 升序（校验与提示都按这个顺序找"第一处"） */
export function findAffectedCues(cues: CueScene[], faultyId: number): CueScene[] {
  return cues
    .filter((cue) => parseFixtureStates(cue.fixture_states).some((state) => state.fixture_id === faultyId))
    .sort((a, b) => a.id - b.id);
}

/**
 * 替身候选清单：同类型、非故障灯本身全部列出；
 * 未就位或 DMX 冲突的标出原因，由页面禁用并提示。
 */
export function listSwapCandidates(fixtures: Fixture[], faultyId: number | null): SwapCandidateView[] {
  const faulty = fixtures.find((fixture) => fixture.id === faultyId) ?? null;
  if (!faulty) return [];
  return fixtures
    .filter((fixture) => fixture.id !== faulty.id && fixture.fixture_type === faulty.fixture_type)
    .map((fixture) => {
      if (fixture.fixture_status === "NOT_READY") {
        return { fixture, eligible: false, reason: "未就位" };
      }
      // 故障灯即将下线，不与候选灯构成冲突
      const pool = fixtures.filter((other) => other.id !== faulty.id);
      const conflict = findDmxConflict(fixture, pool);
      if (conflict) {
        return { fixture, eligible: false, reason: `DMX 与 ${conflict.conflictsWith.fixture_code} 冲突` };
      }
      return { fixture, eligible: true };
    });
}

/**
 * 换灯校验，严格按顺序检查，命中即返回第一处问题：
 * 故障灯 → 替身灯 → 替身就位 → 类型一致 → DMX 冲突 → 逐 Cue（已归档 / 已引用替身）。
 */
export function validateSwap(input: SwapPlanInput): SwapIssue | null {
  const { fixtures, cues, faultyId, standinId } = input;

  if (faultyId === null) {
    return { code: ERROR_CODES.SWAP_FAULTY_REQUIRED, message: ERROR_MESSAGES.SWAP_FAULTY_REQUIRED };
  }
  if (standinId === null) {
    return { code: ERROR_CODES.SWAP_STANDIN_REQUIRED, message: ERROR_MESSAGES.SWAP_STANDIN_REQUIRED };
  }

  const faulty = fixtures.find((fixture) => fixture.id === faultyId);
  const standin = fixtures.find((fixture) => fixture.id === standinId);
  if (!faulty || !standin) {
    return { code: ERROR_CODES.VALIDATION_FAILED, message: ERROR_MESSAGES.VALIDATION_FAILED };
  }

  if (standin.fixture_status === "NOT_READY") {
    return {
      code: ERROR_CODES.SWAP_STANDIN_NOT_READY,
      message: fill(ERROR_MESSAGES.SWAP_STANDIN_NOT_READY, { name: standin.fixture_code })
    };
  }
  if (standin.fixture_type !== faulty.fixture_type) {
    return {
      code: ERROR_CODES.SWAP_TYPE_MISMATCH,
      message: fill(ERROR_MESSAGES.SWAP_TYPE_MISMATCH, { name: standin.fixture_code })
    };
  }

  const pool = fixtures.filter((fixture) => fixture.id !== faulty.id);
  const conflict = findDmxConflict(standin, pool);
  if (conflict) {
    return {
      code: ERROR_CODES.SWAP_DMX_CONFLICT,
      message: fill(ERROR_MESSAGES.SWAP_DMX_CONFLICT, {
        name: standin.fixture_code,
        code: conflict.conflictsWith.fixture_code
      })
    };
  }

  for (const cue of findAffectedCues(cues, faulty.id)) {
    if (cue.scene_status === "ARCHIVED") {
      return {
        code: ERROR_CODES.SWAP_CUE_ARCHIVED,
        message: fill(ERROR_MESSAGES.SWAP_CUE_ARCHIVED, { name: cue.name })
      };
    }
    const states = parseFixtureStates(cue.fixture_states);
    if (states.some((state) => state.fixture_id === standin.id)) {
      return {
        code: ERROR_CODES.SWAP_STANDIN_ALREADY_IN_CUE,
        message: fill(ERROR_MESSAGES.SWAP_STANDIN_ALREADY_IN_CUE, { name: cue.name })
      };
    }
  }

  return null;
}

/**
 * 纯计算换灯结果（不触碰存储）：
 * - 受影响 Cue 的 fixture_states 中故障灯 id 换成替身 id，亮度/颜色原样保留
 * - 故障灯状态置为 FAULT
 * - 引用故障灯的演出方案 fixture_ids 同步替换（去重）并刷新 updated_at
 */
export function applySwap(
  fixtures: Fixture[],
  cues: CueScene[],
  projects: ShowProject[],
  faultyId: number,
  standinId: number,
  recordId: number
): SwapPlanResult {
  const affectedCueIds: number[] = [];

  const nextCues = cues.map((cue) => {
    const states = parseFixtureStates(cue.fixture_states);
    if (!states.some((state) => state.fixture_id === faultyId)) return cue;
    affectedCueIds.push(cue.id);
    const swapped = states.map((state) =>
      state.fixture_id === faultyId ? { ...state, fixture_id: standinId } : state
    );
    return { ...cue, fixture_states: serializeFixtureStates(swapped) };
  });

  const nextFixtures = fixtures.map((fixture) =>
    fixture.id === faultyId ? { ...fixture, fixture_status: "FAULT" } : fixture
  );

  const now = new Date().toISOString();
  const nextProjects = projects.map((project) => {
    if (!project.fixture_ids.includes(faultyId)) return project;
    const ids = project.fixture_ids.map((id) => (id === faultyId ? standinId : id));
    return { ...project, fixture_ids: [...new Set(ids)], updated_at: now };
  });

  const record = createDefaultEmergencySwapRecord({
    id: recordId,
    faulty_fixture_id: faultyId,
    standin_fixture_id: standinId,
    affected_cue_ids: affectedCueIds,
    applied_at: now
  });

  return { cues: nextCues, fixtures: nextFixtures, projects: nextProjects, record, affectedCueIds };
}
