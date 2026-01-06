import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          filename: string
          path: string
          product_name: string
          description: string | null
          main_category: string
          subcategories: Record<string, string>
          tags: string[]
          created_at: string
        }
        Insert: {
          id: string
          filename: string
          path: string
          product_name: string
          description?: string | null
          main_category: string
          subcategories?: Record<string, string>
          tags?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          filename?: string
          path?: string
          product_name?: string
          description?: string | null
          main_category?: string
          subcategories?: Record<string, string>
          tags?: string[]
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          label: string
          subcategories: any[]
          created_at: string
        }
        Insert: {
          id: string
          label: string
          subcategories?: any[]
          created_at?: string
        }
        Update: {
          id?: string
          label?: string
          subcategories?: any[]
          created_at?: string
        }
      }
    }
  }
}