import { STRATEGY_LABELS, type Lead, type StrategyType } from '../../types/lead'

const HIGHLIGHTED_STRATEGIES: StrategyType[] = ['hmo', 'brrrr', 'buy_to_let', 'flip']

function normalizeStrategy(strategy?: string): string | undefined {
  return strategy?.trim().toLowerCase()
}

interface StrategyBadgesProps {
  lead: Lead
  className?: string
}

export function StrategyBadges({ lead, className = '' }: StrategyBadgesProps) {
  const badges = HIGHLIGHTED_STRATEGIES.map((strategy) => {
    const match = lead.strategyScores.find((item) => normalizeStrategy(item.strategy) === strategy)
    return match?.score != null ? { strategy, score: match.score } : null
  }).filter((item): item is { strategy: StrategyType; score: number } => item != null)

  if (badges.length === 0) {
    return null
  }

  return (
    <div className={['flex flex-wrap items-center gap-2', className].join(' ')}>
      {badges.map((badge) => (
        <span
          key={badge.strategy}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-slate-300"
        >
          {STRATEGY_LABELS[badge.strategy]}
          <span className="font-semibold text-cyan-200">{badge.score.toFixed(0)}</span>
        </span>
      ))}
    </div>
  )
}
