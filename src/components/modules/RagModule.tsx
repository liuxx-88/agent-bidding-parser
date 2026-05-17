import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Bot, CheckCircle2, Download, Loader2, XCircle } from 'lucide-react'
import { generateFromFiles, getTaskStatus } from '../../api/agent'
import { downloadFile } from '../../api/files'

type Props = {
  miloUrl: string
  onBack: () => void
}

function LogRow({ time, children }: { time: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-x-3 font-mono text-xs">
      <span className="text-right tabular-nums text-slate-600">[{time}]</span>
      <span className="min-w-0 text-left leading-relaxed text-slate-300">
        {children}
      </span>
    </div>
  )
}

function formatLogTime(id: number) {
  return new Date(id).toLocaleTimeString([], { hour12: false })
}

export function RagModule({ miloUrl, onBack }: Props) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [generatedMinioUrl, setGeneratedMinioUrl] = useState('')
  const [stepLogs, setStepLogs] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const seenMessagesRef = useRef<Set<string>>(new Set())

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [stepLogs])

  const handleGenerate = async () => {
    if (!miloUrl || isGenerating) return

    setIsGenerating(true)
    setGenerateError(null)
    setGeneratedMinioUrl('')
    setStepLogs([])
    seenMessagesRef.current.clear()

    try {
      const { taskId } = await generateFromFiles({ templatePath: miloUrl })

      const pollInterval = 2000
      const maxAttempts = 300
      let attempts = 0

      while (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, pollInterval))
        attempts++

        const statusRes = await getTaskStatus(taskId)

        // 每次轮询追加 stepLogs（去重），使用 ref 保证跨次轮询去重
        if (statusRes.stepLogs?.length) {
          const newLogs: string[] = []
          for (const log of statusRes.stepLogs) {
            const msg =
              typeof log === 'object' && log !== null
                ? String(log.message ?? '')
                : String(log)
            if (msg && !seenMessagesRef.current.has(msg)) {
              newLogs.push(msg)
              seenMessagesRef.current.add(msg)
            }
          }
          if (newLogs.length > 0) {
            setStepLogs((prev) => [...prev, ...newLogs])
          }
        }

        // progress 达到 100% 或状态为 COMPLETED 时停止轮询
        const currentProgress = statusRes.progress ?? 0
        if (
          (currentProgress >= 100 || statusRes.status === 'COMPLETED') &&
          statusRes.result?.minioPath
        ) {
          const rawUrl = statusRes.result.minioPath as string
          const displayUrl = rawUrl.replace(/localhost/, '192.168.3.153:3000')
          setGeneratedMinioUrl(displayUrl)
          break
        }

        if (statusRes.status === 'FAILED') {
          throw new Error(statusRes.message || '任务执行失败')
        }
      }

      if (attempts >= maxAttempts) {
        throw new Error('任务超时，请稍后重试')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '文件生成失败'
      setGenerateError(message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedMinioUrl) return
    try {
      await downloadFile(generatedMinioUrl)
    } catch (err) {
      const message = err instanceof Error ? err.message : '下载失败'
      setGenerateError(message)
    }
  }

  const isCompleted = Boolean(generatedMinioUrl)

  return (
    <div className="space-y-10">
      {/* Agent 生成处理区 */}
      <section className="rounded-2xl border border-cyan-500/20 bg-slate-900 px-6 pb-6 pt-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10">
            <Bot className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Agent 生成处理</h2>
            <p className="text-xs text-slate-500">
              基于已上传的标书文件，由 Agent 自动生成最终结果文件
            </p>
          </div>
        </div>

        {/* 操作按钮 */}
        {!isGenerating && !isCompleted && (
          <button
            type="button"
            onClick={handleGenerate}
            className="mb-4 inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-6 py-3 text-sm font-semibold text-cyan-400 transition-all hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
          >
            <Bot className="h-4 w-4" />
            开始生成文件
          </button>
        )}

        {/* Step Logs 展示区 */}
        {(stepLogs.length > 0 || isGenerating) && (
          <div
            ref={scrollRef}
            className="custom-scrollbar mb-4 max-h-[400px] overflow-y-auto rounded-xl border border-slate-800 bg-black/40 p-4"
          >
            <div className="space-y-2">
              {stepLogs.map((log, i) => (
                <LogRow key={i} time={formatLogTime(Date.now() + i)}>
                  <span
                    className={
                      log.startsWith('✅')
                        ? 'text-emerald-400'
                        : log.startsWith('❌')
                          ? 'text-red-400'
                          : 'text-slate-300'
                    }
                  >
                    {log}
                  </span>
                </LogRow>
              ))}
              {isGenerating && (
                <LogRow time="--:--:--">
                  <span className="inline-flex items-center gap-2 text-cyan-400 animate-pulse">
                    <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                    Agent 推理中...
                  </span>
                </LogRow>
              )}
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {generateError && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p className="text-xs leading-relaxed text-red-400">{generateError}</p>
          </div>
        )}

        {/* 生成完成：MinIO 地址 + 下载 */}
        {isCompleted && (
          <div className="space-y-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-400">文件生成成功</p>
                <div className="mt-2 break-all rounded border border-slate-800 bg-black/60 px-3 py-3 text-left font-mono text-[10px] leading-relaxed text-emerald-300">
                  {generatedMinioUrl}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20"
            >
              <Download className="h-3.5 w-3.5" />
              下载生成文件
            </button>
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-5 py-2.5 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        上一步
      </button>
    </div>
  )
}