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
    <div className="space-y-3">
      {items.map((reason, index) => (
        <div
          key={`${reason.code ?? reason.title}-${index}`}
          className="rounded-xl border border-slate-800 bg-slate-950 p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                <h4 className="text-sm font-semibold text-white">{reason.title}</h4>
              </div>
              {reason.message ? (
                <p className="mt-2 pl-4 text-sm leading-6 text-slate-300">{reason.message}</p>
              ) : null}
            </div>

            {reason.points != null ? (
              <div className="shrink-0 rounded-lg border border-cyan-900 bg-cyan-950/50 px-3 py-1.5 text-sm font-semibold text-cyan-200">
                +{reason.points} pts
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
