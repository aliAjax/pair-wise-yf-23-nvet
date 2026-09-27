import type { Fixture } from "../types/Fixture";

export const createDefaultFixture = (overrides: Partial<Fixture> = {}): Fixture => ({
  id: 0,
  fixture_code: "PAR-01",
  fixture_type: "PAR",
  position_x: "50",
  position_y: "20",
  dmx_address: "1",
  channel_count: 4,
  color_mode: "RGBW",
  fixture_status: "IN_PLACE",
  ...overrides
});

export const createFixtureForm = createDefaultFixture;
export const createFixtureResponse = createDefaultFixture;
