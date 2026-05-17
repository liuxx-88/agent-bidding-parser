/**
 * 本地 API 代理服务
 * 将 /api/* 原样转发到内网后端（保留完整路径）
 *
 * 启动: pnpm proxy
 * 默认: http://localhost:3001 -> http://192.168.3.153:3000
 */
import express from 'express'
import cors from 'cors'
import { createProxyMiddleware } from 'http-proxy-middleware'

const PROXY_PORT = Number(process.env.PROXY_PORT) || 3001
const API_TARGET =
  process.env.API_PROXY_TARGET || 'http://192.168.3.153:3000'

const app = express()

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
)

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    proxyPort: PROXY_PORT,
    target: API_TARGET,
    note: 'POST /api/files 将转发为 {target}/api/files（保留 /api 前缀）',
  })
})

/**
 * 注意：不要用 app.use('/api', proxy)，Express 会剥掉挂载前缀，
 * 导致 /api/files 被转发成 {target}/files 从而 404。
 * 这里用 pathFilter 保留完整路径。
 */
app.use(
  createProxyMiddleware({
    target: API_TARGET,
    changeOrigin: true,
    pathFilter: (pathname) => pathname.startsWith('/api'),
    on: {
      proxyReq: (_proxyReq, req) => {
        const path = req.originalUrl ?? req.url
        console.log(`[proxy] ${req.method} ${path} -> ${API_TARGET}${path}`)
      },
      error: (err, req, res) => {
        console.error('[proxy] error:', err.message)
        if (res && typeof res.writeHead === 'function' && !res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json' })
          res.end(
            JSON.stringify({
              message: '代理转发失败，请确认后端服务可访问',
              target: API_TARGET,
              path: req?.originalUrl ?? req?.url,
              error: err.message,
            }),
          )
        }
      },
    },
  }),
)

app.use((req, res) => {
  res.status(404).json({
    message: '本地代理未匹配到路由',
    path: req.originalUrl,
    hint: 'API 请以 /api 开头，例如 POST /api/files',
  })
})

app.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`[proxy] listening on http://localhost:${PROXY_PORT}`)
  console.log(`[proxy] ${API_TARGET}/api/* （路径完整保留）`)
  console.log(`[proxy] upload: POST http://localhost:${PROXY_PORT}/api/files`)
})
