/** 应急换灯记录：一次"故障灯 → 替身灯"批量换引用的落档结果 */
export interface EmergencySwapRecord {
  id: number;
  faulty_fixture_id: number;
  standin_fixture_id: number;
  affected_cue_ids: number[];
  applied_at: string;
}

/** 校验失败时抛出/返回的结构，code 对应 constants/errorCodes */
export interface SwapIssue {
  code: string;
  message: string;
}
