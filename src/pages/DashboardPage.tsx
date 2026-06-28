import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getActivityLogs } from '../api/activityLogs'
import { getLeads } from '../api/leads'
import { useAuth } from '../auth/AuthContext'
import { isAdminRole } from '../auth/roles'
import { LeadCard } from '../components/lead/LeadCard'
import { ScorePill } from '../components/lead/ScorePill'
import { ErrorState } from '../components/ui/ErrorState'
import { LoadingState } from '../components/ui/LoadingState'
import { StatCard } from '../components/ui/StatCard'
import { useIsMountedRef } from '../hooks/useIsMountedRef'
import { STRATEGY_LABELS, type Lead } from '../types/lead'
import type { ActivityLog } from '../types/activityLog'

const HIGH_SCORE_THRESHOLD = 80

function bestCandidateForStrategy(leads: Lead[], strategy: 'hmo' | 'brrrr') {
  let best: { lead: Lead; score: number } | null = null

  for (const lead of leads) {
    for (const strategyScore of lead.strategyScores) {
      if (strategyScore.strategy?.trim().toLowerCase() !== strategy || strategyScore.score == null) {
        continue
      }

      if (!best || strategyScore.score > best.score) {
        best = { lead, score: strategyScore.score }
      }
    }
  }

  return best
}

export function DashboardPage() {
  const { user } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([])
  const hasFetched = useRef(false)
  const isMountedRef = useIsMountedRef()

  useEffect(() => {
    if (hasFetched.current) {
      return
    }

    hasFetched.current = true

    setLoading(true)
    setError(null)

    getLeads()
      .then((result) => {
        if (isMountedRef.current) {
          setLeads(result.leads)
          setUpdatedAt(new Date().toLocaleString('en-GB'))
        }
      })
      .catch(() => {
        if (isMountedRef.current) {
          setError('Unable to load dashboard metrics right now.')
        }
      })
      .finally(() => {
        if (isMountedRef.current) {
          setLoading(false)
        }
      })
  }, [isMountedRef])

  useEffect(() => {
    if (!isAdminRole(user?.role)) {
      return
    }

    getActivityLogs(5, 0)
      .then((data) => {
        if (isMountedRef.current) {
          setRecentActivity(data.logs)
        }
      })
      .catch(() => {
        if (isMountedRef.current) {
          setRecentActivity([])
        }
      })
  }, [isMountedRef, user?.role])

  if (loading) {
    return <LoadingState label="Loading dashboard metrics..." rows={4} />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  const scores = leads.map((lead) => lead.score).filter((score): score is number => score != null)
  const total = leads.length
  const aGrade = leads.filter((lead) => lead.grade?.toUpperCase() === 'A').length
  const highScoring = leads.filter((lead) => (lead.score ?? 0) >= HIGH_SCORE_THRESHOLD).length
  const average = scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
  const bestHmo = bestCandidateForStrategy(leads, 'hmo')
  const bestBrrrr = bestCandidateForStrategy(leads, 'brrrr')
  const topOpportunities = [...leads]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .filter(
      (lead, index, items) =>
        items.findIndex((candidate) => {
          const candidateKey = candidate.id ?? candidate.listingId ?? candidate.address ?? candidate.title
          const leadKey = lead.id ?? lead.listingId ?? lead.address ?? lead.title
          return candidateKey === leadKey
        }) === index,
    )
    .slice(0, 6)

  return (
    <div className="min-w-0 space-y-5">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-900">Ranked property opportunities</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Lead quality, strategy fit, and due diligence priorities across the current result set.
          </p>
        </div>
        <p className="shrink-0 text-xs text-slate-400">Last updated {updatedAt ?? 'unavailable'}</p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total leads" value={String(total)} helper="Current result set" />
        <StatCard label="A-grade leads" value={String(aGrade)} helper="Top quality opportunities" accent="success" />
        <StatCard
          label="High scoring opportunities"
          value={String(highScoring)}
          helper={`Score ≥ ${HIGH_SCORE_THRESHOLD}`}
          accent="accent"
        />
        <StatCard label="Average score" value={average.toFixed(1)} helper="Portfolio-wide quality signal" accent="warning" />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="min-w-0 rounded-md border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
            Best {STRATEGY_LABELS.hmo} candidate
          </p>
          {bestHmo ? (
            <div className="mt-3">
              <p className="truncate text-sm font-semibold text-slate-900">
                {bestHmo.lead.address ?? bestHmo.lead.title ?? 'Untitled property lead'}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <ScorePill score={bestHmo.score} />
                <Link
                  to={`/app/leads/${bestHmo.lead.id ?? bestHmo.lead.listingId ?? ''}`}
                  className="text-sm font-medium text-blue-700 transition hover:text-blue-800"
                >
                  View details
                </Link>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No HMO candidates identified yet.</p>
          )}
        </div>

        <div className="min-w-0 rounded-md border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
            Best {STRATEGY_LABELS.brrrr} candidate
          </p>
          {bestBrrrr ? (
            <div className="mt-3">
              <p className="truncate text-sm font-semibold text-slate-900">
                {bestBrrrr.lead.address ?? bestBrrrr.lead.title ?? 'Untitled property lead'}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <ScorePill score={bestBrrrr.score} />
                <Link
                  to={`/app/leads/${bestBrrrr.lead.id ?? bestBrrrr.lead.listingId ?? ''}`}
                  className="text-sm font-medium text-blue-700 transition hover:text-blue-800"
                >
                  View details
                </Link>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No BRRRR candidates identified yet.</p>
          )}
        </div>
      </section>

      {isAdminRole(user?.role) ? (
        <section className="min-w-0 rounded-md border border-slate-200 bg-white">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Recent activity</h3>
            <Link to="/app/activity-logs" className="text-sm font-medium text-blue-700 transition hover:text-blue-800">
              View all activity
            </Link>
          </div>

          <div className="px-4">
            {recentActivity.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {recentActivity.map((log, index) => (
                  <li key={log.id ?? index} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="text-slate-700">{log.action ?? 'Unknown action'}</span>
                    <span className="text-slate-400">{log.entityType ?? ''}</span>
                    <span className="text-slate-400">{log.createdAt ?? ''}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-3 text-sm text-slate-400">No recent activity available.</p>
            )}
          </div>
        </section>
      ) : null}

      <section className="min-w-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Top property opportunities</h3>
          <Link to="/app/leads" className="text-sm font-medium text-blue-700 transition hover:text-blue-800">
            View all leads
          </Link>
        </div>

        <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {topOpportunities.map((lead) => (
            <LeadCard key={lead.id ?? lead.listingId ?? lead.title} lead={lead} />
          ))}
        </div>
      </section>
    </div>
  )
}
