import type { CueScene } from "../types/CueScene";
import type { Fixture } from "../types/Fixture";
import type { ShowProject } from "../types/ShowProject";
import type { TimelineTrack } from "../types/TimelineTrack";

const fixture: Fixture[] = [
  { id: 1, fixture_code: "SPOT-01", fixture_type: "SPOT", position_x: "12", position_y: "18", dmx_address: "1", channel_count: 8, color_mode: "RGBW", rig_status: "RIGGED" },
  { id: 2, fixture_code: "SPOT-02", fixture_type: "SPOT", position_x: "30", position_y: "18", dmx_address: "9", channel_count: 8, color_mode: "RGBW", rig_status: "FAULTY" },
  { id: 3, fixture_code: "SPOT-03", fixture_type: "SPOT", position_x: "48", position_y: "18", dmx_address: "17", channel_count: 8, color_mode: "RGBW", rig_status: "RIGGED" },
  { id: 4, fixture_code: "SPOT-04", fixture_type: "SPOT", position_x: "66", position_y: "18", dmx_address: "25", channel_count: 8, color_mode: "RGBW", rig_status: "STANDBY" },
  { id: 5, fixture_code: "SPOT-05", fixture_type: "SPOT", position_x: "84", position_y: "18", dmx_address: "33", channel_count: 8, color_mode: "RGBW", rig_status: "RIGGED" },
  { id: 6, fixture_code: "SPOT-06", fixture_type: "SPOT", position_x: "84", position_y: "42", dmx_address: "4", channel_count: 8, color_mode: "RGBW", rig_status: "RIGGED" },
  { id: 7, fixture_code: "WASH-01", fixture_type: "WASH", position_x: "22", position_y: "62", dmx_address: "41", channel_count: 12, color_mode: "RGB", rig_status: "RIGGED" },
  { id: 8, fixture_code: "WASH-02", fixture_type: "WASH", position_x: "58", position_y: "62", dmx_address: "53", channel_count: 12, color_mode: "RGB", rig_status: "RIGGED" },
  { id: 9, fixture_code: "BEAM-01", fixture_type: "BEAM", position_x: "40", position_y: "84", dmx_address: "65", channel_count: 16, color_mode: "MOVING_HEAD", rig_status: "RIGGED" }
];

const cueScene: CueScene[] = [
  {
    id: 1,
    name: "开场暖场",
    fixture_states: '[{"fixture_id":1,"intensity":80,"color":"#ffb347"},{"fixture_id":2,"intensity":90,"color":"#ff8040"},{"fixture_id":7,"intensity":60,"color":"#3366ff"}]',
    fade_in_ms: "2000",
    hold_ms: "8000",
    priority: "1",
    scene_status: "READY"
  },
  {
    id: 2,
    name: "独白聚光",
    fixture_states: '[{"fixture_id":2,"intensity":100,"color":"#ffffff"},{"fixture_id":3,"intensity":70,"color":"#fff2cc"}]',
    fade_in_ms: "500",
    hold_ms: "12000",
    priority: "2",
    scene_status: "READY"
  },
  {
    id: 3,
    name: "全场染色",
    fixture_states: '[{"fixture_id":7,"intensity":85,"color":"#22cc88"},{"fixture_id":8,"intensity":85,"color":"#8844ff"},{"fixture_id":2,"intensity":50,"color":"#ff4040"}]',
    fade_in_ms: "3000",
    hold_ms: "6000",
    priority: "3",
    scene_status: "DRAFT"
  },
  {
    id: 4,
    name: "谢幕光束",
    fixture_states: '[{"fixture_id":1,"intensity":70,"color":"#ffd9a0"},{"fixture_id":9,"intensity":90,"color":"#ffffff"}]',
    fade_in_ms: "1500",
    hold_ms: "5000",
    priority: "4",
    scene_status: "DISABLED"
  },
  {
    id: 5,
    name: "旧版开场（归档）",
    fixture_states: '[{"fixture_id":1,"intensity":60,"color":"#ffaa00"},{"fixture_id":7,"intensity":40,"color":"#0044ff"}]',
    fade_in_ms: "1000",
    hold_ms: "4000",
    priority: "9",
    scene_status: "ARCHIVED"
  }
];

const timelineTrack: TimelineTrack[] = [
  { id: 1, cue_scene_id: 1, start_ms: "0", duration_ms: "11000", layer: "1", locked: "0" },
  { id: 2, cue_scene_id: 2, start_ms: "11000", duration_ms: "13000", layer: "1", locked: "0" },
  { id: 3, cue_scene_id: 3, start_ms: "25000", duration_ms: "10000", layer: "2", locked: "0" },
  { id: 4, cue_scene_id: 4, start_ms: "36000", duration_ms: "7000", layer: "1", locked: "1" }
];

const showProject: ShowProject[] = [
  {
    id: 1,
    title: "午夜剧场 · 夏季巡演",
    venue_name: "实验剧场",
    fixture_ids: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    track_ids: [1, 2, 3, 4],
    updated_at: "2026-09-27T09:00:00Z"
  }
];

export const mockData = { fixture, cueScene, timelineTrack, showProject };
