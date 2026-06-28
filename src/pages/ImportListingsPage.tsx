import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import {
  cancelImportJob,
  getImportJob,
  getImportJobs,
  importCleanListings,
  type ImportJob,
} from '../api/imports'
import { useIsMountedRef } from '../hooks/useIsMountedRef'

const ACTIVE_JOB_STORAGE_KEY = 'estatelink:active-import-job-id'
const JOB_LIST_POLL_MS = 4000
const ACTIVE_JOB_POLL_MS = 1500

const MAX_IMPORT_ROWS = Number(import.meta.env.VITE_MAX_IMPORT_ROWS) || 5000

const GENERIC_IMPORT_TOO_LARGE_MESSAGE =
  'This import is too large for the server to accept. Please split the file into smaller batches.'

function extractBackendErrorMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null

  const status = error.response?.status
  if (status !== 400 && status !== 413) return null

  const data = error.response?.data
  const record = data && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, unknown>) : undefined
  const message = record?.message ?? record?.error ?? record?.detail

  return typeof message === 'string' && message.trim() ? message : GENERIC_IMPORT_TOO_LARGE_MESSAGE
}

function parseListingsFile(text: string): unknown[] {
  const trimmed = text.trim()

  if (!trimmed) {
    return []
  }

  if (trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed)
    return Array.isArray(parsed) ? parsed : []
  }

  return trimmed
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line))
}

function buildFailedImportSummary(failed: number, errorMessage?: string) {
  const rowsPart = failed > 0 ? `${failed.toLocaleString()} row${failed === 1 ? '' : 's'} failed.` : null
  const reasonPart = errorMessage ?? 'All listings failed to import.'
  return [rowsPart, reasonPart].filter(Boolean).join(' ')
}

function formatDateTime(value?: string) {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(parsed)
}

const stageStyles: Record<string, string> = {
  queued: 'border-slate-300 bg-slate-50 text-slate-600',
  processing: 'border-blue-300 bg-blue-50 text-blue-800',
  completed: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  failed: 'border-red-300 bg-red-50 text-red-800',
  cancelled: 'border-slate-300 bg-slate-100 text-slate-500',
}

const CANCELLABLE_STATUSES = new Set(['queued', 'processing'])

// Any status other than a terminal one counts as "active" for polling purposes, so
// backend status names like pending/running/cancelling keep updates live without
// the frontend needing to hardcode every in-progress status string.
const TERMINAL_JOB_STATUSES = new Set(['completed', 'failed', 'cancelled'])

function hasActiveJob(jobsList: ImportJob[]) {
  return jobsList.some((listJob) => !TERMINAL_JOB_STATUSES.has(listJob.status))
}

function StageBadge({ status }: { status: string }) {
  const tone = stageStyles[status] ?? 'border-slate-300 bg-slate-50 text-slate-600'
  return (
    <span className={['inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold capitalize', tone].join(' ')}>
      {status}
    </span>
  )
}

export function ImportListingsPage() {
  const [fileName, setFileName] = useState('')
  const [pendingListings, setPendingListings] = useState<unknown[] | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState('')
  const [activeJobId, setActiveJobId] = useState<string | null>(() =>
    typeof window !== 'undefined' ? window.localStorage.getItem(ACTIVE_JOB_STORAGE_KEY) : null,
  )
  const [job, setJob] = useState<ImportJob | null>(null)
  const [jobs, setJobs] = useState<ImportJob[]>([])
  const [jobsError, setJobsError] = useState('')
  const [cancellingJobIds, setCancellingJobIds] = useState<Set<string>>(new Set())
  const [isRefreshingJobs, setIsRefreshingJobs] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const activeJobIdRef = useRef<string | null>(null)
  const jobsPollTimeoutRef = useRef<number | undefined>(undefined)
  const jobsHaveActiveRef = useRef(true)
  const isMountedRef = useIsMountedRef()

  function resetFileInput() {
    setFileName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setError('')
    setPendingListings(null)

    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)

    try {
      const text = await file.text()
      const parsed = parseListingsFile(text)

      if (!Array.isArray(parsed) || parsed.length === 0) {
        setError('The uploaded file must contain at least one listing.')
        return
      }

      if (parsed.length > MAX_IMPORT_ROWS) {
        setError(
          `This import contains ${parsed.length.toLocaleString()} listings. The maximum per upload is ` +
            `${MAX_IMPORT_ROWS.toLocaleString()}. Please split the file into smaller batches.`,
        )
        return
      }

      setPendingListings(parsed)
    } catch {
      setError('Could not read file. Please check the JSON/NDJSON format.')
    }
  }

  function cancelPendingImport() {
    setPendingListings(null)
    resetFileInput()
  }

  async function confirmImport() {
    if (!pendingListings || isImporting) return

    setIsImporting(true)
    setError('')

    try {
      const result = await importCleanListings(pendingListings)

      if (!result.jobId) {
        setError('Import started but no job ID was returned.')
        return
      }

      setPendingListings(null)
      setJob(null)
      setActiveJobId(result.jobId)
      window.localStorage.setItem(ACTIVE_JOB_STORAGE_KEY, result.jobId)
      refreshJobsList()
    } catch (err) {
      setError(extractBackendErrorMessage(err) ?? 'Could not start import. Please check the JSON/NDJSON format.')
    } finally {
      setIsImporting(false)
    }
  }

  async function handleCancelJob(jobId: string) {
    setCancellingJobIds((current) => new Set(current).add(jobId))

    try {
      const cancelledJob = await cancelImportJob(jobId)

      if (!isMountedRef.current) return

      if (jobId === activeJobIdRef.current) {
        setJob(cancelledJob)
        window.localStorage.removeItem(ACTIVE_JOB_STORAGE_KEY)
      }

      refreshJobsList()
    } catch {
      if (isMountedRef.current) {
        setError('Could not cancel this import job. It may have already finished.')
      }
    } finally {
      if (isMountedRef.current) {
        setCancellingJobIds((current) => {
          const next = new Set(current)
          next.delete(jobId)
          return next
        })
      }
    }
  }

  function clearJobsPollTimeout() {
    if (jobsPollTimeoutRef.current !== undefined) {
      window.clearTimeout(jobsPollTimeoutRef.current)
      jobsPollTimeoutRef.current = undefined
    }
  }

  // Self-scheduling refresh: fetches the list once, then only reschedules itself if an
  // active job remains, so polling stops automatically once every job has finished.
  // Always clearing the pending timeout first means any caller (mount, manual refresh,
  // confirmImport, cancel) resets the same single timer instead of stacking duplicates.
  async function refreshJobsList() {
    try {
      const data = await getImportJobs(20)

      if (!isMountedRef.current) return

      setJobs(data)
      setJobsError('')
      jobsHaveActiveRef.current = hasActiveJob(data)
    } catch {
      if (isMountedRef.current) {
        setJobsError('Unable to load recent import jobs right now.')
      }
      // Leave jobsHaveActiveRef as-is: a transient fetch error shouldn't stop live
      // updates for a job we already know is active.
    }

    clearJobsPollTimeout()
    if (isMountedRef.current && jobsHaveActiveRef.current) {
      jobsPollTimeoutRef.current = window.setTimeout(refreshJobsList, JOB_LIST_POLL_MS)
    }
  }

  async function handleManualJobsRefresh() {
    if (isRefreshingJobs) return

    setIsRefreshingJobs(true)
    try {
      await refreshJobsList()
    } finally {
      if (isMountedRef.current) {
        setIsRefreshingJobs(false)
      }
    }
  }

  // Poll the active job (started here or resumed from a previous visit) until it finishes.
  useEffect(() => {
    if (!activeJobId) return
    const jobId = activeJobId

    activeJobIdRef.current = jobId
    let timeoutId: number | undefined

    async function pollJob() {
      try {
        const latestJob = await getImportJob(jobId)

        if (!isMountedRef.current || activeJobIdRef.current !== jobId) {
          return
        }

        setJob(latestJob)

        if (latestJob.status === 'completed' || latestJob.status === 'failed') {
          window.localStorage.removeItem(ACTIVE_JOB_STORAGE_KEY)
          refreshJobsList()
          return
        }

        timeoutId = window.setTimeout(pollJob, ACTIVE_JOB_POLL_MS)
      } catch {
        if (isMountedRef.current && activeJobIdRef.current === jobId) {
          setError('Could not fetch import job status. It may still be running in the background.')
          window.localStorage.removeItem(ACTIVE_JOB_STORAGE_KEY)
        }
      }
    }

    pollJob()

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeJobId, isMountedRef])

  // Recent jobs list: shows every import's current processing stage, independent of this tab's
  // session. Polls only while this page is mounted and only while a job is still in progress.
  useEffect(() => {
    refreshJobsList()
    return () => {
      clearJobsPollTimeout()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const total = job?.totalCount ?? pendingListings?.length ?? 0
  const processed = job?.processedCount ?? 0
  const failed = job?.failedCount ?? 0
  const status = job?.status ?? (activeJobId ? 'queued' : '')
  const progress = total > 0 ? Math.round(((processed + failed) / total) * 100) : 0

  return (
    <div className="min-w-0 space-y-5">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-slate-900">Import listings</h2>
        <p className="mt-0.5 max-w-2xl text-sm text-slate-500">
          Upload a clean JSON or NDJSON file from your scraper. EstateLink will store the raw payload, normalise
          each listing, score the opportunity, and make it available in the lead dashboard.
        </p>
        <p className="mt-1.5 text-sm font-medium text-slate-700">
          Maximum import size: {MAX_IMPORT_ROWS.toLocaleString()} listings per upload.
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          Large files should be split into batches. Automatic chunked upload can be added later.
        </p>
      </div>

      <div className="min-w-0 rounded-md border border-slate-200 bg-white p-4 sm:p-5">
        <label
          htmlFor="listing-json"
          className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-blue-400"
        >
          <span className="text-sm font-semibold text-slate-900">Upload clean listing file</span>
          <span className="mt-1 text-sm text-slate-500">
            Select a .json or .ndjson file containing scraped listings.
          </span>

          <input
            ref={fileInputRef}
            id="listing-json"
            type="file"
            accept="application/json,.json,.ndjson"
            className="hidden"
            onChange={handleFileChange}
            disabled={isImporting || Boolean(pendingListings)}
          />
        </label>

        {fileName && (
          <p className="mt-3 text-sm text-slate-500">
            Selected file: <span className="break-all font-medium text-slate-900">{fileName}</span>
          </p>
        )}

        {error && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        {pendingListings && (
          <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Confirm import</h3>
            <p className="mt-1 text-sm text-slate-600">
              Ready to import <span className="font-semibold">{pendingListings.length}</span> listing
              {pendingListings.length === 1 ? '' : 's'} from <span className="font-medium">{fileName}</span>.
              This will write raw listings to the database and score each one.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={confirmImport}
                disabled={isImporting}
                className="rounded-sm bg-blue-700 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isImporting ? 'Starting import...' : 'Start import'}
              </button>
              <button
                type="button"
                onClick={cancelPendingImport}
                disabled={isImporting}
                className="rounded-sm border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {activeJobId && (
          <div className="mt-5 min-w-0 rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">Import job</h3>
                  {status ? <StageBadge status={status} /> : null}
                </div>
                <p className="mt-0.5 break-all text-xs text-slate-500">Job ID: {activeJobId}</p>
              </div>

              {status === 'completed' && (
                <Link
                  to="/app/leads"
                  className="rounded-sm border border-blue-200 bg-white px-3.5 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
                >
                  View leads
                </Link>
              )}

              {CANCELLABLE_STATUSES.has(status) && (
                <button
                  type="button"
                  onClick={() => handleCancelJob(activeJobId)}
                  disabled={cancellingJobIds.has(activeJobId)}
                  className="rounded-sm border border-red-200 bg-white px-3.5 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cancellingJobIds.has(activeJobId) ? 'Cancelling...' : 'Cancel import'}
                </button>
              )}
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-sm bg-slate-200">
              <div className="h-full bg-blue-700 transition-all" style={{ width: `${progress}%` }} />
            </div>

            <p className="mt-1.5 text-xs text-slate-500">
              {progress}% complete · runs in the background, so it keeps going even if you leave this page.
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Total</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{total}</p>
              </div>

              <div className="rounded-md border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Processed</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{processed}</p>
              </div>

              <div className="rounded-md border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Failed</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{failed}</p>
              </div>
            </div>

            {status === 'failed' && (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <p className="font-semibold">Import failed</p>
                <p className="mt-1">{buildFailedImportSummary(failed, job?.errorMessage)}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="min-w-0 rounded-md border border-slate-200 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">Recent import jobs</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Every import runs as a background job on the server, so this list stays accurate even if you switch
              pages or close this tab.
            </p>
          </div>
          <button
            type="button"
            onClick={handleManualJobsRefresh}
            disabled={isRefreshingJobs}
            className="rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshingJobs ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {jobsError ? (
          <div className="p-4">
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{jobsError}</div>
          </div>
        ) : jobs.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-400">No import jobs yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {jobs.map((listJob) => (
              <li key={listJob.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="break-all text-xs text-slate-400">Job {listJob.id}</p>
                  <p className="mt-0.5 text-slate-600">
                    {listJob.processedCount}/{listJob.totalCount} processed
                    {listJob.failedCount > 0 ? `, ${listJob.failedCount} failed` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{formatDateTime(listJob.createdAt)}</span>
                  <StageBadge status={listJob.status} />
                  {CANCELLABLE_STATUSES.has(listJob.status) && (
                    <button
                      type="button"
                      onClick={() => handleCancelJob(listJob.id)}
                      disabled={cancellingJobIds.has(listJob.id)}
                      className="rounded-sm border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {cancellingJobIds.has(listJob.id) ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
