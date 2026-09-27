export interface Fixture {
  id: number;
  fixture_code: string;
  fixture_type: string;
  position_x: string;
  position_y: string;
  dmx_address: string;
  channel_count: number;
  color_mode: string;
  /** 就位状态：IN_PLACE 已就位 / NOT_READY 未就位 / FAULT 演出中故障 */
  fixture_status: string;
}
