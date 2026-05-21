import { useEffect, useRef, useState } from 'react'
import { getLeads } from '../api/leads'
import {
  createLeadFilters,
  initialLeadFilterForm,
  LeadFilters,
  type LeadFilterFormState,
} from '../components/lead/LeadFilters'
import { LeadTable } from '../components/lead/LeadTable'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { LoadingState } from '../components/ui/LoadingState'
import { useIsMountedRef } from '../hooks/useIsMountedRef'
import type { Lead, LeadsFilters } from '../types/lead'

export function LeadsPage() {
  const [form, setForm] = useState<LeadFilterFormState>(initialLeadFilterForm)
  const [appliedFilters, setAppliedFilters] = useState<LeadsFilters>({})
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastFetchKeyRef = useRef<string | null>(null)
  const isMountedRef = useIsMountedRef()

  useEffect(() => {
    const fetchKey = JSON.stringify(appliedFilters)
    if (lastFetchKeyRef.current === fetchKey) {
      return
    }

    lastFetchKeyRef.current = fetchKey

    setLoading(true)
    setError(null)

    getLeads(appliedFilters)
      .then((data) => {
        if (isMountedRef.current) {
          setLeads(data)
        }
      })
      .catch(() => {
        if (isMountedRef.current) {
          setError('Unable to load leads with the current filters.')
        }
      })
      .finally(() => {
        if (isMountedRef.current) {
          setLoading(false)
        }
      })
  }, [appliedFilters, isMountedRef])

  const applyFilters = () => {
    setAppliedFilters(createLeadFilters(form))
  }

  const resetFilters = () => {
    setForm(initialLeadFilterForm)
    setAppliedFilters({})
  }

  return (
    <div className="min-w-0 space-y-6">
      <section className="min-w-0 rounded-2xl border border-white/10 bg-slate-900/70 p-4 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/75">
          Lead Pipeline
        </p>
        <h2 className="mt-3 break-words text-3xl font-semibold tracking-tight text-white">
          Property opportunity screening
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Filter by geography, asset type, source, and minimum score to inspect the most relevant opportunities quickly.
        </p>
      </section>

      <LeadFilters form={form} onChange={setForm} onApply={applyFilters} onReset={resetFilters} />

      {loading ? <LoadingState label="Loading leads..." rows={5} /> : null}
      {!loading && error ? <ErrorState message={error} /> : null}
      {!loading && !error && leads.length === 0 ? (
        <EmptyState
          title="No leads found"
          description="Try broadening the filters or resetting them to view more opportunities."
        />
      ) : null}
      {!loading && !error && leads.length > 0 ? <LeadTable leads={leads} /> : null}
    </div>
  )
}
