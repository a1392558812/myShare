# AGENTS.md
 
> 项目 AI 开发约束文件。优先级：用户提示词 > 本文件 > 工具默认 > 通用习惯。
> 标签说明：[必须] 强制遵循；[禁止] 红线不可触碰；[优先] 默认首选方案；[默认] 兜底约定；[限制] 量化阈值。
 
## 适用范围
- 适用对象：AI 编码助手（Claude Code / Cursor / Codex / WorkBuddy 等）。
- 适用目录：本仓库全部代码。
- 游戏 demo（async-demo 下各 demo）只受标注「游戏 demo 适用」的条款约束；组件 / 布局 / 样式条款对其豁免。
 
## 工作流程
- [必须] 任务开始前生成 TODO 清单，逐个完成并即时更新状态。
 
## 全局规则
- [禁止] 使用 CSS 媒体查询与移动端适配：本项目仅面向 PC，无移动端场景。
- [优先] 使用 ES6 箭头函数。
- [优先] 异步流程使用 `Promise.then` / `.catch` 链式处理。
- [禁止] 使用 `async` / `await` 配合 `try...catch` 包裹异步逻辑：异常易被吞掉并丢失调用栈，排查困难；确需捕获时，须记录并重新抛出。
- [禁止] 声明仅使用一次的中间变量或原样转存的别名；仅在需要复用、赋予业务语义或拆分复杂表达式时才声明局部变量。
- [禁止] 单字符或缩写变量名、CSS 类名（`id`、`url`、`ref` 等公认缩写除外）；命名须明确表意。
- [禁止] 将函数体压缩为单行；函数须保留完整结构（换行与花括号）。
- [必须] 公共 API 必须有 JSDoc 注释；复杂逻辑加简洁行内注释，避免过度注释。
 
## 运行与预览（关键）
> 本仓库由宿主 **vue3-sfc-loader 在线解析 SFC 语法**，无 dev server，无构建步骤。Vue 由宿主在运行时注入，不写入 package.json。禁止通过安装框架依赖来启动 dev server。
- [禁止] 安装 vue / vite / @vue/* 等框架依赖（`npm install` / `pnpm add` / `yarn add`）；装包会破坏 sfc-loader 加载链路，且徒增体积。
- [必须] 预览地址为 `http://127.0.0.1:5501/#/demo/` 加文件相对仓库路径去掉 `async-demo/` 前缀后的部分（例：`async-demo/bro-melee/index.vue` → `http://127.0.0.1:5501/#/demo/bro-melee`）。
- [必须] 预览无法打开时，可在仓库根目录尝试运行 `node ./run-server`（这是启动服务的唯一例外）；若仍未启动成功，停止当前任务并告知用户，不得改为安装依赖或使用 vite 自救。
 
## 组件 / 布局 / 样式（游戏 demo 豁免）
- [必须] 表单与布局组件位于 `/async-demo/components/form-control/index.vue`，用法见 `/async-demo/components/README.md`。
- [必须] 布局风格示例见 `/async-demo/point-2-point/index.vue`。
- [必须] 颜色主题统一引用 `@use './async-demo/static/scss/theme.scss';`，引用路径以本行为准，不得自行推算或拼接。
- [默认] 无法判断改动是否属于游戏 demo 时，询问用户确认。
 
## 省 token 工作纪律（关键，全局适用）
> 单期 token 消耗过高的主因是反复运行全量回归，以及大文件整读整写。以下纪律用于压缩成本，同时不降低验证质量。
- [禁止] 迭代期运行全量回归（超大断言集、800+ 项检查等）。改动只做语法检查（`node --check`）与小规模单元断言；全量回归仅在本期收尾时运行一次。
- [必须] 探针只输出汇总行（通过数 / 失败数），不将完整输出贴回分析上下文。
- [限制] 单个探针的断言不超过 300 条；超出时按模块拆分文件，禁止将多模块断言塞进同一个 `.mjs`。
- [必须] 超过 200 行的文件使用定向 Edit 修改，禁止整文件重写；读取时用 offset/limit 只读变更段，不整文件重读。
- [禁止] 同一轮内重复读取未改动的同一文件。
- [必须] 改动后只重跑受影响的探针，不重跑无关探针。
 
## 游戏 demo / vue3-sfc-loader 宿主约束
> 用于防止「Node 探针全部通过、宿主运行时却 undefined」的问题。本章分两级：宿主兼容铁律对所有经 sfc-loader 加载的 demo 生效；范本约定仅对主动采用对应分层架构的 demo 生效。
 
### 宿主兼容铁律（所有游戏 demo 适用）
> 无论 demo 是否分层、是否写文档，只要经 vue3-sfc-loader 加载就必须遵守。
- [禁止] 间接导出（`export { X } from './y.js'`）与 `export * from`；需要转发导出时，在逻辑层先 import 再 export。
- [禁止] 使用 CJS `require`、顶层 await、动态 `import()`、编译期宏或编译期替换（宿主无 Vite transform）。
- [必须] `<script setup>` 保持宿主可解析：避免实验性语法，以及依赖编译期处理的重导出或宏；单文件组件尽量自包含，便于探针抽取 `<script setup>` 配合 `vue-mock` 运行。
 
### 范本 demo 约定（优先以 bro-melee / turn-based-rematch 等为范本，采用 `core/`、`draw/`、`config/` 分层）
> 仅当 demo 主动采用上述分层架构时生效；未分层、不写文档的简单 demo（如仅含单个 SFC 的 demo）不受以下条款约束。
- [必须] `config/*` 只放纯数据，不放逻辑、不做 re-export；视图层 `*.vue` 不直接 import `config/` 数据表，也不在模板中索引数据表（如 `SKILL_TABLE[key]`），统一由 `core/*-view.js` 转换为原始值或只读快照。
- [禁止] `core/` 层 import Vue、舞台层（stage）、`draw/` 或浏览器 DOM API。
- [必须] 平衡数值集中放在 `constants.js` / `config/*`；禁止在 `core/`、`draw/`、舞台层散落魔法数字。
 
## 测试 / 探针产物归置
> 所有临时 / 测试产物统一归置到 `.tmp` 目录，由 `.gitignore` 中不带斜杠的 `.tmp` 模式（匹配任意深度）统一忽略，避免散落到仓库其他位置。
- [必须] demo 的探针 / 测试脚本放入 `<demo 根目录>/.tmp/`（例如 `async-demo/turn-based-rematch/.tmp/`），按用途平铺拆文件，不套子目录。
- [必须] 工具 / 浏览器运行时缓存（如无头测试生成的 user-data profile，命名形如 `.tmp-edge-xxxx`）放入仓库根 `.tmp/`，即各机器本地仓库根下的 `.tmp/` 目录。该目录已 gitignore、各机器本地生成；路径保持相对仓库根、跨机器一致，勿写死绝对路径。
- [必须] 需要在记忆中回溯时，只记录相对仓库根的路径（如 `.tmp/.tmp-edge-profile*`），勿写死某台机器的绝对路径。
- [禁止] 在仓库根 `.tmp/` 之外的位置散落 `.tmp-edge-xxxx`、`.tmp-*` 等临时文件。
- [默认] `.tmp/` 下不再嵌套子目录；`.gitignore` 的 `.tmp` 规则已覆盖仓库根与各 demo 下的 `.tmp`，无需额外添加规则。
 
## 完成前自查清单
- [ ] TODO 逐项完成并更新状态。
- [ ] 未用 CSS 媒体查询与移动端适配；预览地址符合规则；除 `node ./run-server` 外未自启服务器、未安装框架包。
- [ ] 无单字符或缩写变量与类名；无单行函数；无多余中间变量；异步使用 `then` 链而非 `async` + `try...catch`；公共 API 含 JSDoc。
- [ ] 宿主兼容铁律达标：无间接导出、无 CJS / 动态 `import()` / 编译期宏、`<script setup>` 宿主可解析；范本 demo 另查：config 仅数据、core 不依赖 Vue/舞台层/DOM、数值集中 `constants.js`/`config/*` 无散落魔法数字。
- [ ] 测试 / 探针产物归置正确：demo 探针在 `<demo>/.tmp/`、浏览器缓存在根 `.tmp/`、仓库根 `.tmp/` 之外无散落临时文件。
- [ ] 本期未滥用全量回归；改动只重跑受影响的探针。