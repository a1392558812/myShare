# AGENTS.md

> 项目 AI 开发约束文件。优先级：用户提示词 > 本文件 > 工具默认 > 通用习惯。

## 适用范围
- 适用对象：AI 编码助手（Claude Code / Cursor / Codex / WorkBuddy 等）。
- 适用目录：本仓库全部代码。
- 游戏类 demo（async-demo 下各 demo）仅受标注「游戏 demo 适用」的条款约束；表单/布局/主题条款对其豁免。

## 工作流程
- [必须] 任务开始前生成 TODO 清单，逐个完成并即时更新状态。
- [必须] 一期（一个可独立验收的闭环）最多碰 2 层目录；超层必须留痕说明。

## 全局规则
- [禁止] CSS 媒体查询（用缩放档位替代响应式）。
- [优先] ES6 箭头函数。
- [禁止] 单字符/缩写变量名与 CSS 类名；命名需明确表意。
- [禁止] 单行函数；函数需有完整结构。
- [必须] 公共 API 有 JSDoc；复杂逻辑加简洁行内注释，避免过度注释。

## 运行与预览（关键）
> 本仓库由宿主 **vue3-sfc-loader 在线解析 SFC 语法**，无 dev server，亦无构建步骤。Vue 由宿主在运行时注入，不写入 package.json。AI 曾误装 vue/vite 等框架依赖以启动 dev server，此做法错误。
- [禁止] 运行「启动 / 构建服务器」命令（如 vite、npm run dev、启 http-server 等）。预览依赖已运行的静态服务，不存在需要 AI 启动的服务。
- [禁止] 安装 vue / vite / @vue/* 等框架依赖（npm install / pnpm add / yarn add）。装包会破坏 sfc-loader 加载链路且徒增体积。
- [必须] 预览地址：`http://127.0.0.1:5501/#/demo/` + 去除 `async-demo` 文件夹名后的路径。
- [必须] 预览打不开（如用户未起静态服务）时，主动询问用户，绝不自启服务器、不装包自救。

## 组件 / 布局 / 样式（游戏 demo 豁免）
- [必须] 表单与布局组件位于 `/async-demo/components/form-control/index.vue`，用法见 `/async-demo/components/README.md`。
- [必须] 布局风格示例见 `/async-demo/point-2-point/index.vue`。
- [必须] 颜色主题：`@use './async-demo/static/scss/theme.scss';`，不自算引用路径。
- [默认] 无法判断改动是否属于游戏 demo 时，询问用户抉择。

## 省 token 工作纪律（关键，全局适用）
> 单期 token 消耗过高的主因是反复运行全量巨型探针，以及大文件整读整写。以下纪律在压缩成本的同时不牺牲验证质量。
- [禁止] 迭代期跑全量巨型探针（如 painter 2 万断言、check 800+ 项）。改动只用 `node --check` 语法探针 + 小单元断言；全量回归只在**本期收尾**跑一次。
- [必须] 探针 stdout 只看汇总行（通过/失败数），不把完整输出贴回分析上下文。
- [限制] 单探针断言上限 300；超了按模块拆分文件，禁止多模块断言塞一个 `.mjs`。
- [必须] 大文件（>200 行）用 targeted Edit，禁止整文件重写；读取用 offset/limit 只读变更段，不整文件重读。
- [禁止] 同轮内重复读未改动的同一文件。
- [必须] 改动后只重跑受影响的那个探针，不重跑无关探针。

## 游戏 demo / vue3-sfc-loader 宿主约束（游戏 demo 适用）
> 防止「Node 探针全绿但宿主运行时 undefined」。
- [禁止] 间接导出 `export { X } from './y.js'` 或 `export * from`；需转引时在逻辑层显式 import 再 export。
- [必须] `config/*` 只放纯数据，不放逻辑、不做 re-export；视图层 `*.vue` 不直接 import `config/` 数据表，模板不写 `TABLE[key]`，统一由 `core/*-view.js` 加工成纯值。
- [禁止] 加载模块用 CJS / `require`、top-level await、动态 `import()`、构建期宏/replace（宿主无 Vite transform）。
- [必须] `<script setup>` 保持宿主可解析：避免实验性语法、需编译期处理的自定义指令/宏；单文件组件尽量自包含，便于探针抽 `<script setup>` 配 `vue-mock` 跑。
- [禁止] `core/` 层 import vue / stage / draw / DOM。
- [禁止] 表现层新增事件类型（既有 23 种事件不变，新行为走 TURN_END 等载荷）。
- [必须] 数值只信 README 第 12 章；平衡只改 `constants.js` / `config/*`，改完同步文档。

## 测试 / 探针产物归置（游戏 demo 适用）
> 所有临时 / 测试产物统一归置到 `.tmp` 目录，由 `.gitignore` 的 `.tmp` 模式（无斜杠前缀，匹配任意深度）统一忽略，避免散落仓库根。
- [必须] 游戏 demo 的探针 / 测试脚本：放进 `<demo 根目录>/.tmp/`（例如 `async-demo/turn-based-rematch/.tmp/`），按用途平铺拆文件，不套子目录。
- [必须] 工具 / 浏览器运行时缓存（如无头测试生成的 user-data profile，命名形如 `.tmp-edge-xxxx`）：归置到仓库根 `.tmp/`（例如 `F:/awen-project/blog/.tmp/`）。若需在记忆中回溯，记录其确切路径。
- [禁止] 在仓库根或其他无关目录散落 `.tmp-edge-xxxx`、`.tmp-*` 等临时文件。
- [默认] `.tmp/` 下不必再套子目录；既有 `.gitignore` 的 `.tmp` 规则已覆盖根级与各 demo 下的 `.tmp`，无需为子目录单独加规则。

## 完成前自查清单
- [ ] TODO 逐项完成并更新状态。
- [ ] 未用 CSS 媒体查询；预览地址符合规则；未自启服务器、未装框架包。
- [ ] 无单字符/缩写变量与类名；无单行函数；公共 API 含 JSDoc。
- [ ] 无间接导出；config 仅数据；core 不依赖 vue/DOM。
- [ ] 测试 / 探针产物归置正确：demo 探针在 `<demo>/.tmp/`、浏览器缓存在根 `.tmp/`、仓库根无散落临时文件。
- [ ] 本期未滥用全量探针；改动只重跑受影响探针。
