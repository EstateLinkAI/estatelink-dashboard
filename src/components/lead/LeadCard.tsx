import { Link } from 'react-router-dom'
import { STRATEGY_LABELS, type Lead } from '../../types/lead'
import { GradeBadge } from './GradeBadge'
import { ScorePill } from './ScorePill'

interface LeadCardProps {
  lead: Lead
}

function formatYield(value?: number) {
  return value != null ? `${value.toFixed(1)}%` : 'N/A'
}

function formatCurrency(value?: number) {
  return value != null
    ? new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        maximumFractionDigits: 0,
      }).format(value)
    : 'N/A'
}

function bestStrategy(lead: Lead) {
  return [...lead.strategyScores]
    .filter((item) => item.score != null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0]
}

export function LeadCard({ lead }: LeadCardProps) {
  const href = `/app/leads/${lead.id ?? lead.listingId ?? ''}`
  const title = lead.address ?? lead.title ?? 'Untitled property lead'
  const subtitle = [lead.city, lead.postcodeArea, lead.propertyType].filter(Boolean).join(' / ')
  const topStrategy = bestStrategy(lead)
  const topReason = lead.reasons[0]

  return (
    <Link
      to={href}
      className="block min-w-0 rounded-md border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {subtitle || 'Location pending'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <ScorePill score={lead.score} />
          <GradeBadge grade={lead.grade} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs">
        <div>
          <p className="text-slate-400">Price</p>
          <p className="mt-0.5 font-medium text-slate-900">{formatCurrency(lead.price)}</p>
        </div>
        <div>
          <p className="text-slate-400">Rent est.</p>
          <p className="mt-0.5 font-medium text-slate-900">{formatCurrency(lead.rentalEstimate)}</p>
        </div>
        <div>
          <p className="text-slate-400">Yield signal</p>
          <p className="mt-0.5 font-medium text-slate-900">{formatYield(lead.yield)}</p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          {lead.daysOnMarket != null ? `${lead.daysOnMarket}d on market` : 'Days on market unknown'}
        </span>
        {topStrategy?.strategy ? (
          <span className="font-medium text-slate-700">
            Best fit: {STRATEGY_LABELS[topStrategy.strategy as keyof typeof STRATEGY_LABELS] ?? topStrategy.strategy} ({topStrategy.score?.toFixed(0)})
          </span>
        ) : null}
      </div>

      {topReason ? (
        <p className="mt-2 truncate border-t border-slate-100 pt-2 text-xs text-slate-500">{topReason}</p>
      ) : null}
    </Link>
  )
}
