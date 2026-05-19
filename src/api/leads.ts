import { apiClient } from './client'
import type { Lead, LeadsFilters } from '../types/lead'

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
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

function extractReasonStrings(value: unknown, depth = 0): string[] {
  if (depth > 4 || value == null) {
    return []
  }

  if (typeof value === 'string') {
    return value.trim() ? [value] : []
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return [String(value)]
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => extractReasonStrings(item, depth + 1))
  }

  const record = asRecord(value)
  if (!record) {
    return []
  }

  const preferredKeys = ['reason', 'message', 'title', 'label', 'description', 'summary']
  const preferred = preferredKeys.flatMap((key) => extractReasonStrings(record[key], depth + 1))

  if (preferred.length > 0) {
    return preferred
  }

  return Object.values(record).flatMap((item) => extractReasonStrings(item, depth + 1))
}

function pickReasons(record: Record<string, unknown>) {
  const candidates = [record.reasons, record.scoreReasons, record.score_reasons]

  for (const candidate of candidates) {
    const reasons = extractReasonStrings(candidate)
      .map((item) => item.trim())
      .filter(Boolean)

    if (reasons.length > 0) {
      return { reasons, reasonsRaw: candidate }
    }
  }

  return {
    reasons: [] as string[],
    reasonsRaw: record.reasons ?? record.scoreReasons ?? record.score_reasons,
  }
}

export function normalizeLead(data: unknown): Lead {
  const record = asRecord(data) ?? {}
  const location = asRecord(record.location)
  const property = asRecord(record.property)
  const listing = asRecord(record.listing)
  const { reasons, reasonsRaw } = pickReasons(record)

  const idValue = record.id ?? record.leadId ?? record.lead_id ?? record.listingId ?? record.listing_id
  const listingIdValue = record.listingId ?? record.listing_id ?? listing?.id

  return {
    id: idValue != null ? String(idValue) : undefined,
    listingId: listingIdValue != null ? String(listingIdValue) : undefined,
    title: asString(record.title) ?? asString(listing?.title) ?? asString(property?.title),
    address:
      asString(record.address) ??
      asString(record.fullAddress) ??
      asString(record.full_address) ??
      asString(property?.address) ??
      asString(listing?.address),
    city:
      asString(record.city) ??
      asString(location?.city) ??
      asString(property?.city) ??
      asString(listing?.city),
    postcodeArea:
      asString(record.postcodeArea) ??
      asString(record.postcode_area) ??
      asString(location?.postcodeArea) ??
      asString(location?.postcode_area),
    propertyType:
      asString(record.propertyType) ??
      asString(record.property_type) ??
      asString(property?.propertyType) ??
      asString(property?.type) ??
      asString(listing?.propertyType),
    sourcePlatform:
      asString(record.sourcePlatform) ??
      asString(record.source_platform) ??
      asString(listing?.sourcePlatform) ??
      asString(listing?.platform) ??
      asString(record.platform),
    price: asNumber(record.price) ?? asNumber(property?.price) ?? asNumber(listing?.price),
    bedrooms:
      asNumber(record.bedrooms) ?? asNumber(property?.bedrooms) ?? asNumber(listing?.bedrooms),
    score: asNumber(record.score) ?? asNumber(record.leadScore) ?? asNumber(record.lead_score),
    grade: asString(record.grade) ?? asString(record.scoreGrade) ?? asString(record.score_grade),
    yield: asNumber(record.yield) ?? asNumber(record.rentalYield) ?? asNumber(record.rental_yield),
    reasons,
    reasonsRaw,
    raw: record,
  }
}

function extractLeadArray(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data
  }

  const record = asRecord(data)
  if (!record) {
    return []
  }

  const listValue = record.leads ?? record.items ?? record.data ?? record.results
  return Array.isArray(listValue) ? listValue : []
}

function toQueryParams(filters?: LeadsFilters) {
  if (!filters) {
    return undefined
  }

  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ''),
  )
}

export async function getLeads(filters?: LeadsFilters): Promise<Lead[]> {
  const response = await apiClient.get('/api/leads', {
    params: toQueryParams(filters),
  })

  return extractLeadArray(response.data).map(normalizeLead)
}

export async function getLeadById(id: string): Promise<Lead> {
  const response = await apiClient.get(`/api/leads/${id}`)

  const record = asRecord(response.data)
  const payload = record?.lead ?? record?.data ?? response.data
  return normalizeLead(payload)
}
