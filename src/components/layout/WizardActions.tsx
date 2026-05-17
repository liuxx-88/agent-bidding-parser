import { ArrowLeft, ArrowRight } from 'lucide-react'

type Props = {
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  showBack?: boolean
}

export function WizardActions({
  onBack,
  onNext,
  nextLabel = '下一步',
  nextDisabled = false,
  showBack = false,
}: Props) {
  return (
    <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-6">
      {showBack && onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg border border-slate-700 px-5 py-2.5 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          上一步
        </button>
      ) : (
        <div />
      )}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {nextLabel}
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
