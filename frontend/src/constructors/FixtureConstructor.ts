import type { Fixture } from "../types/Fixture";

export const createDefaultFixture = (overrides: Partial<Fixture> = {}): Fixture => ({
  id: 0,
  fixture_code: "SPOT-00",
  fixture_type: "SPOT",
  position_x: "50",
  position_y: "50",
  dmx_address: "1",
  channel_count: 8,
  color_mode: "RGBW",
  rig_status: "STANDBY",
  ...overrides
});

export const createFixtureForm = createDefaultFixture;
export const createFixtureResponse = createDefaultFixture;
