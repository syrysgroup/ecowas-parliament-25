export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_activity_logs: {
        Row: {
          action: string
          actor_user_id: string
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_user_id: string
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_user_id?: string
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_activity_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "public_nominee_leaderboard"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "admin_activity_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "public_representatives"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      applications: {
        Row: {
          country: string
          created_at: string
          experience: string | null
          id: string
          manifesto: string | null
          moderator_notes: string | null
          motivation: string
          reviewed_at: string | null
          reviewed_by: string | null
          score: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          country: string
          created_at?: string
          experience?: string | null
          id?: string
          manifesto?: string | null
          moderator_notes?: string | null
          motivation: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          country?: string
          created_at?: string
          experience?: string | null
          id?: string
          manifesto?: string | null
          moderator_notes?: string | null
          motivation?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_nominee_leaderboard"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_representatives"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          created_at: string
          flag: string
          id: string
          name: string
          nomination_target: number
          seats: number
          sort_order: number
        }
        Insert: {
          code: string
          created_at?: string
          flag: string
          id?: string
          name: string
          nomination_target?: number
          seats: number
          sort_order: number
        }
        Update: {
          code?: string
          created_at?: string
          flag?: string
          id?: string
          name?: string
          nomination_target?: number
          seats?: number
          sort_order?: number
        }
        Relationships: []
      }
      nomination_votes: {
        Row: {
          created_at: string
          id: string
          nomination_id: string
          voter_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nomination_id: string
          voter_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nomination_id?: string
          voter_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nomination_votes_nomination_id_fkey"
            columns: ["nomination_id"]
            isOneToOne: false
            referencedRelation: "nominations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nomination_votes_nomination_id_fkey"
            columns: ["nomination_id"]
            isOneToOne: false
            referencedRelation: "public_nominee_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nomination_votes_voter_user_id_fkey"
            columns: ["voter_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nomination_votes_voter_user_id_fkey"
            columns: ["voter_user_id"]
            isOneToOne: false
            referencedRelation: "public_nominee_leaderboard"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "nomination_votes_voter_user_id_fkey"
            columns: ["voter_user_id"]
            isOneToOne: false
            referencedRelation: "public_representatives"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      nominations: {
        Row: {
          country: string
          created_at: string
          id: string
          moderator_notes: string | null
          nominator_user_id: string
          nominee_user_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          statement: string | null
          status: string
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          id?: string
          moderator_notes?: string | null
          nominator_user_id: string
          nominee_user_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          statement?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          moderator_notes?: string | null
          nominator_user_id?: string
          nominee_user_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          statement?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nominations_nominator_user_id_fkey"
            columns: ["nominator_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nominations_nominator_user_id_fkey"
            columns: ["nominator_user_id"]
            isOneToOne: false
            referencedRelation: "public_nominee_leaderboard"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "nominations_nominator_user_id_fkey"
            columns: ["nominator_user_id"]
            isOneToOne: false
            referencedRelation: "public_representatives"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "nominations_nominee_user_id_fkey"
            columns: ["nominee_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nominations_nominee_user_id_fkey"
            columns: ["nominee_user_id"]
            isOneToOne: false
            referencedRelation: "public_nominee_leaderboard"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "nominations_nominee_user_id_fkey"
            columns: ["nominee_user_id"]
            isOneToOne: false
            referencedRelation: "public_representatives"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string
          created_at: string
          date_of_birth: string | null
          email: string
          full_name: string
          id: string
          is_public: boolean
          organisation: string | null
          title: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country: string
          created_at?: string
          date_of_birth?: string | null
          email: string
          full_name: string
          id: string
          is_public?: boolean
          organisation?: string | null
          title?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string
          id?: string
          is_public?: boolean
          organisation?: string | null
          title?: string | null
        }
        Relationships: []
      }
      representatives: {
        Row: {
          country: string
          created_at: string
          featured: boolean
          headshot_url: string | null
          id: string
          manifesto_summary: string | null
          profile_id: string
          short_bio: string | null
          status: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          country: string
          created_at?: string
          featured?: boolean
          headshot_url?: string | null
          id?: string
          manifesto_summary?: string | null
          profile_id: string
          short_bio?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          country?: string
          created_at?: string
          featured?: boolean
          headshot_url?: string | null
          id?: string
          manifesto_summary?: string | null
          profile_id?: string
          short_bio?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "representatives_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "representatives_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "public_nominee_leaderboard"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "representatives_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "public_representatives"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_nominee_leaderboard: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          country_nominee_count: number | null
          created_at: string | null
          full_name: string | null
          id: string | null
          organisation: string | null
          profile_country: string | null
          profile_id: string | null
          status: string | null
          title: string | null
          vote_count: number | null
        }
        Relationships: []
      }
      public_representatives: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          featured: boolean | null
          full_name: string | null
          headshot_url: string | null
          id: string | null
          manifesto_summary: string | null
          organisation: string | null
          profile_id: string | null
          short_bio: string | null
          status: string | null
          title: string | null
          verified_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_nomination_count: { Args: { nominee_id: string }; Returns: number }
      get_vote_count: { Args: { _nomination_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "super_admin" | "sponsor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "super_admin", "sponsor"],
    },
  },
} as const
