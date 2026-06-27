import { useEffect, useRef, useState } from 'react'
import { AxiosError } from 'axios'
import { getActivityLogs } from '../api/activityLogs'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { LoadingState } from '../components/ui/LoadingState'
import { useIsMountedRef } from '../hooks/useIsMountedRef'
import type { ActivityLog } from '../types/activityLog'

const PAGE_SIZE = 50

function formatCreatedAt(value: string | undefined) {
  if (!value) {
    return '-'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}

function formatCell(value: string | undefined) {
  return value ?? '-'
}

function formatMetadata(metadata: ActivityLog['metadata']) {
  if (metadata == null) {
    return '-'
  }

  if (Array.isArray(metadata)) {
    return metadata.length > 0 ? JSON.stringify(metadata) : '-'
  }

  if (typeof metadata === 'object') {
    return Object.keys(metadata as Record<string, unknown>).length > 0
      ? JSON.stringify(metadata)
      : '-'
  }

  return JSON.stringify(metadata)
}

function hasVisibleContent(log: ActivityLog) {
  return Boolean(
    log.createdAt ||
      log.actorUserId ||
      log.action ||
      log.entityType ||
      log.entityId ||
      log.ipAddress ||
      log.userAgent,
  )
}

function getRowKey(log: ActivityLog, index: number, pageOffset: number) {
  return (
    log.id ??
    [
      log.createdAt,
      log.actorUserId,
      log.action,
      log.entityType,
      log.entityId,
      pageOffset,
      index,
    ]
      .filter(Boolean)
      .join('-')
  )
}

export function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const lastFetchKeyRef = useRef<string | null>(null)
  const isMountedRef = useIsMountedRef()

  useEffect(() => {
    const fetchKey = `${PAGE_SIZE}:${offset}`
    if (lastFetchKeyRef.current === fetchKey) {
      return
    }

    lastFetchKeyRef.current = fetchKey

    setLoading(true)
    setError(null)

    getActivityLogs(PAGE_SIZE, offset)
      .then((data) => {
        if (isMountedRef.current) {
          setLogs(data.logs)
          setHasMore(data.hasMore)
        }
      })
      .catch((err) => {
        if (!isMountedRef.current) {
          return
        }

        const message =
          err instanceof AxiosError && err.response?.status === 403
            ? 'You do not have permission to view activity logs.'
            : 'Unable to load activity logs right now.'

        setError(message)
        setLogs([])
        setHasMore(false)
      })
      .finally(() => {
        if (isMountedRef.current) {
          setLoading(false)
        }
      })
  }, [offset, isMountedRef])

  return (
    <div className="min-w-0 space-y-5">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-slate-900">Activity logs</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Immutable backend audit events across users, entities, and request context.
        </p>
      </div>

      {loading ? <LoadingState label="Loading activity logs..." rows={5} /> : null}
      {!loading && error ? <ErrorState message={error} /> : null}
      {!loading && !error && logs.length === 0 ? (
        <EmptyState
          title="No activity logs found"
          description="No audit events were returned for this page of results."
        />
      ) : null}

      {!loading && !error && logs.length > 0 ? (
        <section className="rounded-md border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full border-collapse text-left text-sm">
              <colgroup>
                <col className="w-[11%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
                <col className="w-[11%]" />
                <col className="w-[10%]" />
                <col className="w-[11%]" />
                <col className="w-[17%]" />
                <col className="w-[18%]" />
              </colgroup>
              <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Created At</th>
                  <th className="px-4 py-2.5 font-medium">Actor User ID</th>
                  <th className="px-4 py-2.5 font-medium">Action</th>
                  <th className="px-4 py-2.5 font-medium">Entity Type</th>
                  <th className="px-4 py-2.5 font-medium">Entity ID</th>
                  <th className="px-4 py-2.5 font-medium">IP Address</th>
                  <th className="px-4 py-2.5 font-medium">User Agent</th>
                  <th className="px-4 py-2.5 font-medium">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log, index) => (
                  <tr key={getRowKey(log, index, offset)} className="align-top text-slate-600">
                    <td className="px-4 py-3 whitespace-nowrap">{formatCreatedAt(log.createdAt)}</td>
                    <td className="px-4 py-3 break-words">{formatCell(log.actorUserId)}</td>
                    <td className="px-4 py-3 break-words">{formatCell(log.action)}</td>
                    <td className="px-4 py-3 break-words">{formatCell(log.entityType)}</td>
                    <td className="px-4 py-3 break-words">{formatCell(log.entityId)}</td>
                    <td className="px-4 py-3 break-words">{formatCell(log.ipAddress)}</td>
                    <td className="px-4 py-3 text-slate-500">
                      <div className="max-w-[18rem] break-words text-sm leading-6">{formatCell(log.userAgent)}</div>
                    </td>
                    <td className="px-4 py-3">
                      {!hasVisibleContent(log) ? (
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-700">
                          Unmapped record shape
                        </p>
                      ) : null}
                      <pre className="max-w-[20rem] whitespace-pre-wrap break-words rounded-sm border border-slate-200 bg-slate-50 p-2.5 text-xs leading-6 text-slate-600">
                        {formatMetadata(log.metadata)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing {offset + 1} to {offset + logs.length} with a page size of {PAGE_SIZE}.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOffset((current) => Math.max(0, current - PAGE_SIZE))}
                disabled={offset === 0}
                className="rounded-sm border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setOffset((current) => current + PAGE_SIZE)}
                disabled={!hasMore}
                className="rounded-sm bg-blue-700 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
