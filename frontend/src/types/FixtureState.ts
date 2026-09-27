/**
 * CueScene.fixture_states 以 JSON 字符串存储，
 * 每条记录描述某盏灯在该 Cue 中的亮度与颜色（换灯时原样保留）。
 */
export interface FixtureState {
  fixture_id: number;
  intensity: number;
  color: string;
}
