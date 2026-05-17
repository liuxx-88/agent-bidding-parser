import { ChevronRight } from 'lucide-react'
import type { WizardStep } from '../../types/workflow'

type Props = {
  current: WizardStep
  completed: Set<WizardStep>
}

const STEPS: { key: WizardStep; label: string }[] = [
  { key: 'upload', label: '标书上传解析' },
  { key: 'rag', label: 'Agent 生成处理' },
]

export function StepIndicator({ current, completed }: Props) {
  return (
    <div className="mb-10 flex items-center gap-1">
      {STEPS.map((step, index) => {
        const isActive = step.key === current
        const isDone = completed.has(step.key)

        return (
          <div key={step.key} className="flex items-center gap-1">
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40'
                    : isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-500'
                }`}
              >
                {isDone ? '✓' : index + 1}
              </div>
              <span
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-cyan-400'
                    : isDone
                      ? 'text-slate-300'
                      : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <ChevronRight
                className={`h-4 w-4 shrink-0 ${
                  completed.has(step.key) ? 'text-cyan-500' : 'text-slate-700'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}