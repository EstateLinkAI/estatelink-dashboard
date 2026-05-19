import { Link, useNavigate } from 'react-router-dom'
import type { Lead } from '../../types/lead'
import { GradeBadge } from './GradeBadge'
import { ScorePill } from './ScorePill'

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

export function LeadTable({ leads }: LeadTableProps) {
  const navigate = useNavigate()

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/75 shadow-[0_12px_40px_rgba(2,6,23,0.25)]">
      <div className="border-b border-white/10 bg-slate-950/60 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/75">
              Lead Table
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white">Ranked property opportunities</h3>
          </div>
          <p className="text-sm text-slate-400">{leads.length} records</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1260px] w-full">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-[0.18em] text-slate-500">
              <th className="px-5 py-3 font-medium">Property / Title</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Postcode</th>
              <th className="px-4 py-3 font-medium">Property Type</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Beds</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Grade</th>
              <th className="px-4 py-3 font-medium">Yield</th>
              <th className="px-5 py-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {leads.map((lead) => {
              const href = `/app/leads/${lead.id ?? lead.listingId ?? ''}`

              return (
                <tr
                  key={lead.id ?? lead.listingId ?? `${lead.title}-${lead.address}`}
                  onClick={() => navigate(href)}
                  className="cursor-pointer bg-transparent text-sm text-slate-300 transition hover:bg-white/[0.03]"
                >
                  <td className="px-5 py-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">
                        {lead.address ?? lead.title ?? 'Untitled property lead'}
                      </p>
                      <p className="mt-1 truncate text-xs uppercase tracking-[0.14em] text-slate-500">
                        {lead.title && lead.address
                          ? lead.title
                          : lead.sourcePlatform ?? 'Lead intelligence record'}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">{lead.city ?? 'N/A'}</td>
                  <td className="px-4 py-4">{lead.postcodeArea ?? 'N/A'}</td>
                  <td className="px-4 py-4">{lead.propertyType ?? 'N/A'}</td>
                  <td className="px-4 py-4">{lead.sourcePlatform ?? 'N/A'}</td>
                  <td className="px-4 py-4 text-white">{formatCurrency(lead.price)}</td>
                  <td className="px-4 py-4">{lead.bedrooms ?? 'N/A'}</td>
                  <td className="px-4 py-4">
                    <ScorePill score={lead.score} />
                  </td>
                  <td className="px-4 py-4">
                    <GradeBadge grade={lead.grade} />
                  </td>
                  <td className="px-4 py-4">{formatYield(lead.yield)}</td>
                  <td className="px-5 py-4">
                    <Link
                      to={href}
                      onClick={(event) => event.stopPropagation()}
                      className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                    >
                      View details
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
