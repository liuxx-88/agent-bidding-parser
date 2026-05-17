import {
  Upload,
  FileText,
  Database,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import type { AgentLog, ParseResult, ParseStep } from '../../types/workflow'
import { WizardActions } from '../layout/WizardActions'
import { SectionTitle } from '../ui/SectionTitle'

const PARSE_STEPS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  STORING: 'storing',
  INTERACTING: 'interacting',
  SUCCESS: 'success',
} as const

type Props = {
  parseStep: ParseStep
  file: File | null
  miloUrl: string
  uploadError: string | null
  agentLogs: AgentLog[]
  analysisProgress: number
  finalJson: ParseResult | null
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onNext: () => void
}

function formatLogTime(id: number) {
  return new Date(id).toLocaleTimeString([], { hour12: false })
}

function LogRow({ time, children }: { time: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[5.75rem_minmax(0,1fr)] items-baseline gap-x-3 font-mono text-xs">
      <span className="text-right tabular-nums text-slate-600">[{time}]</span>
      <span className="min-w-0 text-left leading-relaxed text-slate-300">
        {children}
      </span>
    </div>
  )
}

export function UploadParseModule({
  parseStep,
  file,
  miloUrl,
  uploadError,
  agentLogs,
  onFileUpload,
  onNext,
}: Props) {
  const isIdle = parseStep === PARSE_STEPS.IDLE

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col gap-8 lg:col-span-4">
          <section
            className={`rounded-2xl border px-6 pb-6 pt-8 transition-all duration-500 ${
              isIdle
                ? 'border-cyan-500/30 bg-slate-900 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                : 'border-slate-800 bg-slate-900/40'
            }`}
          >
            <SectionTitle icon={Upload} size="lg">
              上传标书原文
            </SectionTitle>

            <label
              className={`relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition-all ${
                isIdle
                  ? 'border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800'
                  : 'cursor-not-allowed border-slate-800 opacity-50'
              }`}
            >
              <FileText
                className={`mb-2 h-8 w-8 ${isIdle ? 'text-slate-400' : 'text-slate-600'}`}
              />
              <span className="text-xs text-slate-400">
                点击或拖拽 PDF / Word / Markdown
              </span>
              <input
                type="file"
                className="hidden"
                onChange={onFileUpload}
                disabled={!isIdle}
                accept=".pdf,.doc,.docx,.md,.markdown"
              />
            </label>

            {uploadError && (
              <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-left text-xs leading-relaxed text-red-400">
                {uploadError}
              </p>
            )}
            {file && !isIdle && (
              <p className="mt-2 truncate text-left text-[10px] text-slate-500">
                <span className="text-slate-600">已选: </span>
                {file.name}
              </p>
            )}
          </section>

          {miloUrl && (
            <section className="rounded-2xl border border-cyan-500/20 bg-slate-900 px-6 pb-6 pt-8">
              <SectionTitle icon={Database} size="md">
                文件存储地址
              </SectionTitle>
              <div className="break-all rounded border border-slate-800 bg-black px-3 py-3 text-left font-mono text-[10px] leading-relaxed text-cyan-400">
                {miloUrl}
              </div>
              <p className="mt-2 flex items-start gap-2 text-left text-[10px] leading-relaxed text-emerald-400">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" />
                <span>文件已登记，可进入下一步由 Agent 生成最终文件</span>
              </p>
            </section>
          )}
        </div>

        <div className="lg:col-span-8">
          <div className="flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl">
            <div className="flex min-h-[4.5rem] items-center justify-between gap-4 border-b border-slate-800 bg-slate-900/80 px-6 py-5 backdrop-blur-md">
              <h2 className="text-left text-xl font-bold leading-tight tracking-wide text-slate-100">
                上传日志
              </h2>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    parseStep === PARSE_STEPS.INTERACTING
                      ? 'animate-pulse bg-cyan-500'
                      : parseStep === PARSE_STEPS.SUCCESS
                        ? 'bg-emerald-500'
                        : 'bg-slate-700'
                  }`}
                />
                <span className="whitespace-nowrap font-mono text-[10px] uppercase tabular-nums text-slate-500">
                  {parseStep}
                </span>
              </div>
            </div>

            <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-6 text-left">
              {agentLogs.length > 0 && (
                <div className="space-y-2">
                  {agentLogs.map((log) => (
                    <LogRow key={log.id} time={formatLogTime(log.id)}>
                      <span className="text-cyan-500">»</span> {log.text}
                    </LogRow>
                  ))}
                  {parseStep === PARSE_STEPS.INTERACTING && (
                    <LogRow time="--:--:--">
                      <span className="inline-flex items-center gap-2 text-cyan-400 animate-pulse">
                        <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                        处理中...
                      </span>
                    </LogRow>
                  )}
                </div>
              )}

              {isIdle && agentLogs.length === 0 && (
                <p className="py-16 text-center text-sm text-slate-600">
                  上传标书后，此处将展示上传日志
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <WizardActions
        onNext={onNext}
        nextLabel="下一步：Agent生成处理"
        nextDisabled={!file || parseStep !== PARSE_STEPS.SUCCESS}
      />
    </div>
  )
}