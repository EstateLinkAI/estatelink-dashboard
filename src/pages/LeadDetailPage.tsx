import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getLeadById } from '../api/leads'
import { GradeBadge } from '../components/lead/GradeBadge'
import { ScorePill } from '../components/lead/ScorePill'
import { ScoreReasons } from '../components/lead/ScoreReasons'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { LoadingState } from '../components/ui/LoadingState'
import type { Lead } from '../types/lead'

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

export function LeadDetailPage() {
  const { id } = useParams()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError('Lead ID is missing from the route.')
      setLoading(false)
      return
    }

    let active = true

    getLeadById(id)
      .then((data) => {
        if (active) {
          setLead(data)
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load this lead right now.')
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return <LoadingState label="Loading lead details..." rows={4} />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  if (!lead) {
    return (
      <EmptyState
        title="Lead not found"
        description="The requested lead could not be found or did not return usable data."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/app/leads" className="text-sm text-cyan-300 transition hover:text-cyan-200">
          Back to Leads
        </Link>
      </div>

      <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/75">
              Intelligence Report
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              {lead.title ?? lead.address ?? 'Property lead details'}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {[lead.address, lead.city, lead.postcodeArea].filter(Boolean).join(' / ') || 'Property location not available'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ScorePill score={lead.score} className="px-3 py-1.5 text-base" />
            <GradeBadge grade={lead.grade} className="px-3 py-1.5 text-sm" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-xl font-semibold text-white">Property summary</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Address</p>
                <p className="mt-2 text-sm text-white">{lead.address ?? 'N/A'}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">City</p>
                <p className="mt-2 text-sm text-white">{lead.city ?? 'N/A'}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Postcode area</p>
                <p className="mt-2 text-sm text-white">{lead.postcodeArea ?? 'N/A'}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Property type</p>
                <p className="mt-2 text-sm text-white">{lead.propertyType ?? 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-xl font-semibold text-white">Investment metrics</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Price</p>
                <p className="mt-2 text-sm text-white">{formatCurrency(lead.price)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Bedrooms</p>
                <p className="mt-2 text-sm text-white">{lead.bedrooms ?? 'N/A'}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Yield</p>
                <p className="mt-2 text-sm text-white">{formatYield(lead.yield)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Lead ID</p>
                <p className="mt-2 break-all text-sm text-white">{lead.id ?? lead.listingId ?? 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-xl font-semibold text-white">Score overview</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Score</p>
                <div className="mt-3">
                  <ScorePill score={lead.score} className="px-3 py-1.5 text-base" />
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Grade</p>
                <div className="mt-3">
                  <GradeBadge grade={lead.grade} className="px-3 py-1.5 text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-xl font-semibold text-white">Source information</h3>
            <div className="mt-6 grid gap-4">
              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Source platform</p>
                <p className="mt-2 text-sm text-white">{lead.sourcePlatform ?? 'N/A'}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Listing title</p>
                <p className="mt-2 text-sm text-white">{lead.title ?? 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-xl font-semibold text-white">Score reasons</h3>
            <div className="mt-6">
              <ScoreReasons reasons={lead.reasons} raw={lead.reasonsRaw ?? lead.reasons} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
