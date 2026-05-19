export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

export interface User {
  id?: string | number
  name?: string
  fullName?: string
  email?: string
  role?: string
}
