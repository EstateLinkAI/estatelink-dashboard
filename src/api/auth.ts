import { apiClient } from './client'
import type { LoginRequest, LoginResponse, User } from '../types/auth'

function pickToken(data: unknown): string {
  if (typeof data === 'string') {
    return data
  }

  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    const token = record.token ?? record.jwt ?? record.accessToken ?? record.access_token
    if (typeof token === 'string') {
      return token
    }
  }

  throw new Error('Login response did not include a token.')
}

function normalizeUser(data: unknown): User {
  if (!data || typeof data !== 'object') {
    return {}
  }

  const record = data as Record<string, unknown>

  return {
    id: typeof record.id === 'string' || typeof record.id === 'number' ? record.id : undefined,
    name: typeof record.name === 'string' ? record.name : undefined,
    fullName: typeof record.fullName === 'string'
      ? record.fullName
      : typeof record.full_name === 'string'
        ? record.full_name
        : undefined,
    email: typeof record.email === 'string' ? record.email : undefined,
    role: typeof record.role === 'string' ? record.role : undefined,
  }
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post('/api/auth/login', payload)
  return { token: pickToken(response.data) }
}

export async function getMe(): Promise<User> {
  const response = await apiClient.get('/api/me')
  return normalizeUser(response.data)
}
