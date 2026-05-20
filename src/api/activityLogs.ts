import { apiClient } from './client'
import type { ActivityLog, ActivityLogListResult } from '../types/activityLog'

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined
}

function asString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? trimmed : undefined
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return undefined
}

function normalizeMetadata(value: unknown): unknown {
  if (value == null) {
    return null
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value : null
  }

  if (typeof value !== 'object') {
    return value
  }

  const entries = Object.entries(value as Record<string, unknown>).filter(([, item]) => item != null)
  return entries.length > 0 ? Object.fromEntries(entries) : null
}

function pickFirstString(...values: unknown[]) {
  for (const value of values) {
    const nextValue = asString(value)
    if (nextValue) {
      return nextValue
    }
  }

  return undefined
}

function flattenRecord(
  value: unknown,
  prefix = '',
  depth = 0,
  flattened: Array<{ key: string; value: unknown }> = [],
) {
  if (depth > 3 || value == null) {
    return flattened
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      flattenRecord(item, prefix ? `${prefix}.${index}` : String(index), depth + 1, flattened)
    })
    return flattened
  }

  if (typeof value !== 'object') {
    flattened.push({ key: prefix, value })
    return flattened
  }

  for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
    const nextKey = prefix ? `${prefix}.${key}` : key
    if (nestedValue != null && typeof nestedValue === 'object') {
      flattenRecord(nestedValue, nextKey, depth + 1, flattened)
      continue
    }

    flattened.push({ key: nextKey, value: nestedValue })
  }

  return flattened
}

function includesAny(target: string, needles: string[]) {
  return needles.some((needle) => target.includes(needle))
}

function findStringByKey(record: Record<string, unknown>, include: string[], exclude: string[] = []) {
  const flattened = flattenRecord(record)

  for (const entry of flattened) {
    const normalizedKey = entry.key.toLowerCase()
    if (!includesAny(normalizedKey, include)) {
      continue
    }

    if (exclude.length > 0 && includesAny(normalizedKey, exclude)) {
      continue
    }

    const nextValue = asString(entry.value)
    if (nextValue) {
      return nextValue
    }
  }

  return undefined
}

function buildMetadata(record: Record<string, unknown>, metadata: unknown, hasMappedFields: boolean) {
  if (metadata != null) {
    return metadata
  }

  if (!hasMappedFields) {
    return record
  }

  return null
}

function normalizeActivityLog(data: unknown): ActivityLog {
  const record = asRecord(data) ?? {}
  const actor = asRecord(record.actor)
  const user = asRecord(record.user)
  const entity = asRecord(record.entity)
  const request = asRecord(record.request)
  const context = asRecord(record.context)
  const client = asRecord(record.client)
  const createdAt =
    pickFirstString(
      record.createdAt,
      record.created_at,
      record.timestamp,
      record.occurredAt,
      record.occurred_at,
      record.loggedAt,
      record.logged_at,
    ) ??
    findStringByKey(record, ['created', 'timestamp', 'occurred', 'logged', 'time', 'date'])
  const actorUserId =
    pickFirstString(
      record.actorUserId,
      record.actor_user_id,
      record.userId,
      record.user_id,
      actor?.userId,
      actor?.user_id,
      actor?.id,
      user?.id,
    ) ??
    findStringByKey(record, ['actor', 'user'], ['agent', 'ip', 'email', 'name', 'role'])
  const action =
    pickFirstString(record.action, record.event, record.activity, record.type, record.name) ??
    findStringByKey(record, ['action', 'event', 'activity', 'operation', 'verb', 'type'])
  const entityType =
    pickFirstString(
      record.entityType,
      record.entity_type,
      entity?.type,
      entity?.entityType,
      entity?.entity_type,
      context?.entityType,
      context?.entity_type,
    ) ??
    findStringByKey(record, ['entitytype', 'entity_type', 'resource_type', 'model', 'subjecttype'])
  const entityId =
    pickFirstString(
      record.entityId,
      record.entity_id,
      entity?.id,
      entity?.entityId,
      entity?.entity_id,
      context?.entityId,
      context?.entity_id,
    ) ??
    findStringByKey(record, ['entityid', 'entity_id', 'resourceid', 'targetid', 'subjectid'])
  const ipAddress =
    pickFirstString(
      record.ipAddress,
      record.ip_address,
      request?.ipAddress,
      request?.ip_address,
      client?.ipAddress,
      client?.ip_address,
      context?.ipAddress,
      context?.ip_address,
    ) ??
    findStringByKey(record, ['ip'])
  const userAgent =
    pickFirstString(
      record.userAgent,
      record.user_agent,
      request?.userAgent,
      request?.user_agent,
      client?.userAgent,
      client?.user_agent,
      context?.userAgent,
      context?.user_agent,
    ) ??
    findStringByKey(record, ['useragent', 'user_agent', 'agent', 'browser'], ['actor', 'user'])
  const normalizedMetadata = normalizeMetadata(
    record.metadata ??
      record.meta ??
      record.details ??
      record.changes ??
      context?.metadata ??
      context?.meta,
  )
  const hasMappedFields = Boolean(
    createdAt || actorUserId || action || entityType || entityId || ipAddress || userAgent,
  )

  return {
    id: pickFirstString(record.id, record.logId, record.log_id, record.auditLogId, record.audit_log_id),
    createdAt,
    actorUserId,
    action,
    entityType,
    entityId,
    ipAddress,
    userAgent,
    metadata: buildMetadata(record, normalizedMetadata, hasMappedFields),
    hasMappedFields,
    raw: record,
  }
}

function extractLogArray(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data
  }

  const record = asRecord(data)
  if (!record) {
    return []
  }

  const listValue =
    record.activityLogs ??
    record.activity_logs ??
    record.logs ??
    record.items ??
    record.data ??
    record.results

  return Array.isArray(listValue) ? listValue : []
}

export async function getActivityLogs(limit = 50, offset = 0): Promise<ActivityLogListResult> {
  const response = await apiClient.get('/api/activity-logs', {
    params: { limit, offset },
  })

  const logs = extractLogArray(response.data).map(normalizeActivityLog)
  const payload = asRecord(response.data)
  const total = payload?.total
  const hasMoreFromTotal =
    typeof total === 'number' && Number.isFinite(total) ? offset + logs.length < total : undefined

  return {
    logs,
    hasMore: hasMoreFromTotal ?? logs.length === limit,
  }
}
