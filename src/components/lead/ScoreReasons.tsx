import { EmptyState } from '../ui/EmptyState'

export type NormalizedScoreReason = {
  code?: string
  title: string
  message?: string
  points?: number
}

interface ScoreReasonsProps {
  reasons: string[]
  raw?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  return undefined
}

export function formatReasonCode(code: string): string {
  return code
    .trim()
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function buildReason(input: {
  code?: unknown
  title?: unknown
  message?: unknown
  points?: unknown
}): NormalizedScoreReason | null {
  const code = asString(input.code)
  const explicitTitle = asString(input.title)
  const message = asString(input.message)
  const points = asNumber(input.points)
  const title = explicitTitle ?? (code ? formatReasonCode(code) : message)

  if (!title) {
    return null
  }

  return {
    code,
    title,
    message: message && message !== title ? message : undefined,
    points,
  }
}

function normalizeObjectReason(
  record: Record<string, unknown>,
  fallbackCode?: string,
): NormalizedScoreReason | null {
  return buildReason({
    code:
      record.code ??
      record.reasonCode ??
      record.reason_code ??
      fallbackCode,
    title: record.title ?? record.label ?? record.name,
    message:
      record.message ??
      record.description ??
      record.reason ??
      record.summary,
    points:
      record.points ??
      record.scoreImpact ??
      record.score_impact ??
      record.impact,
  })
}

function normalizeObjectArray(items: unknown[]): NormalizedScoreReason[] {
  return items
    .map((item) => (isRecord(item) ? normalizeObjectReason(item) : null))
    .filter((item): item is NormalizedScoreReason => Boolean(item))
}

function isFlatTripletArray(items: unknown[]): boolean {
  if (items.length === 0 || items.length % 3 !== 0) {
    return false
  }

  for (let index = 0; index < items.length; index += 3) {
    const code = items[index]
    const message = items[index + 1]
    const points = items[index + 2]

    if (typeof code !== 'string' || !code.trim()) {
      return false
    }

    if (typeof message !== 'string' || !message.trim()) {
      return false
    }

    if (asNumber(points) == null) {
      return false
    }
  }

  return true
}

function normalizeFlatTripletArray(items: unknown[]): NormalizedScoreReason[] {
  const normalized: NormalizedScoreReason[] = []

  for (let index = 0; index < items.length; index += 3) {
    const reason = buildReason({
      code: items[index],
      message: items[index + 1],
      points: items[index + 2],
    })

    if (reason) {
      normalized.push(reason)
    }
  }

  return normalized
}

function normalizeStringArray(items: unknown[]): NormalizedScoreReason[] {
  return items
    .map((item) => buildReason({ title: item }))
    .filter((item): item is NormalizedScoreReason => Boolean(item))
}

function normalizeArray(items: unknown[]): NormalizedScoreReason[] {
  if (items.length === 0) {
    return []
  }

  if (items.every((item) => isRecord(item))) {
    return normalizeObjectArray(items)
  }

  if (isFlatTripletArray(items)) {
    return normalizeFlatTripletArray(items)
  }

  if (items.every((item) => typeof item === 'string')) {
    return normalizeStringArray(items)
  }

  return []
}

function normalizeObjectMap(record: Record<string, unknown>): NormalizedScoreReason[] {
  return Object.entries(record)
    .map(([key, value]) => {
      if (isRecord(value)) {
        return normalizeObjectReason(value, key)
      }

      if (typeof value === 'string') {
        return buildReason({ code: key, message: value })
      }

      return null
    })
    .filter((item): item is NormalizedScoreReason => Boolean(item))
}

function normalizeScoreReasons(value: unknown): NormalizedScoreReason[] {
  if (Array.isArray(value)) {
    return normalizeArray(value)
  }

  if (isRecord(value)) {
    return normalizeObjectMap(value)
  }

  if (typeof value === 'string') {
    return normalizeStringArray([value])
  }

  return []
}

export function ScoreReasons({ reasons, raw }: ScoreReasonsProps) {
  const items =
    normalizeScoreReasons(raw).length > 0
      ? normalizeScoreReasons(raw)
      : normalizeScoreReasons(reasons)

  if (items.length === 0) {
    return (
      <EmptyState
        title="No score reasons available"
        description="No score reasons available for this lead."
      />
    )
  }

  return (
    <div className="divide-y divide-slate-200 rounded-md border border-slate-200">
      {items.map((reason, index) => (
        <div key={`${reason.code ?? reason.title}-${index}`} className="flex items-start justify-between gap-3 p-3">
          <div className="min-w-0">
            <h4 className="text-sm font-medium text-slate-900">{reason.title}</h4>
            {reason.message ? <p className="mt-1 text-sm leading-5 text-slate-500">{reason.message}</p> : null}
          </div>

          {reason.points != null ? (
            <span className="shrink-0 rounded-sm border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-xs font-semibold text-blue-800">
              +{reason.points}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  )
}
