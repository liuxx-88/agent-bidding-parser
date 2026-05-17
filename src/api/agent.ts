import { getApiBaseUrl, request } from './client'

export type GenerateFromFilesRequest = {
  templatePath: string
}

export type GenerateFromFilesResponse = {
  taskId: string
  [key: string]: unknown
}

export type TaskStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export type TaskStatusResponse = {
  status: TaskStatus
  progress?: number
  message?: string
  stepLogs?: { message: string; [key: string]: unknown }[]
  result?: {
    minioUrl?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

/**
 * 根据上传文件路径触发 Agent 生成
 * POST /api/agent/bidding/generate-from-files
 * 返回 taskId 用于后续轮询
 */
export function generateFromFiles(
  body: GenerateFromFilesRequest,
  signal?: AbortSignal,
): Promise<GenerateFromFilesResponse> {
  return request<GenerateFromFilesResponse>('/agent/bidding/generate-from-files', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  })
}

/**
 * 轮询获取任务状态
 * GET /api/agent/bidding/status/{taskId}
 */
export function getTaskStatus(
  taskId: string,
  signal?: AbortSignal,
): Promise<TaskStatusResponse> {
  return request<TaskStatusResponse>(`/agent/bidding/status/${taskId}`, {
    signal,
  })
}

/**
 * 下载任务生成结果
 * GET /api/agent/bidding/result/{taskId}
 * 后端返回文件流时，客户端以 Blob 形式接收并触发浏览器下载
 */
export async function downloadTaskResult(
  taskId: string,
  filename = '生成结果.xlsx',
  signal?: AbortSignal,
): Promise<void> {
  const url = `${getApiBaseUrl()}/agent/bidding/result/${taskId}`

  const res = await fetch(url, { signal })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `下载失败 (${res.status})`)
  }

  const blob = await res.blob()
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(blobUrl)
}