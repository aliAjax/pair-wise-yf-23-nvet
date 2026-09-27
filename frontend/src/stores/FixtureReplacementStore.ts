import { create } from "zustand";
import { saveCueScene } from "../api/CueScene";
import { listFixtureReplacement, saveFixtureReplacement } from "../api/FixtureReplacement";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { createFixtureReplacementRecord } from "../constructors/FixtureReplacementConstructor";
import type { FixtureReplacement, ReplacementProblem } from "../types/FixtureReplacement";
import { planFixtureReplacement, type ReplacementPlan } from "../utils/replacement";
import { useCueSceneStore } from "./CueSceneStore";
import { useFixtureStore } from "./FixtureStore";

type State = {
  rows: FixtureReplacement[];
  loading: boolean;
  busy: boolean;
  lastProblem: ReplacementProblem | null;
  lastDone: FixtureReplacement | null;
  load: () => Promise<void>;
  execute: (failedId: number, replacementId: number) => Promise<ReplacementPlan>;
  clearFeedback: () => void;
};

export const useFixtureReplacementStore = create<State>((set) => ({
  rows: [],
  loading: false,
  busy: false,
  lastProblem: null,
  lastDone: null,
  async load() {
    set({ loading: true });
    set({ rows: await listFixtureReplacement(), loading: false });
  },
  async execute(failedId, replacementId) {
    const fixtures = useFixtureStore.getState().rows;
    const cues = useCueSceneStore.getState().rows;
    const plan = planFixtureReplacement({ fixtures, cues, failedId, replacementId });
    console.info(LOG_TEMPLATES.FixtureReplacement[0], plan);
    if (!plan.ok) {
      // 校验失败：一个字符都不写入，只把第一处问题抛回页面。
      console.warn(LOG_TEMPLATES.FixtureReplacement[1], plan.problem);
      set({ lastProblem: plan.problem, lastDone: null });
      return plan;
    }
    set({ busy: true });
    try {
      for (const cue of plan.updatedCues) {
        await saveCueScene(cue);
      }
      useCueSceneStore.setState((state) => ({
        rows: state.rows.map((row) => plan.updatedCues.find((cue) => cue.id === row.id) ?? row)
      }));
      const record = createFixtureReplacementRecord({
        failed_fixture_id: failedId,
        replacement_fixture_id: replacementId,
        affected_cue_ids: plan.affectedCueIds
      });
      await saveFixtureReplacement(record);
      set((state) => ({
        rows: [...state.rows, record],
        busy: false,
        lastProblem: null,
        lastDone: record
      }));
      return plan;
    } catch (error) {
      // store 层单独包装持久化异常，不与 service 层的兜底混在一起。
      console.error(LOG_TEMPLATES.FixtureReplacement[1], error);
      const problem: ReplacementProblem = {
        code: ERROR_CODES.REPLACEMENT_PERSIST_FAILED,
        message: ERROR_MESSAGES.REPLACEMENT_PERSIST_FAILED
      };
      set({ busy: false, lastProblem: problem, lastDone: null });
      return { ok: false, problem, affectedCueIds: [], updatedCues: [] };
    }
  },
  clearFeedback() {
    set({ lastProblem: null, lastDone: null });
  }
}));
