import { Link, useNavigate } from 'react-router-dom'
import { STRATEGY_LABELS, type Lead } from '../../types/lead'
import { GradeBadge } from './GradeBadge'
import { ScorePill } from './ScorePill'
import { StrategyBadges } from './StrategyBadges'

interface LeadTableProps {
  leads: Lead[]
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

export function LeadTable({ leads }: LeadTableProps) {
  const navigate = useNavigate()

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/75 shadow-[0_12px_40px_rgba(2,6,23,0.25)]">
      <div className="border-b border-white/10 bg-slate-950/60 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/75">
              Lead Table
            </p>
            <h3 className="mt-2 break-words text-lg font-semibold text-white">
              Ranked property opportunities
            </h3>
          </div>
          <p className="shrink-0 text-sm text-slate-400">{leads.length} records</p>
        </div>
      </div>

      <div className="grid gap-3 p-3 xl:hidden">
        {leads.map((lead) => {
          const href = leadHref(lead)

          return (
            <Link
              key={lead.id ?? lead.listingId ?? `${lead.title}-${lead.address}`}
              className="min-w-0 rounded-xl border border-white/10 bg-slate-950/70 p-4 text-left transition hover:border-cyan-400/30"
              to={href}
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-white">
                    {lead.address ?? lead.title ?? 'Untitled property lead'}
                  </p>
                  <p className="mt-1 break-words text-xs uppercase tracking-[0.14em] text-slate-500">
                    {[lead.city, lead.postcodeArea, lead.propertyType].filter(Boolean).join(' / ') ||
                      'Lead intelligence record'}
                  </p>
                </div>
                <ScorePill score={lead.score} className="shrink-0" />
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                <span>Source: {lead.sourcePlatform ?? 'N/A'}</span>
                <span>Price: {formatCurrency(lead.price)}</span>
                <span>Bedrooms: {lead.bedrooms ?? 'N/A'}</span>
                <span>Yield: {formatYield(lead.yield)}</span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <GradeBadge grade={lead.grade} />
                <span className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
                  View details
                </span>
              </div>

              <StrategyBadges lead={lead} className="mt-3" />
            </Link>
          )
        })}
      </div>

      <div className="hidden xl:block">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-[0.14em] text-slate-500">
              <th className="w-[20%] px-4 py-3 font-medium">Property</th>
              <th className="w-[9%] px-3 py-3 font-medium">City</th>
              <th className="hidden w-[8%] px-3 py-3 font-medium 2xl:table-cell">Postcode</th>
              <th className="w-[10%] px-3 py-3 font-medium">Type</th>
              <th className="hidden w-[10%] px-3 py-3 font-medium 2xl:table-cell">Source</th>
              <th className="w-[10%] px-3 py-3 font-medium">Price</th>
              <th className="hidden w-[5%] px-3 py-3 font-medium 2xl:table-cell">Beds</th>
              <th className="w-[7%] px-3 py-3 font-medium">Score</th>
              <th className="w-[7%] px-3 py-3 font-medium">Grade</th>
              <th className="hidden w-[6%] px-3 py-3 font-medium 2xl:table-cell">Yield</th>
              <th className="w-[13%] px-3 py-3 font-medium">Top Strategy</th>
              <th className="w-[9%] px-4 py-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {leads.map((lead) => {
              const href = leadHref(lead)

              return (
                <tr
                  key={lead.id ?? lead.listingId ?? `${lead.title}-${lead.address}`}
                  onClick={() => navigate(href)}
                  className="cursor-pointer bg-transparent text-sm text-slate-300 transition hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">
                        {lead.address ?? lead.title ?? 'Untitled property lead'}
                      </p>
                      <p className="mt-1 truncate text-xs uppercase tracking-[0.12em] text-slate-500">
                        {lead.title && lead.address
                          ? lead.title
                          : lead.sourcePlatform ?? 'Lead intelligence record'}
                      </p>
                    </div>
                  </td>
                  <td className="truncate px-3 py-4">{lead.city ?? 'N/A'}</td>
                  <td className="hidden truncate px-3 py-4 2xl:table-cell">{lead.postcodeArea ?? 'N/A'}</td>
                  <td className="truncate px-3 py-4">{lead.propertyType ?? 'N/A'}</td>
                  <td className="hidden truncate px-3 py-4 2xl:table-cell">{lead.sourcePlatform ?? 'N/A'}</td>
                  <td className="truncate px-3 py-4 text-white">{formatCurrency(lead.price)}</td>
                  <td className="hidden px-3 py-4 2xl:table-cell">{lead.bedrooms ?? 'N/A'}</td>
                  <td className="px-3 py-4">
                    <ScorePill score={lead.score} />
                  </td>
                  <td className="px-3 py-4">
                    <GradeBadge grade={lead.grade} />
                  </td>
                  <td className="hidden px-3 py-4 2xl:table-cell">{formatYield(lead.yield)}</td>
                  <td className="truncate px-3 py-4">
                    {(() => {
                      const top = bestStrategy(lead)
                      if (!top?.strategy) return 'N/A'
                      return `${STRATEGY_LABELS[top.strategy as keyof typeof STRATEGY_LABELS] ?? top.strategy} (${top.score?.toFixed(0)})`
                    })()}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      to={href}
                      onClick={(event) => event.stopPropagation()}
                      className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
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
