export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; owner_id: string; profile_type: string; slug: string; name: string; role: string | null; bio: string | null; photo_url: string | null; phone: string | null; alternate_phone: string | null; email: string | null; location: string | null; website: string | null; is_published: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; owner_id: string; profile_type?: string; slug: string; name?: string; role?: string | null; bio?: string | null; photo_url?: string | null; phone?: string | null; alternate_phone?: string | null; email?: string | null; location?: string | null; website?: string | null; is_published?: boolean; created_at?: string; updated_at?: string }
        Update: { id?: string; owner_id?: string; profile_type?: string; slug?: string; name?: string; role?: string | null; bio?: string | null; photo_url?: string | null; phone?: string | null; alternate_phone?: string | null; email?: string | null; location?: string | null; website?: string | null; is_published?: boolean; created_at?: string; updated_at?: string }
        Relationships: []
      }
      profile_socials: {
        Row: { id: string; profile_id: string; platform: string; url: string; sort_order: number; created_at: string }
        Insert: { id?: string; profile_id: string; platform: string; url: string; sort_order?: number; created_at?: string }
        Update: { id?: string; profile_id?: string; platform?: string; url?: string; sort_order?: number; created_at?: string }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
