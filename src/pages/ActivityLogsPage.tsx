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
    <div className="min-w-0 space-y-6">
      <section className="min-w-0 rounded-2xl border border-white/10 bg-slate-900/70 p-4 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/75">
          Audit Trail
        </p>
        <h2 className="mt-3 break-words text-3xl font-semibold tracking-tight text-white">
          Activity logs
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Review immutable backend audit events across users, entities, and request context.
        </p>
      </section>

      {loading ? <LoadingState label="Loading activity logs..." rows={5} /> : null}
      {!loading && error ? <ErrorState message={error} /> : null}
      {!loading && !error && logs.length === 0 ? (
        <EmptyState
          title="No activity logs found"
          description="No audit events were returned for this page of results."
        />
      ) : null}

      {!loading && !error && logs.length > 0 ? (
        <section className="rounded-2xl border border-white/10 bg-slate-900/70">
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
              <thead className="bg-slate-950/80 text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Created At</th>
                  <th className="px-4 py-3 font-medium">Actor User ID</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Entity Type</th>
                  <th className="px-4 py-3 font-medium">Entity ID</th>
                  <th className="px-4 py-3 font-medium">IP Address</th>
                  <th className="px-4 py-3 font-medium">User Agent</th>
                  <th className="px-4 py-3 font-medium">Metadata</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr
                    key={getRowKey(log, index, offset)}
                    className="border-t border-white/8 align-top text-slate-200"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">{formatCreatedAt(log.createdAt)}</td>
                    <td className="px-4 py-4 break-words">{formatCell(log.actorUserId)}</td>
                    <td className="px-4 py-4 break-words">{formatCell(log.action)}</td>
                    <td className="px-4 py-4 break-words">{formatCell(log.entityType)}</td>
                    <td className="px-4 py-4 break-words">{formatCell(log.entityId)}</td>
                    <td className="px-4 py-4 break-words">{formatCell(log.ipAddress)}</td>
                    <td className="px-4 py-4 text-slate-300">
                      <div className="max-w-[18rem] break-words text-sm leading-6">
                        {formatCell(log.userAgent)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {!hasVisibleContent(log) ? (
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300/80">
                          Unmapped record shape
                        </p>
                      ) : null}
                      <pre className="max-w-[20rem] whitespace-pre-wrap break-words rounded-xl border border-white/8 bg-slate-950/70 p-3 text-xs leading-6 text-cyan-100">
                        {formatMetadata(log.metadata)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              Showing {offset + 1} to {offset + logs.length} with a page size of {PAGE_SIZE}.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOffset((current) => Math.max(0, current - PAGE_SIZE))}
                disabled={offset === 0}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setOffset((current) => current + PAGE_SIZE)}
                disabled={!hasMore}
                className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-400/40 hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50"
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
