import type { FixtureReplacement } from "../types/FixtureReplacement";

export const createDefaultFixtureReplacement = (overrides: Partial<FixtureReplacement> = {}): FixtureReplacement => ({
  id: Date.now(),
  failed_fixture_id: 0,
  replacement_fixture_id: 0,
  affected_cue_ids: [],
  created_at: new Date().toISOString(),
  ...overrides
});

export const createFixtureReplacementRecord = createDefaultFixtureReplacement;
export const createFixtureReplacementResponse = createDefaultFixtureReplacement;
