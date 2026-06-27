import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getLeadById } from '../api/leads'
import { GradeBadge } from '../components/lead/GradeBadge'
import { ScorePill } from '../components/lead/ScorePill'
import { ScoreReasons } from '../components/lead/ScoreReasons'
import { StrategyScoreCard } from '../components/lead/StrategyScoreCard'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { LoadingState } from '../components/ui/LoadingState'
import { useIsMountedRef } from '../hooks/useIsMountedRef'
import { STRATEGY_TYPES, type Lead } from '../types/lead'

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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] uppercase tracking-[0.08em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  )
}

export function LeadDetailPage() {
  const { id } = useParams()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastLeadIdRef = useRef<string | null>(null)
  const isMountedRef = useIsMountedRef()

  useEffect(() => {
    if (!id) {
      setError('Lead ID is missing from the route.')
      setLoading(false)
      return
    }

    if (lastLeadIdRef.current === id) {
      return
    }

    lastLeadIdRef.current = id

    setLoading(true)
    setError(null)

    getLeadById(id)
      .then((data) => {
        if (isMountedRef.current) {
          setLead(data)
        }
      })
      .catch(() => {
        if (isMountedRef.current) {
          setError('Unable to load this lead right now.')
        }
      })
      .finally(() => {
        if (isMountedRef.current) {
          setLoading(false)
        }
      })
  }, [id, isMountedRef])

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
    <div className="min-w-0 space-y-5">
      <Link to="/app/leads" className="text-sm text-blue-700 transition hover:text-blue-800">
        ← Back to leads
      </Link>

      <section className="min-w-0 rounded-md border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">Deal memo</p>
            <h2 className="mt-1 truncate text-xl font-semibold text-slate-900">
              {lead.title ?? lead.address ?? 'Property lead details'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {[lead.address, lead.city, lead.postcodeArea].filter(Boolean).join(' / ') || 'Property location not available'}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ScorePill score={lead.score} />
            <GradeBadge grade={lead.grade} />
          </div>
        </div>
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="min-w-0 space-y-4">
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">Property summary</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Field label="Address" value={lead.address ?? 'N/A'} />
              <Field label="City" value={lead.city ?? 'N/A'} />
              <Field label="Postcode area" value={lead.postcodeArea ?? 'N/A'} />
              <Field label="Property type" value={lead.propertyType ?? 'N/A'} />
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">Listing details</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Field label="Price" value={formatCurrency(lead.price)} />
              <Field label="Rental estimate" value={formatCurrency(lead.rentalEstimate)} />
              <Field label="Bedrooms" value={lead.bedrooms != null ? String(lead.bedrooms) : 'N/A'} />
              <Field label="Yield signal" value={formatYield(lead.yield)} />
              <Field
                label="Days on market"
                value={lead.daysOnMarket != null ? `${lead.daysOnMarket} days` : 'N/A'}
              />
              <Field label="Lead ID" value={lead.id ?? lead.listingId ?? 'N/A'} />
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">Source information</h3>
            <div className="mt-3 grid gap-2">
              <Field label="Source platform" value={lead.sourcePlatform ?? 'N/A'} />
              <Field label="Listing title" value={lead.title ?? 'N/A'} />
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">Score reasons</h3>
            <p className="mt-1 text-xs text-slate-500">Why this lead was scored the way it was.</p>
            <div className="mt-3">
              <ScoreReasons reasons={lead.reasons} raw={lead.reasonsRaw ?? lead.reasons} />
            </div>
          </div>
        </div>
      </section>

      <section className="min-w-0 rounded-md border border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-slate-900">Strategy fit</h3>
        <p className="mt-1 text-sm text-slate-500">
          Investment strategy breakdown for this listing across acquisition models.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {STRATEGY_TYPES.map((strategy) => (
            <StrategyScoreCard
              key={strategy}
              strategy={strategy}
              score={lead.strategyScores.find((item) => item.strategy?.trim().toLowerCase() === strategy)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
