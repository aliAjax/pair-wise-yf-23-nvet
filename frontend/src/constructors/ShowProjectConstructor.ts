import type { ShowProject } from "../types/ShowProject";

export const createDefaultShowProject = (overrides: Partial<ShowProject> = {}): ShowProject => ({
  id: 0,
  title: "新演出方案",
  venue_name: "主剧场",
  fixture_ids: [],
  track_ids: [],
  updated_at: new Date().toISOString(),
  ...overrides
});

export const createShowProjectForm = createDefaultShowProject;
export const createShowProjectResponse = createDefaultShowProject;
