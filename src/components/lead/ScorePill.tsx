interface ScorePillProps {
  score?: number
  className?: string
}

function getScoreTone(score?: number) {
  if (score == null) {
    return 'border-slate-300 bg-slate-50 text-slate-500'
  }

  if (score >= 85) {
    return 'border-emerald-300 bg-emerald-50 text-emerald-800'
  }

  if (score >= 70) {
    return 'border-blue-300 bg-blue-50 text-blue-800'
  }

  if (score >= 55) {
    return 'border-amber-300 bg-amber-50 text-amber-800'
  }

  return 'border-red-300 bg-red-50 text-red-800'
}

export function ScorePill({ score, className = '' }: ScorePillProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-sm font-semibold tabular-nums',
        getScoreTone(score),
        className,
      ].join(' ')}
    >
      {score != null ? score.toFixed(0) : 'N/A'}
    </span>
  )
}
