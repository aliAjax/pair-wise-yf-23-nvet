import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { FixtureTypeText } from "../constants/FixtureType";
import { RigStatusText } from "../constants/RigStatus";
import type { CueScene } from "../types/CueScene";
import type { Fixture } from "../types/Fixture";
import type { ReplacementProblem } from "../types/FixtureReplacement";
import type { RigStatus } from "../types/RigStatus";
import { findDmxConflicts } from "./dmx";
import { parseFixtureStates, replaceFixtureInStates } from "./fixtureStates";
import { interpolate } from "./formatters";

export interface ReplacementPlan {
  ok: boolean;
  problem: ReplacementProblem | null;
  affectedCueIds: number[];
  updatedCues: CueScene[];
}

const RIGGED: RigStatus = "RIGGED";
const ARCHIVED = "ARCHIVED";

// 校验顺序即“第一处问题”的报告顺序：
// 1) 灯具存在 2) 类型一致 3) 替身已就位 4) DMX 不冲突 5) 受影响 Cue 中没有已归档（按 id 升序取第一个）。
export function planFixtureReplacement(input: {
  fixtures: Fixture[];
  cues: CueScene[];
  failedId: number;
  replacementId: number;
}): ReplacementPlan {
  const { fixtures, cues, failedId, replacementId } = input;
  const failed = fixtures.find((fixture) => fixture.id === failedId);
  const replacement = fixtures.find((fixture) => fixture.id === replacementId);
  const fail = (problem: ReplacementProblem): ReplacementPlan => ({
    ok: false,
    problem,
    affectedCueIds: [],
    updatedCues: []
  });

  if (!failed) return fail({ code: ERROR_CODES.FIXTURE_NOT_FOUND, message: ERROR_MESSAGES.FIXTURE_NOT_FOUND });
  if (!replacement) {
    return fail({ code: ERROR_CODES.REPLACEMENT_NOT_FOUND, message: ERROR_MESSAGES.REPLACEMENT_NOT_FOUND });
  }
  if (replacement.fixture_type !== failed.fixture_type) {
    return fail({
      code: ERROR_CODES.REPLACEMENT_TYPE_MISMATCH,
      message: interpolate(ERROR_MESSAGES.REPLACEMENT_TYPE_MISMATCH, {
        type: FixtureTypeText[failed.fixture_type as keyof typeof FixtureTypeText] ?? failed.fixture_type
      }),
      fixture_id: replacement.id
    });
  }
  if (replacement.rig_status !== RIGGED) {
    return fail({
      code: ERROR_CODES.REPLACEMENT_NOT_RIGGED,
      message: interpolate(ERROR_MESSAGES.REPLACEMENT_NOT_RIGGED, {
        code: replacement.fixture_code,
        status: RigStatusText[replacement.rig_status as keyof typeof RigStatusText] ?? replacement.rig_status
      }),
      fixture_id: replacement.id
    });
  }
  // 故障灯已灭，它占用的 DMX 地址段视为释放，不参与冲突判定。
  const conflicts = findDmxConflicts(fixtures, replacement, [failedId]);
  if (conflicts.length > 0) {
    return fail({
      code: ERROR_CODES.REPLACEMENT_DMX_CONFLICT,
      message: interpolate(ERROR_MESSAGES.REPLACEMENT_DMX_CONFLICT, { code: conflicts[0].fixture_code }),
      fixture_id: replacement.id
    });
  }

  const affected = cues
    .filter((cue) => parseFixtureStates(cue.fixture_states).some((state) => state.fixture_id === failedId))
    .sort((a, b) => a.id - b.id);
  const archived = affected.find((cue) => cue.scene_status === ARCHIVED);
  if (archived) {
    return fail({
      code: ERROR_CODES.CUE_ARCHIVED_LOCKED,
      message: interpolate(ERROR_MESSAGES.CUE_ARCHIVED_LOCKED, { name: archived.name }),
      cue_id: archived.id
    });
  }

  const updatedCues = affected.map((cue) => ({
    ...cue,
    fixture_states: replaceFixtureInStates(cue.fixture_states, failedId, replacementId)
  }));
  return { ok: true, problem: null, affectedCueIds: affected.map((cue) => cue.id), updatedCues };
}
