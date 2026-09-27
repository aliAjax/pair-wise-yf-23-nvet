# 舞台灯光编排模拟器

纯前端舞台灯光编排工具，支持灯具通道、场景 Cue、时间轴预览和演出方案导出，所有数据存在 IndexedDB。灯具布置页内置**应急换灯台**：演出中灯具故障时，为故障灯选择同类型、DMX 地址不冲突的替身，所有受影响的 Cue 整批改用替身且亮度与颜色保持不变；任一 Cue 已归档或替身未就位时整批不写入并点出第一处问题，通过后场景、时间轴与舞台预览即时同步，刷新页面换灯结果仍在。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20113>

页面路由（hash 路由，刷新不丢）：`#/fixtures` 灯具布置（应急换灯台）、`#/cues` 场景编辑、`#/timeline` 时间轴编排、`#/preview` 舞台预览。

## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`

## 应急换灯台使用说明

1. 在「灯具布置」页平面图或列表中点选故障灯。
2. 右侧面板列出同类型替身候选；未就位、DMX 冲突的候选会被禁用并标注原因。
3. 面板同步列出所有引用该灯的 Cue；点击「整批换灯」后按固定顺序校验：故障灯 → 替身 → 替身就位 → 类型一致 → DMX 冲突 → 逐 Cue（已归档 / 已引用替身），命中即整批不写入并只报第一处问题。
4. 全部通过后：受影响 Cue 的灯具引用换成替身（亮度、颜色原样保留），故障灯标记为 FAULT，演出方案灯具清单同步，并落一条换灯记录；场景、时间轴、舞台预览三页共享同一批 store，即时可见。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Tailwind 风格原生 CSS + Zustand + IndexedDB（localStorage 降级） |
| 后端 | - |
| 数据库 | 本地模拟数据（IndexedDB 持久化，首访播种自 `mocks/seedData.ts`） |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/
├── api/                  # 按模型分文件的 async API（读写均走持久化层）
├── stores/               # Zustand 独立 store（Fixture/CueScene/TimelineTrack/ShowProject/EmergencySwap）
├── types/                # 数据模型类型（含 FixtureState、EmergencySwapRecord、FixtureStatus）
├── constants/            # 枚举、日志模板、错误码、错误消息、状态文案
├── constructors/         # 默认对象/表单对象构造器 + fixture_states 解析序列化
├── services/             # 应急换灯校验与纯计算（validateSwap/applySwap/listSwapCandidates）
├── controllers/          # 应急换灯提交入口（校验 → 落库 → 同步 store → 日志）
├── components/common/    # FixtureIcon/CueCard/TimelineRuler/StageCanvas/ColorChannelSlider/DmxBadge/PropertyPanel/PlaybackControls 等
├── hooks/                # useIndexedDbStore（启动水合）/useDmxAddressCheck/useTimelinePlayback
├── pages/                # 灯具布置/场景编辑/时间轴编排/舞台预览
├── router/
├── utils/                # persistence（IndexedDB 封装）、dmx（通道区间）、logger、formatters
└── mocks/                # 种子数据（10 盏灯、6 个 Cue、5 条轨道、1 个方案）
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `stage-light`
- `FRONTEND_PORT`: 前端端口，默认 `20113`

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: stage-light`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-stage-light}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`（浏览器端 IndexedDB 需在开发者工具中清除站点数据后重新播种）。

## 枚举/常量出现位置清单

- FixtureType: constants/FixtureType、types/FixtureType、constructors/FixtureConstructor、logTemplates、errorMessages、FixturesPage 候选筛选、FixtureIcon 图元映射、STATUS_TEXT 展示。
- CueStatus: constants/CueStatus、types/CueStatus、constructors/CueSceneConstructor、logTemplates、errorMessages、services/emergencySwapService（ARCHIVED 拦截）、CuesPage 筛选器、CueCard/TimelinePage/PreviewPage 展示。
- ChannelMode: constants/ChannelMode、types/ChannelMode、constructors/FixtureConstructor、logTemplates、errorMessages、STATUS_TEXT 展示。
- FixtureStatus: constants/FixtureStatus、types/FixtureStatus、constructors/FixtureConstructor、logTemplates、errorMessages、services/emergencySwapService（NOT_READY 拦截）、utils/dmx（未就位不占通道）、FixturesPage 筛选与徽章、FixtureIcon/StageCanvas 配色。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。应急换灯一次提交即触达 controller → service → 4 个 store → 持久层 → 日志模板 → 4 个页面。

## License

MIT
