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
    Functions: { is_taplink_admin: { Args: Record<PropertyKey, never>; Returns: boolean }; taplink_admin_overview: { Args: Record<PropertyKey, never>; Returns: { total_users: number; total_profiles: number; published_profiles: number; draft_profiles: number }[] }; taplink_admin_users: { Args: Record<PropertyKey, never>; Returns: { user_id: string; email: string | null; created_at: string; profile_count: number }[] }; taplink_admin_profiles: { Args: Record<PropertyKey, never>; Returns: { profile_id: string; owner_email: string | null; profile_name: string; profile_type: string; slug: string; is_published: boolean; created_at: string }[] }; taplink_admin_set_profile_published: { Args: { target_profile_id: string; publish_status: boolean }; Returns: boolean }; taplink_admin_user_profiles: { Args: { target_user_id: string }; Returns: { profile_id: string; profile_name: string; profile_type: string; slug: string; is_published: boolean; created_at: string }[] }; record_profile_analytics_event: { Args: { p_profile_slug: string; p_event_type: string; p_event_target: string | null; p_visitor_hash: string }; Returns: boolean } }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

