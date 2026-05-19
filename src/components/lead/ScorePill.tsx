interface ScorePillProps {
  score?: number
  className?: string
}

function getScoreTone(score?: number) {
  if (score == null) {
    return 'border-slate-700/80 bg-slate-900/80 text-slate-300'
  }

  if (score >= 85) {
    return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
  }

  if (score >= 70) {
    return 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200'
  }

  if (score >= 55) {
    return 'border-amber-400/30 bg-amber-500/10 text-amber-200'
  }

  return 'border-rose-400/30 bg-rose-500/10 text-rose-200'
}

export function ScorePill({ score, className = '' }: ScorePillProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-lg border px-2.5 py-1 text-sm font-semibold tabular-nums',
        getScoreTone(score),
        className,
      ].join(' ')}
    >
      {score != null ? score.toFixed(1) : 'N/A'}
    </span>
  )
}
