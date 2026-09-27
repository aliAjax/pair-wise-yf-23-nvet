export interface FixtureReplacement {
  id: number;
  failed_fixture_id: number;
  replacement_fixture_id: number;
  affected_cue_ids: number[];
  created_at: string;
}

export interface ReplacementProblem {
  code: string;
  message: string;
  cue_id?: number;
  fixture_id?: number;
}
