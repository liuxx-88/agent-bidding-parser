import { ApiError, getApiBaseUrl, request } from './client'

/** 上传接口表单字段名，若后端要求其他字段名可改此处 */
const FILE_FIELD_NAME = 'file'

export type FileUploadResponse = {
  id?: string
  url?: string
  path?: string
  milo_path?: string
  filename?: string
  originalName?: string
  size?: number
  [key: string]: unknown
}

export type UploadFileOptions = {
  /** 额外表单字段（如 bucket、type 等） */
  extraFields?: Record<string, string>
  signal?: AbortSignal
  onProgress?: (percent: number) => void
}

/**
 * 上传文件 POST /api/files
 * 开发环境: 浏览器 -> Vite(/api) -> 本地 proxy(3001) -> 192.168.3.153:3000
 */
export function uploadFile(
  file: File,
  options: UploadFileOptions = {},
): Promise<FileUploadResponse> {
  const { extraFields, signal, onProgress } = options

  if (onProgress) {
    return uploadFileWithProgress(file, { extraFields, signal, onProgress })
  }

  const formData = new FormData()
  formData.append(FILE_FIELD_NAME, file)
  if (extraFields) {
    for (const [key, value] of Object.entries(extraFields)) {
      formData.append(key, value)
    }
  }

  return request<FileUploadResponse>('/files', {
    method: 'POST',
    body: formData,
    signal,
  })
}

function uploadFileWithProgress(
  file: File,
  options: Required<Pick<UploadFileOptions, 'onProgress'>> &
    Pick<UploadFileOptions, 'extraFields' | 'signal'>,
): Promise<FileUploadResponse> {
  const { extraFields, signal, onProgress } = options
  const base = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')
  const url = `${base}/files`

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      let body: unknown = xhr.responseText
      try {
        body = JSON.parse(xhr.responseText)
      } catch {
        /* 非 JSON 响应 */
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body as FileUploadResponse)
      } else {
        const message =
          body && typeof body === 'object' && 'message' in body
            ? String((body as { message: unknown }).message)
            : `上传失败 (${xhr.status})`
        reject(new ApiError(message, xhr.status, body))
      }
    }

    xhr.onerror = () => reject(new ApiError('网络错误', 0))
    xhr.onabort = () => reject(new ApiError('请求已取消', 0))

    if (signal) {
      signal.addEventListener('abort', () => xhr.abort())
    }

    const formData = new FormData()
    formData.append(FILE_FIELD_NAME, file)
    if (extraFields) {
      for (const [key, value] of Object.entries(extraFields)) {
        formData.append(key, value)
      }
    }
    xhr.send(formData)
  })
}

/**
 * 下载文件 GET /api/files/{id}/download
 * 后端返回文件流时，客户端以 Blob 形式接收并触发浏览器下载
 */
export async function downloadFile(
  id: string,
  filename?: string,
  signal?: AbortSignal,
): Promise<void> {
  const url = `${getApiBaseUrl()}/files/${encodeURIComponent(id)}/download`

  const res = await fetch(url, { signal })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ApiError(text || `下载失败 (${res.status})`, res.status, text)
  }

  const blob = await res.blob()

  // 如果未指定文件名，尝试从 Content-Disposition 头解析
  let downloadName = filename ?? 'download'
  const disposition = res.headers.get('content-disposition')
  if (disposition) {
    const utf8Match = disposition.match(/filename\*=UTF-8''(.+)/)
    if (utf8Match) {
      downloadName = decodeURIComponent(utf8Match[1])
    } else {
      const match = disposition.match(/filename="?([^"]+)"?/)
      if (match) {
        downloadName = match[1]
      }
    }
  }

  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = downloadName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(blobUrl)
}

/** 从上传响应中尽量解析出可展示的存储路径 */
export function pickFilePathFromResponse(
  data: FileUploadResponse,
): string | undefined {
  return (
    data.milo_path ??
    data.path ??
    data.url ??
    (typeof data.id === 'string' ? `file://${data.id}` : undefined)
  )
}
