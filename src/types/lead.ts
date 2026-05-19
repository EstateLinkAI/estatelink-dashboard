export interface Lead {
  id?: string
  listingId?: string
  title?: string
  address?: string
  city?: string
  postcodeArea?: string
  propertyType?: string
  sourcePlatform?: string
  price?: number
  bedrooms?: number
  score?: number
  grade?: string
  yield?: number
  reasons: string[]
  reasonsRaw?: unknown
  raw?: Record<string, unknown>
}

export interface LeadsFilters {
  city?: string
  postcodeArea?: string
  propertyType?: string
  sourcePlatform?: string
  minScore?: number
  limit?: number
  offset?: number
}
