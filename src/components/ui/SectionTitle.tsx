import type { LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  children: React.ReactNode
  /** 主标题（左侧上传/解析） */
  size?: 'lg' | 'md'
  className?: string
}

const sizeClass = {
  lg: {
    wrap: 'mb-8 min-h-8',
    text: 'text-xl font-semibold tracking-wide text-slate-100',
    icon: 'h-6 w-6 text-cyan-400',
  },
  md: {
    wrap: 'mb-6 min-h-7',
    text: 'text-lg font-bold uppercase tracking-widest text-cyan-500',
    icon: 'h-5 w-5 text-cyan-500',
  },
}

export function SectionTitle({
  icon: Icon,
  children,
  size = 'lg',
  className = '',
}: Props) {
  const s = sizeClass[size]
  return (
    <h2
      className={`flex items-center gap-3 ${s.wrap} ${s.text} ${className}`}
    >
      <Icon className={`${s.icon} shrink-0`} aria-hidden />
      <span className="leading-none">{children}</span>
    </h2>
  )
}
