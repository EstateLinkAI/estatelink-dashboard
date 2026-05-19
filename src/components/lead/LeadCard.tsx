import { Link } from 'react-router-dom'
import type { Lead } from '../../types/lead'
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

export function LeadCard({ lead }: LeadCardProps) {
  const href = `/app/leads/${lead.id ?? lead.listingId ?? ''}`
  const title = lead.address ?? lead.title ?? 'Untitled property lead'
  const subtitle = [lead.city, lead.postcodeArea, lead.propertyType].filter(Boolean).join(' / ')
  const meta = [lead.sourcePlatform, lead.bedrooms != null ? `${lead.bedrooms} bd` : undefined]
    .filter(Boolean)
    .join(' • ')

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-950/65 p-5 transition hover:border-cyan-400/25 hover:bg-slate-950">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-white">{title}</p>
          <p className="mt-2 text-sm text-slate-400">{subtitle || 'Location and property metadata pending'}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
            {meta || 'Lead intelligence record'}
          </p>
        </div>
        <ScorePill score={lead.score} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <GradeBadge grade={lead.grade} />
        <span className="text-sm text-slate-400">Yield {formatYield(lead.yield)}</span>
        {lead.price != null ? (
          <span className="text-sm text-slate-400">Price {formatCurrency(lead.price)}</span>
        ) : null}
      </div>

      <div className="mt-5">
        <Link to={href} className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
          View details
        </Link>
      </div>
    </article>
  )
}
