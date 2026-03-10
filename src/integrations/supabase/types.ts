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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agent_licensing_categories: {
        Row: {
          category_name: string
          category_number: number
          created_at: string | null
          description: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          category_name: string
          category_number: number
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          category_name?: string
          category_number?: number
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      brokers_agents: {
        Row: {
          agency: string | null
          category_id: string | null
          created_at: string | null
          full_name: string
          id: string
          lga: string
          license_no: string
          license_validity: string | null
          state: string
          status: string | null
          training_status: string | null
          updated_at: string | null
        }
        Insert: {
          agency?: string | null
          category_id?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          lga: string
          license_no: string
          license_validity?: string | null
          state: string
          status?: string | null
          training_status?: string | null
          updated_at?: string | null
        }
        Update: {
          agency?: string | null
          category_id?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          lga?: string
          license_no?: string
          license_validity?: string | null
          state?: string
          status?: string | null
          training_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brokers_agents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "agent_licensing_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          context_id: string
          context_type: string
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          content: string
          context_id: string
          context_type: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          context_id?: string
          context_type?: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      committee_memberships: {
        Row: {
          committee_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          member_id: string | null
          role: string | null
          start_date: string | null
        }
        Insert: {
          committee_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          member_id?: string | null
          role?: string | null
          start_date?: string | null
        }
        Update: {
          committee_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          member_id?: string | null
          role?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "committee_memberships_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "committee_memberships_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      committees: {
        Row: {
          chair_id: string | null
          contact_email: string | null
          country_code: string | null
          created_at: string | null
          description: Json | null
          established: string | null
          id: string
          is_active: boolean | null
          meeting_frequency: string | null
          name: Json
          updated_at: string | null
          vice_chair_id: string | null
        }
        Insert: {
          chair_id?: string | null
          contact_email?: string | null
          country_code?: string | null
          created_at?: string | null
          description?: Json | null
          established?: string | null
          id?: string
          is_active?: boolean | null
          meeting_frequency?: string | null
          name: Json
          updated_at?: string | null
          vice_chair_id?: string | null
        }
        Update: {
          chair_id?: string | null
          contact_email?: string | null
          country_code?: string | null
          created_at?: string | null
          description?: Json | null
          established?: string | null
          id?: string
          is_active?: boolean | null
          meeting_frequency?: string | null
          name?: Json
          updated_at?: string | null
          vice_chair_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "committees_chair_id_fkey"
            columns: ["chair_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "committees_vice_chair_id_fkey"
            columns: ["vice_chair_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          category: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string | null
          subject: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name?: string | null
          subject?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string | null
          subject?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      country_report_documents: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_path: string
          file_size: number | null
          id: string
          language_code: string
          report_id: string
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          language_code?: string
          report_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          language_code?: string
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "country_report_documents_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "country_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      country_reports: {
        Row: {
          country_id: string
          created_at: string | null
          description: Json | null
          id: string
          is_published: boolean | null
          published_date: string | null
          report_type: string
          session_id: string | null
          title: Json
          updated_at: string | null
        }
        Insert: {
          country_id: string
          created_at?: string | null
          description?: Json | null
          id?: string
          is_published?: boolean | null
          published_date?: string | null
          report_type?: string
          session_id?: string | null
          title?: Json
          updated_at?: string | null
        }
        Update: {
          country_id?: string
          created_at?: string | null
          description?: Json | null
          id?: string
          is_published?: boolean | null
          published_date?: string | null
          report_type?: string
          session_id?: string | null
          title?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "country_reports_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "member_states"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "country_reports_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "member_states_with_flag_url"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "country_reports_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      developers: {
        Row: {
          compliance_status: string | null
          created_at: string | null
          developer_id: string
          id: string
          name: string
          projects_count: number | null
          states_active: string[] | null
          status: string | null
          training_status: string | null
          updated_at: string | null
        }
        Insert: {
          compliance_status?: string | null
          created_at?: string | null
          developer_id: string
          id?: string
          name: string
          projects_count?: number | null
          states_active?: string[] | null
          status?: string | null
          training_status?: string | null
          updated_at?: string | null
        }
        Update: {
          compliance_status?: string | null
          created_at?: string | null
          developer_id?: string
          id?: string
          name?: string
          projects_count?: number | null
          states_active?: string[] | null
          status?: string | null
          training_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      legislation: {
        Row: {
          created_at: string | null
          document_url: string | null
          id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_url?: string | null
          id?: string
          status: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_url?: string | null
          id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      legislation_translations: {
        Row: {
          created_at: string | null
          full_text: string | null
          id: string
          language_code: string
          legislation_id: string | null
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_text?: string | null
          id?: string
          language_code: string
          legislation_id?: string | null
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_text?: string | null
          id?: string
          language_code?: string
          legislation_id?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legislation_translations_legislation_id_fkey"
            columns: ["legislation_id"]
            isOneToOne: false
            referencedRelation: "legislation"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          context_id: string | null
          created_at: string | null
          description: Json | null
          id: string
          related_context: string | null
          title: Json | null
          type: string
          url: string | null
        }
        Insert: {
          context_id?: string | null
          created_at?: string | null
          description?: Json | null
          id?: string
          related_context?: string | null
          title?: Json | null
          type: string
          url?: string | null
        }
        Update: {
          context_id?: string | null
          created_at?: string | null
          description?: Json | null
          id?: string
          related_context?: string | null
          title?: Json | null
          type?: string
          url?: string | null
        }
        Relationships: []
      }
      member_blog_mentions: {
        Row: {
          blog_id: string
          created_at: string | null
          id: string
          mentioned_member_id: string
        }
        Insert: {
          blog_id: string
          created_at?: string | null
          id?: string
          mentioned_member_id: string
        }
        Update: {
          blog_id?: string
          created_at?: string | null
          id?: string
          mentioned_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_blog_mentions_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "member_blogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_blog_mentions_mentioned_member_id_fkey"
            columns: ["mentioned_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_blogs: {
        Row: {
          body: Json
          created_at: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          member_id: string
          published_at: string | null
          title: Json
          updated_at: string | null
        }
        Insert: {
          body?: Json
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          member_id: string
          published_at?: string | null
          title?: Json
          updated_at?: string | null
        }
        Update: {
          body?: Json
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          member_id?: string
          published_at?: string | null
          title?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_blogs_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_news: {
        Row: {
          created_at: string | null
          id: string
          member_id: string
          news_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          member_id: string
          news_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          member_id?: string
          news_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_news_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_news_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      member_states: {
        Row: {
          applied_date: string | null
          area: string | null
          capital: Json
          code: string
          created_at: string | null
          currency: string | null
          exit_date: string | null
          flag: string | null
          id: string
          independence: string | null
          joined_ecowas: string | null
          languages: string[] | null
          mp_count: number | null
          name: Json
          official_name: Json
          population: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          applied_date?: string | null
          area?: string | null
          capital: Json
          code: string
          created_at?: string | null
          currency?: string | null
          exit_date?: string | null
          flag?: string | null
          id?: string
          independence?: string | null
          joined_ecowas?: string | null
          languages?: string[] | null
          mp_count?: number | null
          name: Json
          official_name: Json
          population?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          applied_date?: string | null
          area?: string | null
          capital?: Json
          code?: string
          created_at?: string | null
          currency?: string | null
          exit_date?: string | null
          flag?: string | null
          id?: string
          independence?: string | null
          joined_ecowas?: string | null
          languages?: string[] | null
          mp_count?: number | null
          name?: Json
          official_name?: Json
          population?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      members: {
        Row: {
          biography: Json | null
          country_id: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          mp_number: string | null
          name: string
          parliament_term_id: string | null
          portrait_3d_url: string | null
          position: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          biography?: Json | null
          country_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          mp_number?: string | null
          name: string
          parliament_term_id?: string | null
          portrait_3d_url?: string | null
          position?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          biography?: Json | null
          country_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          mp_number?: string | null
          name?: string
          parliament_term_id?: string | null
          portrait_3d_url?: string | null
          position?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "member_states"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "member_states_with_flag_url"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_parliament_term_id_fkey"
            columns: ["parliament_term_id"]
            isOneToOne: false
            referencedRelation: "parliament_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      multimedia_content: {
        Row: {
          category: Json | null
          content_type: Database["public"]["Enums"]["multimedia_type"]
          created_at: string | null
          description: Json | null
          duration: string | null
          event_date: string | null
          file_path: string
          id: string
          location: Json | null
          photographer: string | null
          thumbnail_path: string | null
          title: Json
          updated_at: string | null
          views: number | null
        }
        Insert: {
          category?: Json | null
          content_type: Database["public"]["Enums"]["multimedia_type"]
          created_at?: string | null
          description?: Json | null
          duration?: string | null
          event_date?: string | null
          file_path: string
          id?: string
          location?: Json | null
          photographer?: string | null
          thumbnail_path?: string | null
          title: Json
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          category?: Json | null
          content_type?: Database["public"]["Enums"]["multimedia_type"]
          created_at?: string | null
          description?: Json | null
          duration?: string | null
          event_date?: string | null
          file_path?: string
          id?: string
          location?: Json | null
          photographer?: string | null
          thumbnail_path?: string | null
          title?: Json
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      multimedia_speakers: {
        Row: {
          citizen_id: string | null
          id: string
          member_id: string | null
          multimedia_id: string | null
          staff_id: string | null
        }
        Insert: {
          citizen_id?: string | null
          id?: string
          member_id?: string | null
          multimedia_id?: string | null
          staff_id?: string | null
        }
        Update: {
          citizen_id?: string | null
          id?: string
          member_id?: string | null
          multimedia_id?: string | null
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "multimedia_speakers_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "verified_citizens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "multimedia_speakers_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "multimedia_speakers_multimedia_id_fkey"
            columns: ["multimedia_id"]
            isOneToOne: false
            referencedRelation: "multimedia_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "multimedia_speakers_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "secretariat_staff"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          author_id: string | null
          body: Json | null
          created_at: string | null
          id: string
          image_url: string | null
          published_at: string | null
          tags: string[] | null
          title: Json
        }
        Insert: {
          author_id?: string | null
          body?: Json | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          tags?: string[] | null
          title: Json
        }
        Update: {
          author_id?: string | null
          body?: Json | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          tags?: string[] | null
          title?: Json
        }
        Relationships: [
          {
            foreignKeyName: "news_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          author_id: string | null
          country_id: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          published_date: string
          source_url: string | null
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          country_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          published_date: string
          source_url?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          country_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          published_date?: string
          source_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_articles_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "member_states"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_articles_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "member_states_with_flag_url"
            referencedColumns: ["id"]
          },
        ]
      }
      news_translations: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          id: string
          language_code: string
          news_article_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          language_code: string
          news_article_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          language_code?: string
          news_article_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_translations_news_article_id_fkey"
            columns: ["news_article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      open_data_audit_logs: {
        Row: {
          accessed_at: string | null
          dataset: string
          filter_criteria: Json | null
          id: string
          ip_address: string | null
          result_count: number | null
          search_query: Json | null
          user_agent: string | null
        }
        Insert: {
          accessed_at?: string | null
          dataset: string
          filter_criteria?: Json | null
          id?: string
          ip_address?: string | null
          result_count?: number | null
          search_query?: Json | null
          user_agent?: string | null
        }
        Update: {
          accessed_at?: string | null
          dataset?: string
          filter_criteria?: Json | null
          id?: string
          ip_address?: string | null
          result_count?: number | null
          search_query?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
      parliament_terms: {
        Row: {
          created_at: string | null
          description: string | null
          end_year: number
          id: string
          is_current: boolean | null
          name: string
          start_year: number
          term_number: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_year: number
          id?: string
          is_current?: boolean | null
          name: string
          start_year: number
          term_number: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_year?: number
          id?: string
          is_current?: boolean | null
          name?: string
          start_year?: number
          term_number?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      parliamentary_position_translations: {
        Row: {
          biography: string | null
          created_at: string | null
          description: string | null
          id: string
          language_code: string
          parliamentary_position_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          biography?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          language_code: string
          parliamentary_position_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          biography?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          language_code?: string
          parliamentary_position_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parliamentary_position_translati_parliamentary_position_id_fkey"
            columns: ["parliamentary_position_id"]
            isOneToOne: false
            referencedRelation: "parliamentary_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      parliamentary_positions: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          member_id: string | null
          position_type: string
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          member_id?: string | null
          position_type: string
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          member_id?: string | null
          position_type?: string
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parliamentary_positions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_id: number
          poll_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_id: number
          poll_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          option_id?: number
          poll_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          context_id: string | null
          context_type: string | null
          created_at: string | null
          end_time: string | null
          id: string
          options: Json
          question: Json
          start_time: string | null
        }
        Insert: {
          context_id?: string | null
          context_type?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          options: Json
          question: Json
          start_time?: string | null
        }
        Update: {
          context_id?: string | null
          context_type?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          options?: Json
          question?: Json
          start_time?: string | null
        }
        Relationships: []
      }
      property_registrations: {
        Row: {
          created_at: string | null
          documents: Json | null
          id: string
          lga: string
          location: string
          property_title: string
          property_type: string
          registration_status: string | null
          state: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          documents?: Json | null
          id?: string
          lga: string
          location: string
          property_title: string
          property_type: string
          registration_status?: string | null
          state: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          documents?: Json | null
          id?: string
          lga?: string
          location?: string
          property_title?: string
          property_type?: string
          registration_status?: string | null
          state?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      real_estate_projects: {
        Row: {
          area_community: string | null
          compliance_status: string | null
          created_at: string | null
          developer_id: string | null
          id: string
          lga: string
          project_id: string
          project_name: string
          state: string
          status: string | null
          units_planned: number | null
          units_sold: number | null
          updated_at: string | null
        }
        Insert: {
          area_community?: string | null
          compliance_status?: string | null
          created_at?: string | null
          developer_id?: string | null
          id?: string
          lga: string
          project_id: string
          project_name: string
          state: string
          status?: string | null
          units_planned?: number | null
          units_sold?: number | null
          updated_at?: string | null
        }
        Update: {
          area_community?: string | null
          compliance_status?: string | null
          created_at?: string | null
          developer_id?: string | null
          id?: string
          lga?: string
          project_id?: string
          project_name?: string
          state?: string
          status?: string | null
          units_planned?: number | null
          units_sold?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      real_estate_transactions: {
        Row: {
          amount: number
          area_community: string | null
          buyer_count: number | null
          created_at: string | null
          developer_agency: string | null
          id: string
          lga: string
          parking: number | null
          project_id: string | null
          property_type: string
          registration_type: string
          rooms: number | null
          seller_count: number | null
          size: number | null
          size_unit: string | null
          state: string
          sub_type: string | null
          transaction_date: string
          transaction_no: string
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          area_community?: string | null
          buyer_count?: number | null
          created_at?: string | null
          developer_agency?: string | null
          id?: string
          lga: string
          parking?: number | null
          project_id?: string | null
          property_type: string
          registration_type: string
          rooms?: number | null
          seller_count?: number | null
          size?: number | null
          size_unit?: string | null
          state: string
          sub_type?: string | null
          transaction_date: string
          transaction_no: string
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          area_community?: string | null
          buyer_count?: number | null
          created_at?: string | null
          developer_agency?: string | null
          id?: string
          lga?: string
          parking?: number | null
          project_id?: string | null
          property_type?: string
          registration_type?: string
          rooms?: number | null
          seller_count?: number | null
          size?: number | null
          size_unit?: string | null
          state?: string
          sub_type?: string | null
          transaction_date?: string
          transaction_no?: string
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      secretariat_position_translations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          language_code: string
          position_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          language_code: string
          position_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          language_code?: string
          position_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "secretariat_position_translations_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "secretariat_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      secretariat_positions: {
        Row: {
          created_at: string | null
          id: string
          order_rank: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_rank?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_rank?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      secretariat_staff: {
        Row: {
          created_at: string | null
          email: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_acting: boolean | null
          is_active: boolean | null
          parliament_term_id: string | null
          position_id: string | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_acting?: boolean | null
          is_active?: boolean | null
          parliament_term_id?: string | null
          position_id?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_acting?: boolean | null
          is_active?: boolean | null
          parliament_term_id?: string | null
          position_id?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "secretariat_staff_parliament_term_id_fkey"
            columns: ["parliament_term_id"]
            isOneToOne: false
            referencedRelation: "parliament_terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secretariat_staff_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "secretariat_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      secretariat_staff_translations: {
        Row: {
          biography: string | null
          created_at: string | null
          id: string
          language_code: string
          name: string
          staff_id: string | null
          updated_at: string | null
        }
        Insert: {
          biography?: string | null
          created_at?: string | null
          id?: string
          language_code: string
          name: string
          staff_id?: string | null
          updated_at?: string | null
        }
        Update: {
          biography?: string | null
          created_at?: string | null
          id?: string
          language_code?: string
          name?: string
          staff_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "secretariat_staff_translations_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "secretariat_staff"
            referencedColumns: ["id"]
          },
        ]
      }
      session_attendees: {
        Row: {
          citizen_id: string | null
          created_at: string | null
          id: string
          member_id: string | null
          role: string | null
          session_id: string | null
          staff_id: string | null
        }
        Insert: {
          citizen_id?: string | null
          created_at?: string | null
          id?: string
          member_id?: string | null
          role?: string | null
          session_id?: string | null
          staff_id?: string | null
        }
        Update: {
          citizen_id?: string | null
          created_at?: string | null
          id?: string
          member_id?: string | null
          role?: string | null
          session_id?: string | null
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_attendees_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "verified_citizens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_attendees_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_attendees_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_attendees_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "secretariat_staff"
            referencedColumns: ["id"]
          },
        ]
      }
      session_documents: {
        Row: {
          created_at: string | null
          file_path: string
          id: string
          session_id: string | null
          title: Json | null
        }
        Insert: {
          created_at?: string | null
          file_path: string
          id?: string
          session_id?: string | null
          title?: Json | null
        }
        Update: {
          created_at?: string | null
          file_path?: string
          id?: string
          session_id?: string | null
          title?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "session_documents_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          agenda: Json | null
          created_at: string | null
          end_date: string | null
          id: string
          live_stream_url: string | null
          location: Json | null
          outcomes: Json | null
          session_type: string
          start_date: string
          status: Database["public"]["Enums"]["session_status"] | null
          title: Json
          updated_at: string | null
        }
        Insert: {
          agenda?: Json | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          live_stream_url?: string | null
          location?: Json | null
          outcomes?: Json | null
          session_type: string
          start_date: string
          status?: Database["public"]["Enums"]["session_status"] | null
          title: Json
          updated_at?: string | null
        }
        Update: {
          agenda?: Json | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          live_stream_url?: string | null
          location?: Json | null
          outcomes?: Json | null
          session_type?: string
          start_date?: string
          status?: Database["public"]["Enums"]["session_status"] | null
          title?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          order_rank: number | null
          page: string
          section: string
          updated_at: string | null
        }
        Insert: {
          content?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_rank?: number | null
          page: string
          section: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_rank?: number | null
          page?: string
          section?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_visits: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          ip_address: string | null
          page_path: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          page_path: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          page_path?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      state_category_mappings: {
        Row: {
          applies_to_all_categories: boolean | null
          category_id: string | null
          created_at: string | null
          id: string
          is_federal_capital: boolean | null
          state: string
          tier_level: string
          updated_at: string | null
        }
        Insert: {
          applies_to_all_categories?: boolean | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_federal_capital?: boolean | null
          state: string
          tier_level: string
          updated_at?: string | null
        }
        Update: {
          applies_to_all_categories?: boolean | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_federal_capital?: boolean | null
          state?: string
          tier_level?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "state_category_mappings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "agent_licensing_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      state_statistics: {
        Row: {
          id: string
          state: string
          total_licensed_professionals: number | null
          total_properties: number | null
          total_transaction_value: number | null
          total_transactions: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          state: string
          total_licensed_professionals?: number | null
          total_properties?: number | null
          total_transaction_value?: number | null
          total_transactions?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          state?: string
          total_licensed_professionals?: number | null
          total_properties?: number | null
          total_transaction_value?: number | null
          total_transactions?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subsidiaries: {
        Row: {
          address: string | null
          code: string
          created_at: string | null
          description: Json | null
          email: string | null
          established: string | null
          full_name: Json
          headquarters: string | null
          id: string
          is_active: boolean | null
          leader_avatar: string | null
          leader_name: string | null
          leader_title: string | null
          logo: string | null
          name: Json
          phone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string | null
          description?: Json | null
          email?: string | null
          established?: string | null
          full_name?: Json
          headquarters?: string | null
          id?: string
          is_active?: boolean | null
          leader_avatar?: string | null
          leader_name?: string | null
          leader_title?: string | null
          logo?: string | null
          name?: Json
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string | null
          description?: Json | null
          email?: string | null
          established?: string | null
          full_name?: Json
          headquarters?: string | null
          id?: string
          is_active?: boolean | null
          leader_avatar?: string | null
          leader_name?: string | null
          leader_title?: string | null
          logo?: string | null
          name?: Json
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      subsidiary_activities: {
        Row: {
          activity_date: string | null
          activity_type: string | null
          category: string | null
          created_at: string | null
          description: Json | null
          id: string
          subsidiary_id: string
          title: Json
        }
        Insert: {
          activity_date?: string | null
          activity_type?: string | null
          category?: string | null
          created_at?: string | null
          description?: Json | null
          id?: string
          subsidiary_id: string
          title?: Json
        }
        Update: {
          activity_date?: string | null
          activity_type?: string | null
          category?: string | null
          created_at?: string | null
          description?: Json | null
          id?: string
          subsidiary_id?: string
          title?: Json
        }
        Relationships: [
          {
            foreignKeyName: "subsidiary_activities_subsidiary_id_fkey"
            columns: ["subsidiary_id"]
            isOneToOne: false
            referencedRelation: "subsidiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      subsidiary_initiatives: {
        Row: {
          budget: string | null
          created_at: string | null
          description: Json | null
          id: string
          progress: number | null
          status: string | null
          subsidiary_id: string
          timeline: string | null
          title: Json
        }
        Insert: {
          budget?: string | null
          created_at?: string | null
          description?: Json | null
          id?: string
          progress?: number | null
          status?: string | null
          subsidiary_id: string
          timeline?: string | null
          title?: Json
        }
        Update: {
          budget?: string | null
          created_at?: string | null
          description?: Json | null
          id?: string
          progress?: number | null
          status?: string | null
          subsidiary_id?: string
          timeline?: string | null
          title?: Json
        }
        Relationships: [
          {
            foreignKeyName: "subsidiary_initiatives_subsidiary_id_fkey"
            columns: ["subsidiary_id"]
            isOneToOne: false
            referencedRelation: "subsidiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          is_verified: boolean | null
          role_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          is_verified?: boolean | null
          role_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          role_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          notes: string | null
          updated_at: string | null
          user_id: string
          verification_date: string | null
          verification_status: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          notes?: string | null
          updated_at?: string | null
          user_id: string
          verification_date?: string | null
          verification_status?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string
          verification_date?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      verified_citizens: {
        Row: {
          created_at: string | null
          date_of_birth: string
          document_number: string
          document_type: string
          document_url: string | null
          full_name: string
          id: string
          member_state_id: string
          status: string
          updated_at: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth: string
          document_number: string
          document_type: string
          document_url?: string | null
          full_name: string
          id?: string
          member_state_id: string
          status?: string
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string
          document_number?: string
          document_type?: string
          document_url?: string | null
          full_name?: string
          id?: string
          member_state_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verified_citizens_member_state_id_fkey"
            columns: ["member_state_id"]
            isOneToOne: false
            referencedRelation: "member_states"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verified_citizens_member_state_id_fkey"
            columns: ["member_state_id"]
            isOneToOne: false
            referencedRelation: "member_states_with_flag_url"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verified_citizens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      member_states_with_flag_url: {
        Row: {
          applied_date: string | null
          area: string | null
          capital: Json | null
          code: string | null
          created_at: string | null
          currency: string | null
          exit_date: string | null
          flag_url: string | null
          id: string | null
          independence: string | null
          joined_ecowas: string | null
          languages: string[] | null
          mp_count: number | null
          name: Json | null
          official_name: Json | null
          population: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          applied_date?: string | null
          area?: string | null
          capital?: Json | null
          code?: string | null
          created_at?: string | null
          currency?: string | null
          exit_date?: string | null
          flag_url?: never
          id?: string | null
          independence?: string | null
          joined_ecowas?: string | null
          languages?: string[] | null
          mp_count?: number | null
          name?: Json | null
          official_name?: Json | null
          population?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          applied_date?: string | null
          area?: string | null
          capital?: Json | null
          code?: string | null
          created_at?: string | null
          currency?: string | null
          exit_date?: string | null
          flag_url?: never
          id?: string | null
          independence?: string | null
          joined_ecowas?: string | null
          languages?: string[] | null
          mp_count?: number | null
          name?: Json | null
          official_name?: Json | null
          population?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "mp"
        | "verified_citizen"
        | "guest"
        | "staff"
        | "moderator"
      multimedia_type: "photo" | "video"
      session_status: "scheduled" | "ongoing" | "completed" | "cancelled"
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
      app_role: [
        "admin",
        "mp",
        "verified_citizen",
        "guest",
        "staff",
        "moderator",
      ],
      multimedia_type: ["photo", "video"],
      session_status: ["scheduled", "ongoing", "completed", "cancelled"],
    },
  },
} as const
