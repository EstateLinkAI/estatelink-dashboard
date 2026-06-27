import { apiClient } from './client'

export type StartImportResult = {
  jobId: string
  status: string
  total: number
}

export type ImportJob = {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'failed' | string
  totalCount: number
  processedCount: number
  failedCount: number
  errorMessage?: string
  createdAt: string
  startedAt?: string
  completedAt?: string
  updatedAt: string
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

function asNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function normalizeStartImportResult(data: unknown): StartImportResult {
  const record = asRecord(data) ?? {}

  return {
    jobId: asString(record.jobId ?? record.job_id ?? record.id) ?? '',
    status: asString(record.status) ?? 'queued',
    total: asNumber(record.total ?? record.totalCount ?? record.total_count),
  }
}

function normalizeImportJob(data: unknown): ImportJob {
  const record = asRecord(data) ?? {}

  return {
    id: asString(record.id ?? record.jobId ?? record.job_id) ?? '',
    status: asString(record.status) ?? 'unknown',
    totalCount: asNumber(record.totalCount ?? record.total_count),
    processedCount: asNumber(record.processedCount ?? record.processed_count),
    failedCount: asNumber(record.failedCount ?? record.failed_count),
    errorMessage: asString(record.errorMessage ?? record.error_message),
    createdAt: asString(record.createdAt ?? record.created_at) ?? '',
    startedAt: asString(record.startedAt ?? record.started_at),
    completedAt: asString(record.completedAt ?? record.completed_at),
    updatedAt: asString(record.updatedAt ?? record.updated_at) ?? '',
  }
}

export async function importCleanListings(
  listings: unknown[],
): Promise<StartImportResult> {
  const response = await apiClient.post(
    '/api/imports/clean-listings',
    listings,
  )

  return normalizeStartImportResult(response.data)
}

export async function getImportJob(jobId: string): Promise<ImportJob> {
  const response = await apiClient.get(`/api/imports/${jobId}`)

  return normalizeImportJob(response.data)
}

function extractJobArray(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data
  }

  const record = asRecord(data)
  if (!record) {
    return []
  }

  const listValue = record.jobs ?? record.items ?? record.data
  return Array.isArray(listValue) ? listValue : []
}

export async function getImportJobs(limit = 20): Promise<ImportJob[]> {
  const response = await apiClient.get('/api/imports', { params: { limit } })

  return extractJobArray(response.data).map(normalizeImportJob)
}

export async function cancelImportJob(jobId: string): Promise<ImportJob> {
  const response = await apiClient.post(`/api/imports/${jobId}/cancel`)

  return normalizeImportJob(response.data)
}