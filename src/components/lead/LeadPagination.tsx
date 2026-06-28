import type { LeadsPagination } from '../../types/lead'

interface LeadPaginationProps {
  pagination: LeadsPagination
  limit: number
  loading: boolean
  onPrevious: () => void
  onNext: () => void
  onLimitChange: (limit: number) => void
}

const ROWS_PER_PAGE_OPTIONS = [20, 50, 100]

export function LeadPagination({ pagination, limit, loading, onPrevious, onNext, onLimitChange }: LeadPaginationProps) {
  const { offset, total, returned, hasNext, hasPrevious } = pagination

  const rangeStart = total > 0 ? offset + 1 : 0
  const rangeEnd = offset + returned
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const currentPage = Math.floor(offset / limit) + 1

  const previousDisabled = loading || offset === 0 || !hasPrevious
  const nextDisabled = loading || !hasNext

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-slate-600">
        {total > 0 ? (
          <>
            Showing {rangeStart.toLocaleString()} to {rangeEnd.toLocaleString()} of {total.toLocaleString()} records
            <span className="ml-2 text-xs text-slate-400">
              Page {currentPage.toLocaleString()} of {totalPages.toLocaleString()}
            </span>
          </>
        ) : (
          'No records to show'
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
          Rows per page
          <select
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            disabled={loading}
            className="rounded-sm border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {ROWS_PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrevious}
            disabled={previousDisabled}
            className="rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
