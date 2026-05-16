# 隧道股份 · 标书自动化解析 Demo

面向 **Agent 开发者大赛** 的前端演示应用：模拟标书（PDF/Word）上传、Milo 存储寻址与智能 Agent 解析全流程，并以可视化日志与结构化 JSON 展示结果。

> 当前为 **前端模拟实现**，未接入真实 Milo / Agent 后端；上传与解析进度由 `setTimeout` 与本地状态驱动。

## 功能概览

| 阶段 | 状态值 | 说明 |
|------|--------|------|
| 空闲 | `idle` | 等待用户上传标书 |
| 上传中 | `uploading` | 模拟读取与传输文件 |
| 存储中 | `storing` | 模拟向 Milo 申请存储地址 |
| 解析中 | `interacting` | 模拟 Agent 语义分析、合规审查、结构化 |
| 完成 | `success` | 展示结构化 JSON 与操作入口 |

界面特性：

- 深色科技风 UI（Tailwind CSS）
- 实时 Agent 日志流
- 解析进度条与粒子/轨道动画
- Milo 存储路径展示
- 结构化输出 JSON 预览

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript |
| 构建 | Vite 8 |
| 样式 | Tailwind CSS v4（`@tailwindcss/vite`） |
| 图标 | lucide-react |
| 工具类合并 | clsx、tailwind-merge（已安装，可按需封装 `cn()`） |

## 快速开始

### 环境要求

- Node.js 20+
- [pnpm](https://pnpm.io/)（推荐）或 npm

### 安装与运行

```bash
# 安装依赖
pnpm install

# 开发模式（支持 HMR 热更新）
pnpm dev

# 生产构建
pnpm build

# 预览生产构建（无热更新）
pnpm preview

# 代码检查
pnpm lint
```

开发服务器默认地址：`http://localhost:5173`

## 项目结构

```
my-app/
├── index.html              # HTML 入口
├── vite.config.ts          # Vite + React + Tailwind 插件
├── tailwind.config.js      # 自定义动画（spin-slow / ping-slow / particle）
├── package.json
├── src/
│   ├── main.tsx            # React 挂载与 HMR root 复用
│   ├── index.css           # Tailwind 入口 + 全局 CSS 变量
│   ├── App.tsx             # 主界面与业务流程
│   └── assets/             # 静态资源
└── .cursor/
    └── skills/
        └── tunnel-bid-agent-app/
            └── SKILL.md    # Cursor Agent 项目技能说明
```

## 核心流程（`App.tsx`）

```
用户选择文件
    → handleFileUpload
    → startWorkflow
        1. UPLOADING   模拟上传
        2. STORING     生成 milo:// 假地址
        3. INTERACTING runAgentSimulation（多步日志 + 进度）
        4. SUCCESS     展示 mockJson
```

对接真实后端时，建议在 `startWorkflow` / `runAgentSimulation` 中替换 `setTimeout`，改为调用 API，并用 WebSocket 或 SSE 推送日志与进度。

## 样式与 Tailwind

Tailwind v4 通过 Vite 插件集成，**不要**删除以下配置：

**`src/index.css` 顶部：**

```css
@import "tailwindcss";
@config "../tailwind.config.js";
```

**`vite.config.ts`：**

```ts
import tailwindcss from '@tailwindcss/vite'
// plugins: [react(), tailwindcss()]
```

自定义动画类（`animate-spin-slow` 等）定义在 `tailwind.config.js`；`App.tsx` 内另有内联 `<style>` 作为补充。

> `animate-in`、`fade-in` 等类来自 `tailwindcss-animate` 插件，当前未安装，可能无效果；需要时可执行 `pnpm add -D tailwindcss-animate` 并按 v4 文档接入。

## 热更新（HMR）

- 使用 `pnpm dev` 启动开发服务器
- React Fast Refresh 由 `@vitejs/plugin-react` 提供
- `main.tsx` 通过 `import.meta.hot.data` 复用 `createRoot`，避免热更新重复挂载报错
- 修改 CSS / 组件后应即时生效；`pnpm preview` 不支持 HMR

若在 Docker / 网络盘环境热更新失效，可在 `vite.config.ts` 中将 `server.watch.usePolling` 设为 `true`。

## 配置说明

| 文件 | 作用 |
|------|------|
| `vite.config.ts` | 插件、HMR、开发服务器 |
| `tailwind.config.js` | 扩展 keyframes / animation |
| `tsconfig.app.json` | 应用 TS 配置（含 `vite/client` 类型） |
| `eslint.config.js` | ESLint 规则 |

## 已知限制

- 业务流程为前端 Mock，无真实文件上传与 Milo / Agent API
- `App.tsx` 部分 state 未标注 TypeScript 类型，`pnpm build` 可能因 `tsc` 报错；可单独用 `pnpm vite build` 验证前端打包
- `milo_path` 在 `runAgentSimulation` 闭包中可能读到空的 `miloUrl`（应用 `setMiloUrl` 后的最新值或传入参数修复）

## 许可证

私有演示项目，未指定开源许可证。
