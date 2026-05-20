export interface ActivityLog {
  id?: string
  createdAt?: string
  actorUserId?: string
  action?: string
  entityType?: string
  entityId?: string
  ipAddress?: string
  userAgent?: string
  metadata?: unknown
  hasMappedFields?: boolean
  raw: Record<string, unknown>
}

export interface ActivityLogListResult {
  logs: ActivityLog[]
  hasMore: boolean
}
