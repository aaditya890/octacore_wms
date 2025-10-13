export interface User {
  id?: string
  email: string
  full_name: string
  role: UserRole
  department?: string
  phone?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type UserRole = "admin" | "manager" | "staff" | "viewer"

export interface UserFilter {
  role?: UserRole
  is_active?: boolean
  department?: string
  search_term?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
  role: UserRole
  department?: string
  phone?: string
}

export interface AuthResponse {
  user: User
  session: any
}
