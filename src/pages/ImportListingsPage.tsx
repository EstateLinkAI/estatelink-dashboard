import { useEffect, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  getImportJob,
  importCleanListings,
  type ImportJob,
  type StartImportResult,
} from '../api/imports'

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

export function ImportListingsPage() {
  const [fileName, setFileName] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState('')
  const [startResult, setStartResult] = useState<StartImportResult | null>(null)
  const [job, setJob] = useState<ImportJob | null>(null)

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setError('')
    setStartResult(null)
    setJob(null)

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

      setIsImporting(true)

      const result = await importCleanListings(parsed)

      if (!result.jobId) {
        setError('Import started but no job ID was returned.')
        return
      }

      setStartResult(result)
    } catch {
      setError('Could not import file. Please check the JSON/NDJSON format.')
    } finally {
      setIsImporting(false)
    }
  }

  useEffect(() => {
    if (!startResult?.jobId) return

    let cancelled = false
    let timeoutId: number | undefined

    async function pollJob() {
      try {
        const latestJob = await getImportJob(startResult!.jobId)

        if (cancelled) return

        setJob(latestJob)

        if (
          latestJob.status === 'completed' ||
          latestJob.status === 'failed'
        ) {
          return
        }

        timeoutId = window.setTimeout(pollJob, 1500)
      } catch {
        if (!cancelled) {
          setError('Could not fetch import job status.')
        }
      }
    }

    pollJob()

    return () => {
      cancelled = true

      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [startResult])

  const total = job?.totalCount ?? startResult?.total ?? 0
  const processed = job?.processedCount ?? 0
  const failed = job?.failedCount ?? 0
  const status = job?.status ?? startResult?.status ?? 'queued'

  const progress =
    total > 0 ? Math.round(((processed + failed) / total) * 100) : 0

  return (
    <div className="min-w-0 space-y-6">
      <div className="min-w-0">
        <p className="text-sm font-medium text-orange-400">Data ingestion</p>
        <h1 className="mt-2 break-words text-3xl font-bold text-white">Import listings</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Upload a clean JSON or NDJSON file from your scraper. EstateLink will
          store the raw payload, normalise each listing, score the opportunity,
          and make it available in the lead dashboard.
        </p>
      </div>

      <div className="min-w-0 rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-6">
        <label
          htmlFor="listing-json"
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-black px-6 py-10 text-center transition hover:border-orange-500"
        >
          <span className="text-base font-semibold text-white">
            Upload clean listing file
          </span>
          <span className="mt-2 text-sm text-slate-300">
            Select a .json or .ndjson file containing scraped listings.
          </span>

          <input
            id="listing-json"
            type="file"
            accept="application/json,.json,.ndjson"
            className="hidden"
            onChange={handleFileChange}
            disabled={isImporting}
          />
        </label>

        {fileName && (
          <p className="mt-4 text-sm text-slate-300">
            Selected file:{' '}
            <span className="break-all font-medium text-white">{fileName}</span>
          </p>
        )}

        {isImporting && (
          <p className="mt-4 text-sm text-orange-400">
            Starting import job...
          </p>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-900/60 bg-red-950/40 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {startResult && (
          <div className="mt-6 min-w-0 rounded-xl border border-white/10 bg-black p-4 sm:p-5">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-white">
                  Import job: {status}
                </h2>
                <p className="mt-1 break-all text-sm text-slate-400">
                  Job ID: {startResult.jobId}
                </p>
              </div>

              {status === 'completed' && (
                <Link
                  to="/app/leads"
                  className="rounded-xl border border-orange-500/60 px-4 py-2 text-sm font-semibold text-orange-300 hover:bg-orange-500/10"
                >
                  View leads
                </Link>
              )}
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-900">
              <div
                className="h-full bg-orange-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="mt-2 text-sm text-slate-400">{progress}% complete</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-slate-400">Total</p>
                <p className="mt-1 text-2xl font-bold text-white">{total}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-slate-400">Processed</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {processed}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-slate-400">Failed</p>
                <p className="mt-1 text-2xl font-bold text-white">{failed}</p>
              </div>
            </div>

            {job?.errorMessage && (
              <div className="mt-4 rounded-xl border border-red-900/60 bg-red-950/40 p-4 text-sm text-red-300">
                {job.errorMessage}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
