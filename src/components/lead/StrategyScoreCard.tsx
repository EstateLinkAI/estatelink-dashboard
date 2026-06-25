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
    <div className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">{label}</h4>
        <div className="flex items-center gap-2">
          <ScorePill score={score?.score} />
          <GradeBadge grade={score?.grade} />
        </div>
      </div>

      <div className="mt-4">
        {score ? (
          <ScoreReasons reasons={score.reasons} raw={score.reasonsRaw ?? score.reasons} />
        ) : (
          <p className="text-sm text-slate-500">No {label.toLowerCase()} score available for this listing.</p>
        )}
      </div>
    </div>
  )
}
