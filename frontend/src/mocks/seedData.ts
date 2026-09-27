export const mockData = {
  "fixture": [
    {
      "id": 1,
      "fixture_code": "PAR-01",
      "fixture_type": "PAR",
      "position_x": "12",
      "position_y": "18",
      "dmx_address": "1",
      "channel_count": 4,
      "color_mode": "RGBW",
      "fixture_status": "IN_PLACE"
    },
    {
      "id": 2,
      "fixture_code": "PAR-02",
      "fixture_type": "PAR",
      "position_x": "30",
      "position_y": "18",
      "dmx_address": "5",
      "channel_count": 4,
      "color_mode": "RGBW",
      "fixture_status": "IN_PLACE"
    },
    {
      "id": 3,
      "fixture_code": "PAR-03",
      "fixture_type": "PAR",
      "position_x": "50",
      "position_y": "18",
      "dmx_address": "9",
      "channel_count": 4,
      "color_mode": "RGBW",
      "fixture_status": "IN_PLACE"
    },
    {
      "id": 4,
      "fixture_code": "WASH-01",
      "fixture_type": "WASH",
      "position_x": "70",
      "position_y": "18",
      "dmx_address": "13",
      "channel_count": 3,
      "color_mode": "RGB",
      "fixture_status": "IN_PLACE"
    },
    {
      "id": 5,
      "fixture_code": "SPOT-01",
      "fixture_type": "SPOT",
      "position_x": "50",
      "position_y": "45",
      "dmx_address": "17",
      "channel_count": 16,
      "color_mode": "MOVING_HEAD",
      "fixture_status": "IN_PLACE"
    },
    {
      "id": 6,
      "fixture_code": "BEAM-01",
      "fixture_type": "BEAM",
      "position_x": "88",
      "position_y": "18",
      "dmx_address": "33",
      "channel_count": 16,
      "color_mode": "MOVING_HEAD",
      "fixture_status": "IN_PLACE"
    },
    {
      "id": 7,
      "fixture_code": "SPARE-PAR-01",
      "fixture_type": "PAR",
      "position_x": "8",
      "position_y": "86",
      "dmx_address": "101",
      "channel_count": 4,
      "color_mode": "RGBW",
      "fixture_status": "IN_PLACE"
    },
    {
      "id": 8,
      "fixture_code": "SPARE-PAR-02",
      "fixture_type": "PAR",
      "position_x": "20",
      "position_y": "86",
      "dmx_address": "105",
      "channel_count": 4,
      "color_mode": "RGBW",
      "fixture_status": "NOT_READY"
    },
    {
      "id": 9,
      "fixture_code": "SPARE-WASH-01",
      "fixture_type": "WASH",
      "position_x": "32",
      "position_y": "86",
      "dmx_address": "109",
      "channel_count": 3,
      "color_mode": "RGB",
      "fixture_status": "IN_PLACE"
    },
    {
      "id": 10,
      "fixture_code": "SPARE-PAR-03",
      "fixture_type": "PAR",
      "position_x": "44",
      "position_y": "86",
      "dmx_address": "5",
      "channel_count": 4,
      "color_mode": "RGBW",
      "fixture_status": "IN_PLACE"
    }
  ],
  "cueScene": [
    {
      "id": 1,
      "name": "开场暖场",
      "fixture_states": "[{\"fixture_id\":1,\"intensity\":80,\"color\":\"#FFAA33\"},{\"fixture_id\":2,\"intensity\":80,\"color\":\"#FFAA33\"},{\"fixture_id\":3,\"intensity\":80,\"color\":\"#FFAA33\"}]",
      "fade_in_ms": "3000",
      "hold_ms": "5000",
      "priority": "1",
      "scene_status": "READY"
    },
    {
      "id": 2,
      "name": "主歌铺光",
      "fixture_states": "[{\"fixture_id\":1,\"intensity\":60,\"color\":\"#3366FF\"},{\"fixture_id\":4,\"intensity\":70,\"color\":\"#33CCFF\"}]",
      "fade_in_ms": "2000",
      "hold_ms": "10000",
      "priority": "2",
      "scene_status": "READY"
    },
    {
      "id": 3,
      "name": "副歌推进",
      "fixture_states": "[{\"fixture_id\":1,\"intensity\":100,\"color\":\"#FF3355\"},{\"fixture_id\":3,\"intensity\":90,\"color\":\"#FF5533\"},{\"fixture_id\":5,\"intensity\":85,\"color\":\"#FFFFFF\"}]",
      "fade_in_ms": "1500",
      "hold_ms": "8500",
      "priority": "3",
      "scene_status": "READY"
    },
    {
      "id": 4,
      "name": "谢幕白光",
      "fixture_states": "[{\"fixture_id\":2,\"intensity\":100,\"color\":\"#FFFFFF\"},{\"fixture_id\":5,\"intensity\":100,\"color\":\"#FFFFFF\"},{\"fixture_id\":6,\"intensity\":90,\"color\":\"#FFFFFF\"}]",
      "fade_in_ms": "1000",
      "hold_ms": "7000",
      "priority": "4",
      "scene_status": "READY"
    },
    {
      "id": 5,
      "name": "旧版开场（已归档）",
      "fixture_states": "[{\"fixture_id\":1,\"intensity\":50,\"color\":\"#FFAA33\"}]",
      "fade_in_ms": "3000",
      "hold_ms": "3000",
      "priority": "9",
      "scene_status": "ARCHIVED"
    },
    {
      "id": 6,
      "name": "备用频闪",
      "fixture_states": "[{\"fixture_id\":6,\"intensity\":100,\"color\":\"#FFFFFF\"}]",
      "fade_in_ms": "0",
      "hold_ms": "2000",
      "priority": "8",
      "scene_status": "DISABLED"
    }
  ],
  "timelineTrack": [
    {
      "id": 1,
      "cue_scene_id": 1,
      "start_ms": "0",
      "duration_ms": "8000",
      "layer": "1",
      "locked": "false"
    },
    {
      "id": 2,
      "cue_scene_id": 2,
      "start_ms": "8000",
      "duration_ms": "12000",
      "layer": "1",
      "locked": "false"
    },
    {
      "id": 3,
      "cue_scene_id": 3,
      "start_ms": "20000",
      "duration_ms": "10000",
      "layer": "1",
      "locked": "false"
    },
    {
      "id": 4,
      "cue_scene_id": 4,
      "start_ms": "30000",
      "duration_ms": "8000",
      "layer": "1",
      "locked": "false"
    },
    {
      "id": 5,
      "cue_scene_id": 5,
      "start_ms": "38000",
      "duration_ms": "6000",
      "layer": "2",
      "locked": "true"
    }
  ],
  "showProject": [
    {
      "id": 1,
      "title": "《夏夜之声》巡演版",
      "venue_name": "主剧场",
      "fixture_ids": [1, 2, 3, 4, 5, 6],
      "track_ids": [1, 2, 3, 4, 5],
      "updated_at": "2026-09-26T20:00:00Z"
    }
  ]
} as const;
