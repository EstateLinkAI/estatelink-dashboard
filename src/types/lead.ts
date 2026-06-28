export type StrategyType =
  | 'buy_to_let'
  | 'brrrr'
  | 'flip'
  | 'buy_and_hold'
  | 'hmo'
  | 'development'

export const STRATEGY_TYPES: StrategyType[] = [
  'buy_to_let',
  'brrrr',
  'flip',
  'buy_and_hold',
  'hmo',
  'development',
]

export const STRATEGY_LABELS: Record<StrategyType, string> = {
  buy_to_let: 'Buy to Let',
  brrrr: 'BRRRR',
  flip: 'Flip',
  buy_and_hold: 'Buy and Hold',
  hmo: 'HMO',
  development: 'Development',
}

export interface StrategyScore {
  id?: string
  listingId?: string
  strategy?: StrategyType | string
  score?: number
  grade?: string
  reasons: string[]
  reasonsRaw?: unknown
  createdAt?: string
}

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
  rentalEstimate?: number
  daysOnMarket?: number
  reasons: string[]
  reasonsRaw?: unknown
  strategyScores: StrategyScore[]
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

export interface LeadsPagination {
  limit: number
  offset: number
  total: number
  returned: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface LeadsResult {
  leads: Lead[]
  pagination: LeadsPagination
}
