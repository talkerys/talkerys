export type EnglishLevel = 'beginner' | 'intermediate' | 'advanced'
export type UserStatus = 'pending' | 'active' | 'inactive'
export type UserRole = 'user' | 'admin'
export type SubscriptionStatus = 'pending' | 'active' | 'expired'
export type PaymentStatus = 'pending' | 'verified' | 'rejected'
export type PaymentMethod = 'yape' | 'plin' | 'transfer'
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled'

export interface Profile {
  id: string
  full_name: string
  phone: string
  english_level: EnglishLevel
  bio: string
  avatar_url: string
  status: UserStatus
  role: UserRole
  sessions_attended: number
  created_at: string
  updated_at: string
}

export interface Plan {
  id: number
  slug: string
  name: string
  price: number
  sessions_included: number
  tag: string
  is_active: boolean
}

export interface Subscription {
  id: number
  user_id: string
  plan_id: number
  status: SubscriptionStatus
  sessions_remaining: number
  starts_at: string | null
  expires_at: string | null
  created_at: string
  plan?: Plan
}

export interface Payment {
  id: number
  user_id: string
  subscription_id: number | null
  amount: number
  method: PaymentMethod
  voucher_url: string
  reference: string
  status: PaymentStatus
  rejection_reason: string
  verified_by: string | null
  verified_at: string | null
  created_at: string
  profile?: Profile
  subscription?: Subscription
}

export interface Cafeteria {
  id: number
  name: string
  address: string
  district: string
  google_maps_url: string
  phone: string
  max_tables: number
  notes: string
  is_active: boolean
  created_at: string
}

export interface Session {
  id: number
  title: string
  topic: string
  description: string
  session_date: string
  time_start: string
  time_end: string
  cafeteria_id: number | null
  status: SessionStatus
  notes: string
  created_at: string
  cafeteria?: Cafeteria
}

export interface SessionTable {
  id: number
  session_id: number
  table_label: string
  target_level: EnglishLevel | null
  moderator_name: string
  max_seats: number
  created_at: string
  assignments?: TableAssignment[]
}

export interface TableAssignment {
  id: number
  table_id: number
  user_id: string
  attended: boolean
  assigned_at: string
  profile?: Profile
}

export interface ClubSettings {
  id: number
  key: string
  value: string
}
