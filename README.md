# 隧道股份 · 标书自动化解析 Demo

面向 **Agent 开发者大赛** 的前端演示应用：模拟标书（PDF/Word）上传、Milo 存储寻址与智能 Agent 解析全流程，并以可视化日志与结构化 JSON 展示结果。

> 文件上传已对接内网 API（`POST /api/files`），经本地 Node 代理转发；Agent 解析阶段仍为前端 Mock。

## 功能概览

| 阶段 | 状态值 | 说明 |
|------|--------|------|
| 空闲 | `idle` | 等待用户上传标书 |
| 上传中 | `uploading` | 模拟读取与传输文件 |
| 存储中 | `storing` | 模拟向 Minlo 申请存储地址 |
| 解析中 | `interacting` | 模拟 Agent 语义分析、合规审查、结构化 |
| 完成 | `success` | 展示结构化 JSON 与操作入口 |

界面特性：

- 深色科技风 UI（Tailwind CSS）
- 实时 Agent 日志流
- 解析进度条与粒子/轨道动画
- Minlo 存储路径展示
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

# 同时启动：本地代理(3001) + Vite 前端
pnpm dev:all

# 或分两个终端：
pnpm proxy   # 代理 -> http://192.168.3.153:3000
pnpm dev     # 前端，/api 经 Vite 转到本地代理

# 仅前端（需已单独运行 pnpm proxy）
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
├── server/proxy.mjs        # 本地 Node 代理（3001 -> 192.168.3.153:3000）
├── .env.development        # API 与代理端口配置
├── index.html              # HTML 入口
├── vite.config.ts          # Vite + React + Tailwind + /api 代理
├── tailwind.config.js      # 自定义动画（spin-slow / ping-slow / particle）
├── package.json
├── src/
│   ├── api/
│   │   ├── client.ts       # 通用 fetch 封装
│   │   └── files.ts        # POST /api/files 上传
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
        1. UPLOADING   POST /api/files（真实上传）
        2. STORING     使用接口返回 path/url
        3. INTERACTING runAgentSimulation（多步日志 + 进度）
        4. SUCCESS     展示 mockJson
```

## API 代理与上传调试

请求链路：

```
浏览器  →  Vite (5173) /api/*
       →  本地 proxy (3001) /api/*
       →  内网 API (192.168.3.153:3000) /api/*
```

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| `API_PROXY_TARGET` | `http://192.168.3.153:3000` | 代理目标 |
| `PROXY_PORT` | `3001` | 本地代理端口 |
| `VITE_API_BASE_URL` | `/api` | 前端请求前缀 |

健康检查：`curl http://localhost:3001/health`

**若上传返回 404**：常见原因是代理剥掉了 `/api` 前缀（已修复）。请确认：
1. 已运行 `pnpm proxy` 或 `pnpm dev:all`
2. 直连后端测试：`curl -X POST http://192.168.3.153:3000/api/files -F "file=@test.pdf"`
3. 代理日志应显示 `-> .../api/files`，而不是 `.../files`

上传调试：在页面选择文件，或调用 `uploadFile()`；若后端表单字段不是 `file`，修改 `src/api/files.ts` 中 `FILE_FIELD_NAME`。

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

- 业务流程为前端 Mock，无真实文件上传与 Minlo / Agent API
- `App.tsx` 部分 state 未标注 TypeScript 类型，`pnpm build` 可能因 `tsc` 报错；可单独用 `pnpm vite build` 验证前端打包
- `milo_path` 在 `runAgentSimulation` 闭包中可能读到空的 `miloUrl`（应用 `setMiloUrl` 后的最新值或传入参数修复）

## 许可证

私有演示项目，未指定开源许可证。
