import { Link, useNavigate } from 'react-router-dom'
import { STRATEGY_LABELS, type Lead } from '../../types/lead'
import { GradeBadge } from './GradeBadge'
import { ScorePill } from './ScorePill'
import { StrategyBadges } from './StrategyBadges'

interface LeadTableProps {
  leads: Lead[]
  loading?: boolean
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

function formatYield(value?: number) {
  return value != null ? `${value.toFixed(1)}%` : 'N/A'
}

function leadHref(lead: Lead) {
  return `/app/leads/${lead.id ?? lead.listingId ?? ''}`
}

function bestStrategy(lead: Lead) {
  return [...lead.strategyScores]
    .filter((item) => item.score != null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0]
}

export function LeadTable({ leads, loading }: LeadTableProps) {
  const navigate = useNavigate()

  return (
    <section
      className={`min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white transition-opacity ${
        loading ? 'opacity-60' : ''
      }`}
    >
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Ranked property opportunities</h3>
          <p className="shrink-0 text-xs text-slate-500">{leads.length} records</p>
        </div>
      </div>

      <div className="grid gap-2 p-2 xl:hidden">
        {leads.map((lead) => {
          const href = leadHref(lead)

          return (
            <Link
              key={lead.id ?? lead.listingId ?? `${lead.title}-${lead.address}`}
              className="min-w-0 rounded-md border border-slate-200 bg-white p-3 text-left transition hover:border-blue-300"
              to={href}
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {lead.address ?? lead.title ?? 'Untitled property lead'}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {[lead.city, lead.postcodeArea, lead.propertyType].filter(Boolean).join(' / ') || 'Location pending'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <ScorePill score={lead.score} />
                  <GradeBadge grade={lead.grade} />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <span>Source: {lead.sourcePlatform ?? 'N/A'}</span>
                <span>Price: {formatCurrency(lead.price)}</span>
                <span>Bedrooms: {lead.bedrooms ?? 'N/A'}</span>
                <span>Yield signal: {formatYield(lead.yield)}</span>
              </div>

              <StrategyBadges lead={lead} className="mt-3" />
            </Link>
          )
        })}
      </div>

      <div className="hidden xl:block">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] uppercase tracking-[0.08em] text-slate-500">
              <th className="w-[20%] px-4 py-2.5 font-medium">Property</th>
              <th className="w-[9%] px-3 py-2.5 font-medium">City</th>
              <th className="hidden w-[8%] px-3 py-2.5 font-medium 2xl:table-cell">Postcode</th>
              <th className="w-[10%] px-3 py-2.5 font-medium">Type</th>
              <th className="hidden w-[10%] px-3 py-2.5 font-medium 2xl:table-cell">Source</th>
              <th className="w-[10%] px-3 py-2.5 font-medium">Price</th>
              <th className="hidden w-[5%] px-3 py-2.5 font-medium 2xl:table-cell">Beds</th>
              <th className="w-[7%] px-3 py-2.5 font-medium">Score</th>
              <th className="w-[7%] px-3 py-2.5 font-medium">Grade</th>
              <th className="hidden w-[6%] px-3 py-2.5 font-medium 2xl:table-cell">Yield</th>
              <th className="w-[13%] px-3 py-2.5 font-medium">Strategy fit</th>
              <th className="w-[9%] px-4 py-2.5 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => {
              const href = leadHref(lead)

              return (
                <tr
                  key={lead.id ?? lead.listingId ?? `${lead.title}-${lead.address}`}
                  onClick={() => navigate(href)}
                  className="cursor-pointer bg-white text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {lead.address ?? lead.title ?? 'Untitled property lead'}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {lead.title && lead.address ? lead.title : lead.sourcePlatform ?? 'Lead record'}
                      </p>
                    </div>
                  </td>
                  <td className="truncate px-3 py-3">{lead.city ?? 'N/A'}</td>
                  <td className="hidden truncate px-3 py-3 2xl:table-cell">{lead.postcodeArea ?? 'N/A'}</td>
                  <td className="truncate px-3 py-3">{lead.propertyType ?? 'N/A'}</td>
                  <td className="hidden truncate px-3 py-3 2xl:table-cell">{lead.sourcePlatform ?? 'N/A'}</td>
                  <td className="truncate px-3 py-3 text-slate-900">{formatCurrency(lead.price)}</td>
                  <td className="hidden px-3 py-3 2xl:table-cell">{lead.bedrooms ?? 'N/A'}</td>
                  <td className="px-3 py-3">
                    <ScorePill score={lead.score} />
                  </td>
                  <td className="px-3 py-3">
                    <GradeBadge grade={lead.grade} />
                  </td>
                  <td className="hidden px-3 py-3 2xl:table-cell">{formatYield(lead.yield)}</td>
                  <td className="truncate px-3 py-3">
                    {(() => {
                      const top = bestStrategy(lead)
                      if (!top?.strategy) return 'N/A'
                      return `${STRATEGY_LABELS[top.strategy as keyof typeof STRATEGY_LABELS] ?? top.strategy} (${top.score?.toFixed(0)})`
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={href}
                      onClick={(event) => event.stopPropagation()}
                      className="text-sm font-medium text-blue-700 transition hover:text-blue-800"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
