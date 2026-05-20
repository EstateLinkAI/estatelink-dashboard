import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getLeads } from '../api/leads'
import { GradeBadge } from '../components/lead/GradeBadge'
import { LeadCard } from '../components/lead/LeadCard'
import { ScorePill } from '../components/lead/ScorePill'
import { ErrorState } from '../components/ui/ErrorState'
import { LoadingState } from '../components/ui/LoadingState'
import { StatCard } from '../components/ui/StatCard'
import type { Lead } from '../types/lead'

function formatYield(value?: number) {
  return value != null ? `${value.toFixed(1)}%` : 'N/A'
}

export function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getLeads()
      .then((data) => {
        if (active) {
          setLeads(data)
          setUpdatedAt(new Date().toLocaleString('en-GB'))
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load dashboard metrics right now.')
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
  }, [])

  if (loading) {
    return <LoadingState label="Loading dashboard metrics..." rows={4} />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  const scores = leads.map((lead) => lead.score).filter((score): score is number => score != null)
  const total = leads.length
  const aGrade = leads.filter((lead) => lead.grade?.toUpperCase() === 'A').length
  const average = scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
  const highest = scores.length ? Math.max(...scores) : 0
  const recentHighValue = [...leads]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .filter(
      (lead, index, items) =>
        items.findIndex((candidate) => {
          const candidateKey = candidate.id ?? candidate.listingId ?? candidate.address ?? candidate.title
          const leadKey = lead.id ?? lead.listingId ?? lead.address ?? lead.title
          return candidateKey === leadKey
        }) === index,
    )
    .slice(0, 5)

  return (
    <div className="min-w-0 space-y-6">
      <section className="min-w-0 rounded-2xl border border-white/10 bg-slate-900/70 p-4 sm:p-6">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/75">
              Overview
            </p>
            <h2 className="mt-3 break-words text-3xl font-semibold tracking-tight text-white">
              Property intelligence dashboard
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Track lead quality, identify standout opportunities, and move from screening to detail review quickly.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-400">
            Last updated
            <p className="mt-1 font-medium text-white">{updatedAt ?? 'Unavailable'}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total visible leads" value={String(total)} helper="Current result set" />
        <StatCard
          label="A-grade leads"
          value={String(aGrade)}
          helper="Top quality opportunities"
          accent="emerald"
        />
        <StatCard
          label="Average score"
          value={average.toFixed(1)}
          helper="Portfolio-wide quality signal"
          accent="cyan"
        />
        <StatCard
          label="Highest score"
          value={highest.toFixed(1)}
          helper="Best current lead score"
          accent="amber"
        />
      </section>

      <section className="min-w-0 rounded-2xl border border-white/10 bg-slate-900/70 p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h3 className="break-words text-xl font-semibold text-white">Recent high-value leads</h3>
            <p className="mt-2 text-sm text-slate-400">
              High-scoring opportunities surfaced from the latest available lead set.
            </p>
          </div>
          <Link
            to="/app/leads"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10"
          >
            View all leads
          </Link>
        </div>

        <div className="mt-6 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            {recentHighValue.map((lead) => (
              <LeadCard key={lead.id ?? lead.listingId ?? lead.title} lead={lead} />
            ))}
          </div>

          <aside className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/55 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/75">
              Best Current Lead
            </p>
            {recentHighValue[0] ? (
              <div className="mt-4">
                <h4 className="break-words text-xl font-semibold text-white">
                  {recentHighValue[0].address ?? recentHighValue[0].title ?? 'Untitled property lead'}
                </h4>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {[recentHighValue[0].city, recentHighValue[0].postcodeArea, recentHighValue[0].propertyType]
                    .filter(Boolean)
                    .join(' / ') || 'Location and property metadata pending'}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <ScorePill score={recentHighValue[0].score} />
                  <GradeBadge grade={recentHighValue[0].grade} />
                  <span className="text-sm text-slate-400">
                    Yield {formatYield(recentHighValue[0].yield)}
                  </span>
                </div>
                <div className="mt-5 rounded-xl border border-white/10 bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Why it stands out</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Strong score profile with a {recentHighValue[0].grade ?? 'non-graded'} ranking and the highest observed lead quality in the current result set.
                  </p>
                </div>
                <Link
                  to={`/app/leads/${recentHighValue[0].id ?? recentHighValue[0].listingId ?? ''}`}
                  className="mt-5 inline-flex text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                >
                  View details
                </Link>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </div>
  )
}
