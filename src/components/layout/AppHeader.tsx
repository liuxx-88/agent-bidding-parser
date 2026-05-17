import { Zap } from 'lucide-react'

export function AppHeader() {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-cyan-500/40 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 p-2">
          <Zap className="h-7 w-7 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              智能标书Agent
            </span>
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-slate-500">
            STEC Intelligence Framework
          </p>
        </div>
      </div>
    </header>
  )
}
