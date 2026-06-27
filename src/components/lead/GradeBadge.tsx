interface GradeBadgeProps {
  grade?: string
  className?: string
}

const gradeStyles: Record<string, string> = {
  A: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  B: 'border-blue-300 bg-blue-50 text-blue-800',
  C: 'border-amber-300 bg-amber-50 text-amber-800',
  D: 'border-red-300 bg-red-50 text-red-800',
  F: 'border-red-300 bg-red-50 text-red-800',
}

export function GradeBadge({ grade, className = '' }: GradeBadgeProps) {
  const normalized = grade?.trim().toUpperCase()
  const tone = normalized ? gradeStyles[normalized] ?? 'border-slate-300 bg-slate-50 text-slate-600' : 'border-slate-300 bg-slate-50 text-slate-600'

  return (
    <span
      className={[
        'inline-flex min-w-7 items-center justify-center rounded-sm border px-1.5 py-0.5 text-xs font-semibold tracking-[0.06em]',
        tone,
        className,
      ].join(' ')}
      title={normalized ? `Grade ${normalized}` : 'No grade'}
    >
      {normalized ?? 'N/A'}
    </span>
  )
}
