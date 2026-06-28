import { useEffect, useRef, useState } from 'react'
import { getLeads } from '../api/leads'
import {
  createLeadFilters,
  initialLeadFilterForm,
  LeadFilters,
  type LeadFilterFormState,
} from '../components/lead/LeadFilters'
import { LeadPagination } from '../components/lead/LeadPagination'
import { LeadTable } from '../components/lead/LeadTable'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { LoadingState } from '../components/ui/LoadingState'
import { useIsMountedRef } from '../hooks/useIsMountedRef'
import type { Lead, LeadsFilters, LeadsPagination as LeadsPaginationData } from '../types/lead'

const DEFAULT_LIMIT = 20

export function LeadsPage() {
  const [form, setForm] = useState<LeadFilterFormState>(initialLeadFilterForm)
  const [appliedFilters, setAppliedFilters] = useState<LeadsFilters>({})
  const [limit, setLimit] = useState(DEFAULT_LIMIT)
  const [offset, setOffset] = useState(0)
  const [leads, setLeads] = useState<Lead[]>([])
  const [pagination, setPagination] = useState<LeadsPaginationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastFetchKeyRef = useRef<string | null>(null)
  const isMountedRef = useIsMountedRef()

  useEffect(() => {
    const requestFilters: LeadsFilters = { ...appliedFilters, limit, offset }
    const fetchKey = JSON.stringify(requestFilters)
    if (lastFetchKeyRef.current === fetchKey) {
      return
    }

    lastFetchKeyRef.current = fetchKey

    setLoading(true)
    setError(null)

    getLeads(requestFilters)
      .then((result) => {
        if (isMountedRef.current) {
          setLeads(result.leads)
          setPagination(result.pagination)
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
  }, [appliedFilters, limit, offset, isMountedRef])

  const applyFilters = () => {
    setAppliedFilters(createLeadFilters(form))
    setOffset(0)
  }

  const resetFilters = () => {
    setForm(initialLeadFilterForm)
    setAppliedFilters({})
    setOffset(0)
  }

  const handlePrevious = () => {
    setOffset((current) => Math.max(0, current - limit))
  }

  const handleNext = () => {
    setOffset((current) => current + limit)
  }

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit)
    setOffset(0)
  }

  const hasLeads = leads.length > 0
  const showInitialLoading = loading && !hasLeads && !error
  const showInitialError = Boolean(error) && !hasLeads

  return (
    <div className="min-w-0 space-y-5">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-slate-900">Property opportunity screening</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Filter by geography, asset type, source, and minimum score to find due diligence priorities.
        </p>
      </div>

      <LeadFilters form={form} onChange={setForm} onApply={applyFilters} onReset={resetFilters} />

      {showInitialLoading ? <LoadingState label="Loading leads..." rows={5} /> : null}
      {showInitialError ? <ErrorState message={error ?? 'Unable to load leads.'} /> : null}

      {!showInitialLoading && !showInitialError ? (
        <>
          {error ? <ErrorState message={error} /> : null}
          {!loading && !hasLeads && !error ? (
            <EmptyState
              title="No leads found"
              description="Try broadening the filters or resetting them to view more opportunities."
            />
          ) : null}
          {hasLeads ? (
            <>
              <LeadTable leads={leads} loading={loading} />
              {pagination ? (
                <LeadPagination
                  pagination={pagination}
                  limit={limit}
                  loading={loading}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onLimitChange={handleLimitChange}
                />
              ) : null}
            </>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
