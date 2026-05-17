# 智能标书 Agent · 技术白皮书

> 面向 **Agent 开发者大赛** 的标书自动化解析前端 Demo。演示「标书上传 → MinIO 存储 → Agent 解析生成」全链路 UX。

---

## 1. 项目定位

| 维度 | 说明 |
|------|------|
| 目标场景 | Agent 开发者大赛 Proof-of-Concept 演示 |
| 用户角色 | 大赛评委 / 内部技术评审 |
| 当前阶段 | **Demo** — 前端完整 UI，后端 API 已对接，但 Agent 解析结果仍为 Mock |
| 架构模式 | SPA（Single Page Application），轻量 proxy 代理层 |

---

## 2. 技术选型

### 2.1 选型矩阵

| 类别 | 选型 | 版本 | 选型理由 |
|------|------|------|----------|
| 语言 | TypeScript | 6.0 | 大赛要求类型安全，便于评审阅读 |
| UI 框架 | React | 19.2 | 最新稳定版，并发特性基础 |
| 构建工具 | Vite | 8.0 | 极速 HMR，原生 ESM，对 TypeScript/JSX 零配置 |
| 样式方案 | Tailwind CSS | 4.3 | v4 版 Vite 原生插件集成，无 PostCSS 配置文件 |
| 图标库 | lucide-react | 1.16 | Tree-shakable SVG 图标，体积小 |
| 工具类 | clsx + tailwind-merge | 2.1 / 3.6 | 条件类名合并（已安装，按需封装 `cn()`） |
| 代理层 | Express + http-proxy-middleware | 5.1 / 3.0 | Node 端轻量转发，保证 `/api` 前缀不被剥离 |
| 并行启动 | concurrently | 9.2 | 一键同时启动 frontend + proxy |
| Lint | ESLint | 10.4 | TypeScript + React Hooks + Refresh 规则 |

### 2.2 未引入的依赖

| 方案 | 原因 |
|------|------|
| 状态管理库 (Redux/Zustand) | Demo 规模小，React `useState` 足够 |
| React Router | 单页向导，`wizardStep` state 驱动视图切换 |
| tailwindcss-animate | 动画效果通过自定义 `@keyframes` 实现 |
| Axios | `fetch` 封装 + `XMLHttpRequest`（上传进度需求）已满足 |

---

## 3. 硬件与运行环境

### 3.1 开发环境

| 项目 | 最低要求 | 推荐 |
|------|----------|------|
| Node.js | 20.0+ | 22 LTS |
| 包管理器 | pnpm 9+ | pnpm 10 |
| 内存 | 4 GB | 8 GB |
| 磁盘 | 500 MB（含 node_modules） | 1 GB |
| 网络 | 可访问 `192.168.3.153:3000`（内网 API） | 低延迟内网 |

### 3.2 生产部署（预估）

| 项目 | 静态部署 | 含代理层 |
|------|----------|----------|
| 服务器 | Nginx / Caddy | Node.js 运行时 |
| 内存 | — | 256 MB |
| 构建产物大小 | ~200 KB (gzip) | + Express 依赖 ~5 MB |
| 带宽 | 最小 1 Mbps | — |

> 建议：生产环境将 Vite 构建产物（`dist/`）部署至 CDN 或 Nginx，API 代理由网关统一处理，无需内置 `server/proxy.mjs`。

---

## 4. 项目结构

```
project-root/
├── docs/
│   └── README_TECH.md          # ← 本文档
├── server/
│   └── proxy.mjs               # Node 代理：3001 → 192.168.3.153:3000
├── src/
│   ├── main.tsx                # React 挂载入口 + HMR root 复用
│   ├── App.tsx                 # 主界面、状态机、业务编排
│   ├── index.css               # Tailwind 入口 + CSS 自定义属性
│   ├── api/
│   │   ├── client.ts           # fetch 封装 + ApiError 类
│   │   ├── files.ts            # 文件上传/下载 API
│   │   └── agent.ts            # Agent 生成/轮询/下载 API
│   ├── types/
│   │   └── workflow.ts         # 全局类型定义
│   ├── constants/
│   │   └── knowledgeBase.ts    # RAG 知识库 Mock 数据
│   └── components/
│       ├── layout/             # AppHeader, StepIndicator, WizardActions
│       ├── modules/            # UploadParseModule, RagModule
│       └── ui/                 # SectionTitle
├── public/                     # favicon, SVG 图标
├── .env.development            # 开发环境变量
├── vite.config.ts              # Vite 配置（插件 + proxy）
├── tailwind.config.js          # 自定义动画 keyframes
├── tsconfig.json               # TS 项目引用根配置
├── tsconfig.app.json           # 应用 TS 编译选项
├── tsconfig.node.json          # Vite/Node 端 TS 编译选项
└── eslint.config.js            # ESLint flat config
```

---

## 5. 数据流向

### 5.1 整体链路

```
┌─────────┐    /api/*    ┌────────────┐    /api/*    ┌──────────────────────┐
│ Browser │ ────────────→│ Vite(:5173) │───────────→│ Proxy(:3001)         │
│ (React) │              │ proxy       │            │ server/proxy.mjs     │
└─────────┘              └────────────┘            └──────────┬───────────┘
                                                               │ /api/*
                                                               ▼
                                                    ┌──────────────────────┐
                                                    │ 内网 API             │
                                                    │ 192.168.3.153:3000   │
                                                    └──────────────────────┘
```

### 5.2 标书上传流程

```
用户选择文件 (PDF/Word/Markdown)
   │
   ▼
handleFileUpload (App.tsx)
   │
   ├─ setParseStep('uploading')
   │
   ├─ uploadFile()                         POST /api/files
   │   ├─ FormData: { file, ...extraFields }   Multipart
   │   └─ XMLHttpRequest (支持 onprogress)     → 实时进度百分比
   │
   ├─ setParseStep('storing')
   │
   ├─ pickFilePathFromResponse(res)
   │   └─ 优先级: milo_path > path > url > "file://{id}"
   │
   ├─ setMiloUrl(resolvedUrl)              存储地址写入 state
   │
   └─ setParseStep('success')              上传阶段完成
```

### 5.3 Agent 生成流程

```
用户点击「开始生成文件」(RagModule)
   │
   ├─ generateFromFiles({ templatePath: miloUrl })
   │   └─ POST /api/agent/bidding/generate-from-files
   │       └─ 返回 { taskId }
   │
   ├─ 轮询循环 (每 2s, 最多 300 次)
   │   ├─ getTaskStatus(taskId)
   │   │   └─ GET /api/agent/bidding/status/{taskId}
   │   │       └─ 返回 { status, progress, stepLogs, result }
   │   ├─ 追加 stepLogs → 实时日志流展示
   │   ├─ status === 'FAILED'    → 终止，显示错误
   │   ├─ progress ≥ 100 且有 minioPath → 终止，显示下载入口
   │   └─ 超时 (300 次)           → 终止，提示重试
   │
   └─ downloadTaskResult(taskId)              结果下载
       └─ GET /api/agent/bidding/result/{taskId}
           └─ 返回 Blob 文件流 → 触发浏览器下载
```

### 5.4 代理关键细节

```js
// server/proxy.mjs — 正确做法：pathFilter 保留完整路径
createProxyMiddleware({
  target: API_TARGET,
  pathFilter: (pathname) => pathname.startsWith('/api'),
  // ❌ 不用 app.use('/api', proxy) — Express 会剥 /api 前缀
})
```

健康检查：`GET http://localhost:3001/health`

---

## 6. 状态管理

### 6.1 向导步骤机

```
upload ──────→ rag
  │              │
  └── 标书上传   └── Agent 生成处理
      解析展示        下载结果
```

对应 `WizardStep` 类型：`'upload' | 'rag'`，由 `wizardStep` state 驱动 `App.tsx` 的条件渲染。

### 6.2 上传解析子状态机

```
idle  →  uploading  →  storing  →  interacting  →  success
 ↑                                                      │
 └──────────── 上传失败 ←────────────────────────────────┘
```

对应 `ParseStep` 类型，驱动 `UploadParseModule` 中的 UI 变化与日志流。

### 6.3 核心 State 清单

| State | 类型 | 用途 |
|-------|------|------|
| `wizardStep` | `WizardStep` | 当前向导步骤 |
| `completedSteps` | `Set<WizardStep>` | 已完成步骤（高亮对勾） |
| `parseStep` | `ParseStep` | 上传子状态 |
| `file` | `File \| null` | 已选文件对象 |
| `miloUrl` | `string` | MinIO/Milo 存储路径 |
| `agentLogs` | `AgentLog[]` | 上传阶段日志 |
| `analysisProgress` | `number` | 解析进度 0-100 |
| `finalJson` | `ParseResult \| null` | 解析结果 |
| `uploadError` | `string \| null` | 上传错误信息 |

RagModule 内部管理独立的 `stepLogs`、`isGenerating`、`generateError`、`generatedMinioUrl`。

---

## 7. API 契约

### 7.1 文件上传

```
POST /api/files
Content-Type: multipart/form-data

Body:
  file: <binary>          # 表单字段名可配置 (FILE_FIELD_NAME)
  [extraFields...]        # 额外字段，如 bucket、type

Response 200:
{
  id?: string,
  milo_path?: string,     # 优先取此字段
  path?: string,
  url?: string,
  filename?: string,
  originalName?: string,
  size?: number
}
```

### 7.2 Agent 生成

```
POST /api/agent/bidding/generate-from-files
Content-Type: application/json

Body:
{
  templatePath: string    # 上传接口返回的 milo_path
}

Response 200:
{
  taskId: string
}
```

### 7.3 任务状态轮询

```
GET /api/agent/bidding/status/{taskId}

Response 200:
{
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED",
  progress?: number,       # 0-100
  message?: string,
  stepLogs?: { message: string }[],
  result?: {
    minioUrl?: string,
    minioPath?: string
  }
}
```

### 7.4 结果下载

```
GET /api/agent/bidding/result/{taskId}

Response 200: <binary file stream>
Content-Disposition: attachment; filename="..."
```

---

## 8. 环境变量

| 变量 | 默认值 | 消费方 | 说明 |
|------|--------|--------|------|
| `VITE_API_BASE_URL` | `/api` | 前端 `client.ts` | 浏览器端 API 请求前缀 |
| `PROXY_PORT` | `3001` | `server/proxy.mjs` + `vite.config.ts` | 代理监听端口 |
| `API_PROXY_TARGET` | `http://192.168.3.153:3000` | `server/proxy.mjs` | 后端真实地址 |

配置文件：`.env.development`

---

## 9. 技术约束与反模式

### 9.1 Tailwind v4 红线

- **必须**在 `vite.config.ts` 保留 `@tailwindcss/vite` 插件
- **必须**在 `src/index.css` 顶部保留 `@import "tailwindcss"` + `@config`
- **禁止**回退到 v3 语法（`@tailwind base/components/utilities` + PostCSS）
- `tailwindcss-animate` 插件未安装，`animate-in` / `fade-in` / `slide-in-from-*` 不生效

### 9.2 HMR

- 开发必须用 `pnpm dev`（`pnpm preview` 无热更新）
- `src/main.tsx` 通过 `import.meta.hot.data.root` 复用 root 实例，**禁止**每次 HMR 创建新 root

### 9.3 TypeScript

- `tsc -b` 可能因类型告警失败（`useState` 未显式标注类型等），用 `pnpm vite build` 验证前端打包
- 新增 state 时使用显式泛型：`useState<ParseStep>('idle')`

---

## 10. 已知局限

| 局限 | 影响 | 缓解方案 |
|------|------|----------|
| Agent 解析为 Mock | 评审只能看到固定 JSON 结果 | 对接真实 Agent API 后可移除 |
| `miloUrl` 闭包过期 | 异步回调中可能读到空值 | 使用 `setMiloUrl` 回调形式或 ref |
| `tsc -b` 构建不通 | 无法用 `pnpm build` 完整检查 | 使用 `pnpm vite build` 验证打包 |
| 无单元测试 | 回归依赖手工验证 | Demo 阶段可接受 |
| 仅内网可访问后端 | 外部演示需 VPN | 公网演示时替换 `API_PROXY_TARGET` |
| 无身份认证 | 接口无鉴权 | Demo 阶段可接受 |

---

## 11. 快速启动

```bash
# 1. 环境准备
node -v                   # ≥ 20
pnpm -v                   # 确保已安装

# 2. 安装依赖
pnpm install

# 3. 启动开发（推荐一键启动）
pnpm dev:all              # 同时启动 proxy(:3001) + Vite(:5173)

# 4. 访问
open http://localhost:5173

# 5. 健康检查
curl http://localhost:3001/health
```
