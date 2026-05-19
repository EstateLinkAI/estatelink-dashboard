interface GradeBadgeProps {
  grade?: string
  className?: string
}

const gradeStyles: Record<string, string> = {
  A: 'border-emerald-500/30 bg-emerald-500/12 text-emerald-200',
  B: 'border-sky-500/30 bg-sky-500/12 text-sky-200',
  C: 'border-amber-500/30 bg-amber-500/12 text-amber-200',
  D: 'border-rose-500/30 bg-rose-500/12 text-rose-200',
  F: 'border-rose-500/30 bg-rose-500/12 text-rose-200',
}

export function GradeBadge({ grade, className = '' }: GradeBadgeProps) {
  const normalized = grade?.trim().toUpperCase()
  const tone = normalized
    ? gradeStyles[normalized] ?? 'border-slate-600/60 bg-slate-800/70 text-slate-200'
    : 'border-slate-600/60 bg-slate-800/70 text-slate-200'

  return (
    <span
      className={[
        'inline-flex min-w-10 items-center justify-center rounded-md border px-2.5 py-1 text-xs font-semibold tracking-[0.18em]',
        tone,
        className,
      ].join(' ')}
    >
      {normalized ?? 'N/A'}
    </span>
  )
}
