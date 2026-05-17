import { useRef, useState } from 'react'
import { ApiError } from './api/client'
import { pickFilePathFromResponse, uploadFile } from './api/files'
import { AppHeader } from './components/layout/AppHeader'
import { StepIndicator } from './components/layout/StepIndicator'
import { RagModule } from './components/modules/RagModule'
import { UploadParseModule } from './components/modules/UploadParseModule'
import type {
  AgentLog,
  ParseResult,
  ParseStep,
  RagMatch,
  WizardStep,
} from './types/workflow'

const PARSE_STEPS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  STORING: 'storing',
  INTERACTING: 'interacting',
  SUCCESS: 'success',
} as const

function App() {
  const sessionId = useRef(
    Math.random().toString(36).substring(7).toUpperCase(),
  ).current

  const [wizardStep, setWizardStep] = useState<WizardStep>('upload')
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(
    () => new Set(),
  )

  const [parseStep, setParseStep] = useState<ParseStep>(PARSE_STEPS.IDLE)
  const [file, setFile] = useState<File | null>(null)
  const [miloUrl, setMiloUrl] = useState('')
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([])
  const [finalJson, setFinalJson] = useState<ParseResult | null>(null)
  const [ragMatches, setRagMatches] = useState<RagMatch[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)

  const addLog = (msg: string) => {
    setAgentLogs((prev) => [...prev, { id: Date.now(), text: msg }])
  }

  const markCompleted = (step: WizardStep) => {
    setCompletedSteps((prev) => new Set(prev).add(step))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      void startWorkflow(selectedFile)
    }
  }

  const startWorkflow = async (uploadedFile: File) => {
    setUploadError(null)
    setAgentLogs([])
    setMiloUrl('')
    setFinalJson(null)
    setRagMatches([])
    setAnalysisProgress(0)
    setWizardStep('upload')
    setCompletedSteps(new Set())

    setParseStep(PARSE_STEPS.UPLOADING)
    addLog(`正在上传文件: ${uploadedFile.name}...`)

    try {
      const uploadResult = await uploadFile(uploadedFile, {
        onProgress: (percent) => {
          if (percent % 25 === 0 || percent === 100) {
            addLog(`上传进度: ${percent}%`)
          }
        },
      })

      addLog('上传成功，服务端响应已返回')
      console.debug('[upload] response:', uploadResult)

      setParseStep(PARSE_STEPS.STORING)
      const pathFromApi = pickFilePathFromResponse(uploadResult)
      const resolvedUrl =
        pathFromApi ??
        `milo://bucket-tunnel-co/bids/${Date.now()}-${uploadedFile.name}`
      setMiloUrl(resolvedUrl)
      addLog(`文件已登记，Milo 路径: ${resolvedUrl}`)

      addLog('文件登记完成，可进入下一步')
      setParseStep(PARSE_STEPS.SUCCESS)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? `[${err.status}] ${err.message}`
          : err instanceof Error
            ? err.message
            : '上传失败'
      setUploadError(message)
      addLog(`上传失败: ${message}`)
      setParseStep(PARSE_STEPS.IDLE)
    }
  }

  const goToRag = () => {
    markCompleted('upload')
    setWizardStep('rag')
  }

  const goBackToUpload = () => setWizardStep('upload')

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-cyan-500/30">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-8">
        <AppHeader />
        <StepIndicator current={wizardStep} completed={completedSteps} />

        {wizardStep === 'upload' && (
          <UploadParseModule
            parseStep={parseStep}
            file={file}
            miloUrl={miloUrl}
            uploadError={uploadError}
            agentLogs={agentLogs}
            analysisProgress={analysisProgress}
            finalJson={finalJson}
            onFileUpload={handleFileUpload}
            onNext={goToRag}
          />
        )}

        {wizardStep === 'rag' && (
          <RagModule miloUrl={miloUrl} onBack={goBackToUpload} />
        )}

        <footer className="mt-12 border-t border-slate-900 pt-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
            隧道股份有限公司 · Agent 大赛演示 · SESSION_{sessionId}
          </p>
        </footer>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  )
}

export default App