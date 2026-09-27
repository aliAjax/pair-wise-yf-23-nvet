# 舞台灯光编排模拟器

纯前端舞台灯光编排工具，支持灯具通道、场景 Cue、时间轴预览和演出方案导出，所有数据存在 IndexedDB。灯具布置页内置**应急换灯台**：演出中灯具故障时，可一键把全部受影响 Cue 批量改挂到同类型替身灯上。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20113>

- `/fixtures` 灯具布置（应急换灯台）
- `/cues` 场景编辑
- `/timeline` 时间轴编排
- `/preview` 舞台预览

## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`

## 应急换灯台使用说明

1. 打开「灯具布置」，在灯位图上点击灯点，或在灯具清单中把故障灯的就位状态改为「故障」，故障灯即被选中。
2. 右侧面板自动列出**同类型**替身候选，并标注每台候选的 DMX 地址段、就位状态与地址冲突（故障灯占用的地址段视为已释放）。
3. 选定替身后，面板实时列出所有引用故障灯的 Cue，并预先给出校验结果。
4. 点击「执行应急换灯」：所有受影响 Cue 的 `fixture_states` 只替换灯具引用，**亮度与颜色原样保留**，随后写入 IndexedDB 并追加一条换灯记录。
5. 校验规则按以下顺序执行，任一不满足则**整批不写入**，并在页面上点出第一处问题（问题灯具/问题 Cue 会红色高亮）：
   1. 故障灯与替身在册；
   2. 替身与故障灯类型一致（`REPLACEMENT_TYPE_MISMATCH`）；
   3. 替身已就位（`REPLACEMENT_NOT_RIGGED`，STANDBY/FAULTY 均被拦下）；
   4. 替身 DMX 地址段与灯位图无冲突（`REPLACEMENT_DMX_CONFLICT`）；
   5. 受影响 Cue 中没有已归档场次（`CUE_ARCHIVED_LOCKED`，按 Cue id 升序取第一个）。
6. 换灯成功后，场景编辑、时间轴编排、舞台预览三个页面读取同一批 store/IndexedDB 数据，自动同步；刷新或重新打开页面，换灯结果与换灯记录仍在。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Tailwind 风格原生 CSS + Zustand + IndexedDB |
| 后端 | - |
| 数据库 | 浏览器 IndexedDB（`stage-light` 库，首次打开自动从 `mocks/seedData.ts` 播种） |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/
├── api/                  # 按模型分文件的 async API（IndexedDB 读写 + mock 兜底）
├── stores/               # Zustand 独立 store（含 FixtureReplacementStore 换灯编排）
├── types/                # 数据模型与枚举类型定义
├── constants/            # 枚举、日志模板、错误码、错误消息、状态文案
├── constructors/         # 默认对象/表单对象/响应对象/换灯记录构造器
├── components/common/    # FixtureIcon、CueCard、TimelineRuler、StageCanvas、
│                         # ColorChannelSlider、DmxBadge、PropertyPanel、PlaybackControls 等
├── hooks/                # useIndexedDbStore、useDmxAddressCheck、useTimelinePlayback
├── pages/                # fixtures / cues / timeline / preview 四个路由页面
├── router/
├── utils/                # indexedDb、dmx、fixtureStates、replacement、formatters
└── mocks/                # 本地种子数据，禁止第三方 API
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `stage-light`
- `FRONTEND_PORT`: 前端端口，默认 `20113`

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: stage-light`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-stage-light}` 前缀。
- 数据库使用浏览器 IndexedDB，无需命名卷；如需重置数据，清除站点数据即可。
- 常见问题：端口占用时修改 `.env` 中端口后重启；`docker compose down -v` 可清理编排资源。

## 枚举/常量出现位置清单

- **FixtureType**（PAR/SPOT/WASH/BEAM/STROBE）：`constants/FixtureType.ts`、`types/FixtureType.ts`（重复定义）、`constructors/FixtureConstructor.ts`（默认值）、`utils/replacement.ts`（类型一致性校验与错误消息）、`components/common/FixtureIcon.tsx`（展示）、`pages/FixturesPage.tsx`（候选筛选与故障灯属性）、`mocks/seedData.ts`（种子）。
- **CueStatus**（DRAFT/READY/DISABLED/ARCHIVED）：`constants/CueStatus.ts`、`types/CueStatus.ts`、`constructors/CueSceneConstructor.ts`、`utils/replacement.ts`（ARCHIVED 拦截）、`components/common/CueCard.tsx`（展示）、`pages/CuesPage.tsx`（筛选器与状态编辑）、`pages/PreviewPage.tsx`（DISABLED/ARCHIVED 不参与播放）、`mocks/seedData.ts`。
- **ChannelMode**（RGB/RGBW/DIMMER_ONLY/MOVING_HEAD）：`constants/ChannelMode.ts`、`types/ChannelMode.ts`、`constructors/FixtureConstructor.ts`、`pages/FixturesPage.tsx`（清单展示）、`mocks/seedData.ts`。
- **RigStatus**（RIGGED/STANDBY/FAULTY）：`constants/RigStatus.ts`、`types/RigStatus.ts`、`constants/statusText.ts`、`constructors/FixtureConstructor.ts`、`utils/replacement.ts`（就位校验）、`components/common/FixtureIcon.tsx` 与 `StageCanvas.tsx`（展示）、`pages/FixturesPage.tsx`（状态编辑与候选排序）、`mocks/seedData.ts`。
- 日志模板集中在 `constants/logTemplates.ts`（Fixture/CueScene/TimelineTrack/ShowProject/FixtureReplacement 各 4 条），写操作在 `api/*` 与 `stores/FixtureReplacementStore.ts` 中记录。
- 错误码集中在 `constants/errorCodes.ts`，错误消息模板集中在 `constants/errorMessages.ts`；`utils/replacement.ts` 产出第一处问题，`stores/FixtureReplacementStore.ts` 单独包装持久化异常（`REPLACEMENT_PERSIST_FAILED`），api 层各自兜底，不在全局统一吞异常。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录。例如给灯具增加 `rig_status` 一个字段，就同步改动了：类型定义、两处枚举文件、构造器、种子数据、状态文案聚合、换灯校验、FixtureIcon/StageCanvas 展示、灯具页表格与候选排序、README 清单——任何一处漏改都会在编译期或运行期暴露。

## License

MIT
