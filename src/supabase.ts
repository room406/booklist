import { createClient } from '@supabase/supabase-js'

export type Book = {
  id: string
  title: string
  author: string
  translator: string | null
  publisher: string | null
  publication_year: number | null
  isbn: string | null
  series: string | null
  created_at: string
  updated_at: string
}

type Database = {
  public: {
    Tables: {
      books: {
        Row: Book
        Insert: Omit<Book, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Book, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are not configured')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
