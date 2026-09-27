import type { ShowProject } from "../types/ShowProject";

export const createDefaultShowProject = (overrides: Partial<ShowProject> = {}): ShowProject => ({
  id: 0,
  title: "未命名演出",
  venue_name: "未定场地",
  fixture_ids: [],
  track_ids: [],
  updated_at: new Date().toISOString(),
  ...overrides
});

export const createShowProjectForm = createDefaultShowProject;
export const createShowProjectResponse = createDefaultShowProject;
