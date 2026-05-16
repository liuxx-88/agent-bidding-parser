---
name: tunnel-bid-agent-app
description: >-
  Guides development of the Tunnel Co. bid-document Agent demo (React 19, Vite 8,
  Tailwind v4). Use when editing my-app, App.tsx workflow, Milo mock integration,
  Tailwind/HMR setup, or Agent competition UI for 隧道股份标书解析.
---

# 隧道股份标书解析 Demo · 项目技能

## 项目定位

单页 React 应用，演示 **标书上传 → Milo 存储 → Agent 解析 → JSON 输出** 的完整 UX。业务逻辑在 `src/App.tsx`，当前为 **Mock**，无真实后端。

## 技术约束（修改前必读）

### Tailwind CSS v4

- 样式入口：`src/index.css` 必须以 `@import "tailwindcss"` 和 `@config "../tailwind.config.js"` 开头
- Vite 必须保留 `@tailwindcss/vite` 插件，与 `@vitejs/plugin-react` 并列
- **禁止**改回 v3 写法（`@tailwind base/components/utilities` + 单独 `postcss.config` 且无 Vite 插件）
- 自定义动画：`tailwind.config.js` 的 `theme.extend.animation` / `keyframes`；`App.tsx` 底部有内联 `@keyframes` 兜底

### 热更新（HMR）

- 开发命令：`pnpm dev`（不是 `preview`）
- `src/main.tsx` 使用 `import.meta.hot.data.root` 复用 `createRoot`，**不要**在每次 HMR 时新建 root
- 勿在 `main.tsx` 从 `App.tsx` 再 export 造成循环依赖

### 依赖与命令

```bash
pnpm dev      # 开发 + HMR
pnpm build    # tsc -b && vite build（TS 严格时可能失败）
pnpm vite build  # 仅前端打包验证
pnpm lint
```

包管理优先 **pnpm**；`node_modules` 若出现 store 路径错误，在项目根执行 `pnpm install`。

## 代码地图

| 路径 | 职责 |
|------|------|
| `src/App.tsx` | 全流程 UI、状态机、Mock 工作流 |
| `src/main.tsx` | `createRoot`、全局样式 import |
| `src/index.css` | Tailwind + `:root` 设计变量（与 App 深色 UI 部分独立） |
| `tailwind.config.js` | `spin-slow`、`ping-slow`、`particle` 动画 |
| `vite.config.ts` | `react()` + `tailwindcss()` + `server.hmr` |

## 状态机

`step` / `STAGES` 取值：

- `idle` → `uploading` → `storing` → `interacting` → `success`

相关 state：

- `file`：已选文件
- `miloUrl`：Mock 地址 `milo://bucket-tunnel-co/bids/...`
- `agentLogs`：`{ id, text }[]`
- `analysisProgress`：0–100
- `finalJson`：解析结果对象

扩展真实 API 时：

1. 在 `handleFileUpload` / `startWorkflow` 发起上传，拿到 `miloUrl` 后再 `setMiloUrl`
2. 用 `runAgentSimulation` 替换为流式日志（SSE/WebSocket）更新 `agentLogs` 与 `analysisProgress`
3. `mockJson` 改为接口响应；`milo_path` 使用设置后的 URL，勿依赖可能过期的闭包 `miloUrl`

## UI 与样式约定

- 主视觉：深色 `slate-950` / `cyan` 强调色，见 `App.tsx` 根节点 class
- 图标：`lucide-react`，保持 import 精简，删除未使用图标
- `animate-in`、`fade-in`、`slide-in-from-*` 需 `tailwindcss-animate` 插件才生效；未安装前勿依赖其行为
- 大改布局时同步检查 `index.css` 中 `#root`（已设为 `width: 100%`，勿恢复固定 1126px 居中模板）

## TypeScript 改进方向

编辑 `App.tsx` 时优先补齐类型，便于 `pnpm build`：

```ts
type Step = 'idle' | 'uploading' | 'storing' | 'interacting' | 'success'
type AgentLog = { id: number; text: string }
// useState<Step>('idle'), useState<AgentLog[]>([]), ChangeEvent<HTMLInputElement> 等
```

粒子动画的 `style` 使用 CSS 变量 `--tx` / `--ty` 时，可用 `React.CSSProperties & { '--tx'?: string; '--ty'?: string }` 或 `as React.CSSProperties`。

## 常见任务清单

**新增解析步骤日志**  
在 `runAgentSimulation` 的 `tasks` 数组追加 `{ msg, progress }`。

**接 Milo 上传 API**  
替换 `startWorkflow` 中 `setTimeout`；`setMiloUrl` 使用接口返回值。

**调整主题色**  
优先改 `App.tsx` Tailwind 类；全局 token 改 `index.css` `:root`。

**拆分组件**  
从 `App.tsx` 抽出 `UploadPanel`、`AgentConsole`、`JsonResult` 等，保持 state 在父组件或引入轻量 context；拆后确认 Tailwind 仍能扫描到新文件路径（v4 + Vite 插件通常自动扫描）。

## 反模式

- 移除 `@tailwindcss/vite` 仅保留 `tailwind.config.js`
- 在 `main.tsx` 每次 HMR 无条件 `createRoot(container)` 不存 `hot.data`
- 用 `pnpm preview` 调试热更新
- 在未安装插件情况下大量新增 `animate-in` 类并假设有动画

## 参考

- [Tailwind + Vite 安装](https://tailwindcss.com/docs/installation/using-vite)
- 项目根目录 `README.md` 面向人类的完整说明
