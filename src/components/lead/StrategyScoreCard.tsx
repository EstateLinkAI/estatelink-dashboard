import { STRATEGY_LABELS, type StrategyScore, type StrategyType } from '../../types/lead'
import { GradeBadge } from './GradeBadge'
import { ScorePill } from './ScorePill'
import { ScoreReasons } from './ScoreReasons'

interface StrategyScoreCardProps {
  strategy: StrategyType
  score?: StrategyScore
}

export function StrategyScoreCard({ strategy, score }: StrategyScoreCardProps) {
  const label = STRATEGY_LABELS[strategy]

  return (
    <div className="min-w-0 rounded-md border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">{label}</h4>
        <div className="flex items-center gap-2">
          <ScorePill score={score?.score} />
          <GradeBadge grade={score?.grade} />
        </div>
      </div>

      <div className="mt-3">
        {score ? (
          <ScoreReasons reasons={score.reasons} raw={score.reasonsRaw ?? score.reasons} />
        ) : (
          <p className="text-sm text-slate-400">No {label.toLowerCase()} score available for this listing.</p>
        )}
      </div>
    </div>
  )
}
