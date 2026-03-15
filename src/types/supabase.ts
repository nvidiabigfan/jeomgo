export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          kakao_id: string | null
          email: string | null
          nickname: string | null
          profile_image: string | null
          office_lat: number | null
          office_lng: number | null
          office_address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          kakao_id?: string | null
          email?: string | null
          nickname?: string | null
          profile_image?: string | null
          office_lat?: number | null
          office_lng?: number | null
          office_address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          kakao_id?: string | null
          email?: string | null
          nickname?: string | null
          profile_image?: string | null
          office_lat?: number | null
          office_lng?: number | null
          office_address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      restaurants: {
        Row: {
          id: string
          name: string
          category: string | null
          address: string | null
          lat: number | null
          lng: number | null
          phone: string | null
          kakao_place_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          address?: string | null
          lat?: number | null
          lng?: number | null
          phone?: string | null
          kakao_place_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          address?: string | null
          lat?: number | null
          lng?: number | null
          phone?: string | null
          kakao_place_id?: string | null
          created_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          user_id: string
          restaurant_id: string
          score: number
          comment: string | null
          visited_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_id: string
          score: number
          comment?: string | null
          visited_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_id?: string
          score?: number
          comment?: string | null
          visited_at?: string | null
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          restaurant_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_id?: string
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
