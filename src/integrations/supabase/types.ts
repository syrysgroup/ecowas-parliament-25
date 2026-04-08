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
      admin_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          performed_by: string | null
          target_user: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          performed_by?: string | null
          target_user?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          performed_by?: string | null
          target_user?: string | null
        }
        Relationships: []
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
      budget_items: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          status?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_nominee_leaderboard"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "budget_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_representatives"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          scheduled_at: string | null
          status: string
          target_audience: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          scheduled_at?: string | null
          status?: string
          target_audience?: string | null
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          scheduled_at?: string | null
          status?: string
          target_audience?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      channel_members: {
        Row: {
          channel_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_messages: {
        Row: {
          body: string
          channel_id: string
          deleted_at: string | null
          delivered_at: string | null
          id: string
          read_at: string | null
          sender_id: string
          sent_at: string
        }
        Insert: {
          body: string
          channel_id: string
          deleted_at?: string | null
          delivered_at?: string | null
          id?: string
          read_at?: string | null
          sender_id: string
          sent_at?: string
        }
        Update: {
          body?: string
          channel_id?: string
          deleted_at?: string | null
          delivered_at?: string | null
          id?: string
          read_at?: string | null
          sender_id?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_nominee_leaderboard"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "channel_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_representatives"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      channels: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_archived: boolean
          name: string
          type: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_archived?: boolean
          name: string
          type?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_archived?: boolean
          name?: string
          type?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          body: string
          deleted_at: string | null
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
          sent_at: string
        }
        Insert: {
          body: string
          deleted_at?: string | null
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
          sent_at?: string
        }
        Update: {
          body?: string
          deleted_at?: string | null
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          sent_at?: string
        }
        Relationships: []
      }
      cms_pages: {
        Row: {
          content: string | null
          created_at: string
          id: string
          last_edited_by: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          last_edited_by?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          last_edited_by?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string | null
          id: string
          message: string | null
          name: string | null
          phone: string | null
          source_page: string | null
          visitor_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          phone?: string | null
          source_page?: string | null
          visitor_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          phone?: string | null
          source_page?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_submissions_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "site_visitors"
            referencedColumns: ["id"]
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
      crm_calendar_events: {
        Row: {
          all_day: boolean
          colour: string
          created_at: string
          created_by: string
          description: string | null
          end_time: string | null
          id: string
          start_time: string
          title: string
        }
        Insert: {
          all_day?: boolean
          colour?: string
          created_at?: string
          created_by: string
          description?: string | null
          end_time?: string | null
          id?: string
          start_time: string
          title: string
        }
        Update: {
          all_day?: boolean
          colour?: string
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string | null
          id?: string
          start_time?: string
          title?: string
        }
        Relationships: []
      }
      crm_messages: {
        Row: {
          body: string
          from_user_id: string
          id: string
          is_archived: boolean
          is_read: boolean
          label: string | null
          sent_at: string
          subject: string
          thread_id: string | null
          to_email: string | null
          to_user_id: string | null
        }
        Insert: {
          body: string
          from_user_id: string
          id?: string
          is_archived?: boolean
          is_read?: boolean
          label?: string | null
          sent_at?: string
          subject: string
          thread_id?: string | null
          to_email?: string | null
          to_user_id?: string | null
        }
        Update: {
          body?: string
          from_user_id?: string
          id?: string
          is_archived?: boolean
          is_read?: boolean
          label?: string | null
          sent_at?: string
          subject?: string
          thread_id?: string | null
          to_email?: string | null
          to_user_id?: string | null
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          body: string
          deleted_at: string | null
          delivered_at: string | null
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
          sent_at: string
        }
        Insert: {
          body: string
          deleted_at?: string | null
          delivered_at?: string | null
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
          sent_at?: string
        }
        Update: {
          body?: string
          deleted_at?: string | null
          delivered_at?: string | null
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          sent_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string
          created_at: string
          file_size_kb: number | null
          file_type: string
          file_url: string | null
          id: string
          language: string
          restricted: boolean
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          file_size_kb?: number | null
          file_type?: string
          file_url?: string | null
          id?: string
          language?: string
          restricted?: boolean
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          file_size_kb?: number | null
          file_type?: string
          file_url?: string | null
          id?: string
          language?: string
          restricted?: boolean
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "public_nominee_leaderboard"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "public_representatives"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      email_accounts: {
        Row: {
          created_at: string
          display_name: string | null
          email_address: string
          id: string
          is_active: boolean
          user_id: string
          zoho_account_id: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email_address: string
          id?: string
          is_active?: boolean
          user_id: string
          zoho_account_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email_address?: string
          id?: string
          is_active?: boolean
          user_id?: string
          zoho_account_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_nominee_leaderboard"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "email_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_representatives"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      emails: {
        Row: {
          account_id: string
          body_html: string
          body_text: string
          cc_address: string | null
          folder: string
          from_address: string
          from_name: string
          has_attachments: boolean
          id: string
          is_read: boolean
          is_starred: boolean
          sent_at: string | null
          subject: string
          synced_at: string | null
          to_address: string
          zoho_message_id: string | null
        }
        Insert: {
          account_id: string
          body_html?: string
          body_text?: string
          cc_address?: string | null
          folder?: string
          from_address?: string
          from_name?: string
          has_attachments?: boolean
          id?: string
          is_read?: boolean
          is_starred?: boolean
          sent_at?: string | null
          subject?: string
          synced_at?: string | null
          to_address?: string
          zoho_message_id?: string | null
        }
        Update: {
          account_id?: string
          body_html?: string
          body_text?: string
          cc_address?: string | null
          folder?: string
          from_address?: string
          from_name?: string
          has_attachments?: boolean
          id?: string
          is_read?: boolean
          is_starred?: boolean
          sent_at?: string | null
          subject?: string
          synced_at?: string | null
          to_address?: string
          zoho_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emails_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "email_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          country: string | null
          created_at: string
          email: string
          event_id: string
          id: string
          name: string
          organisation: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          email: string
          event_id: string
          id?: string
          name: string
          organisation?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          email?: string
          event_id?: string
          id?: string
          name?: string
          organisation?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          country: string | null
          cover_image_url: string | null
          created_at: string
          date: string
          description: string | null
          end_date: string | null
          external_links: Json | null
          id: string
          is_published: boolean
          location: string | null
          programme: string | null
          registration_type: string
          registration_url: string | null
          related_event_ids: string[] | null
          tag: string | null
          tag_color: string | null
          title: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          date: string
          description?: string | null
          end_date?: string | null
          external_links?: Json | null
          id?: string
          is_published?: boolean
          location?: string | null
          programme?: string | null
          registration_type?: string
          registration_url?: string | null
          related_event_ids?: string[] | null
          tag?: string | null
          tag_color?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          date?: string
          description?: string | null
          end_date?: string | null
          external_links?: Json | null
          id?: string
          is_published?: boolean
          location?: string | null
          programme?: string | null
          registration_type?: string
          registration_url?: string | null
          related_event_ids?: string[] | null
          tag?: string | null
          tag_color?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      global_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          id?: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount: number | null
          description: string
          id: string
          invoice_id: string
          quantity: number
          sort_order: number
          unit_price: number
        }
        Insert: {
          amount?: number | null
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          sort_order?: number
          unit_price?: number
        }
        Update: {
          amount?: number | null
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          sort_order?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number | null
          balance: number | null
          client_address: string | null
          client_company: string | null
          client_country: string | null
          client_email: string | null
          client_name: string
          created_at: string
          created_by: string | null
          currency: string | null
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          status: string
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          total: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          balance?: number | null
          client_address?: string | null
          client_company?: string | null
          client_country?: string | null
          client_email?: string | null
          client_name: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          balance?: number | null
          client_address?: string | null
          client_company?: string | null
          client_country?: string | null
          client_email?: string | null
          client_name?: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_nominee_leaderboard"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_representatives"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      media_kit_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_order: number
          file_type: string
          file_url: string | null
          id: string
          is_published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number
          file_type?: string
          file_url?: string | null
          id?: string
          is_published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number
          file_type?: string
          file_url?: string | null
          id?: string
          is_published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          author_id: string | null
          content: string | null
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          external_links: Json | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          external_links?: Json | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          external_links?: Json | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_nominee_leaderboard"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "news_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_representatives"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
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
      partners: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          lead_image_url: string | null
          lead_name: string | null
          lead_role: string | null
          logo_url: string | null
          long_description: string[] | null
          name: string
          partner_type: string
          slug: string
          social_links: Json | null
          sort_order: number
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          lead_image_url?: string | null
          lead_name?: string | null
          lead_role?: string | null
          logo_url?: string | null
          long_description?: string[] | null
          name: string
          partner_type?: string
          slug: string
          social_links?: Json | null
          sort_order?: number
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          lead_image_url?: string | null
          lead_name?: string | null
          lead_role?: string | null
          logo_url?: string | null
          long_description?: string[] | null
          name?: string
          partner_type?: string
          slug?: string
          social_links?: Json | null
          sort_order?: number
          updated_at?: string
          website?: string | null
        }
        Relationships: []
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
          has_email_account: boolean
          id: string
          is_active: boolean
          is_public: boolean
          linkedin_url: string | null
          notification_email: string | null
          organisation: string | null
          phone: string | null
          show_on_website: boolean
          title: string | null
          twitter_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country: string
          created_at?: string
          date_of_birth?: string | null
          email: string
          full_name: string
          has_email_account?: boolean
          id: string
          is_active?: boolean
          is_public?: boolean
          linkedin_url?: string | null
          notification_email?: string | null
          organisation?: string | null
          phone?: string | null
          show_on_website?: boolean
          title?: string | null
          twitter_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string
          has_email_account?: boolean
          id?: string
          is_active?: boolean
          is_public?: boolean
          linkedin_url?: string | null
          notification_email?: string | null
          organisation?: string | null
          phone?: string | null
          show_on_website?: boolean
          title?: string | null
          twitter_url?: string | null
        }
        Relationships: []
      }
      programme_pillars: {
        Row: {
          color: string | null
          created_at: string
          display_order: number
          emoji: string | null
          icon_bg: string | null
          id: string
          is_active: boolean
          lead_name: string | null
          progress_percent: number
          route: string | null
          slug: string
          sponsors: string[]
          title: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          display_order?: number
          emoji?: string | null
          icon_bg?: string | null
          id?: string
          is_active?: boolean
          lead_name?: string | null
          progress_percent?: number
          route?: string | null
          slug: string
          sponsors?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          display_order?: number
          emoji?: string | null
          icon_bg?: string | null
          id?: string
          is_active?: boolean
          lead_name?: string | null
          progress_percent?: number
          route?: string | null
          slug?: string
          sponsors?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_emails: {
        Row: {
          created_at: string
          created_by: string | null
          display_name: string
          email_handle: string
          id: string
          is_active: boolean
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_name: string
          email_handle: string
          id?: string
          is_active?: boolean
          project_id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_name?: string
          email_handle?: string
          id?: string
          is_active?: boolean
          project_id?: string
          user_id?: string
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
      role_permissions: {
        Row: {
          can_create: boolean
          can_delete: boolean
          can_edit: boolean
          can_view: boolean
          id: string
          module: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          id?: string
          module: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          id?: string
          module?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content: Json
          id: string
          section_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          id?: string
          section_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          id?: string
          section_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_content_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_content_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "public_nominee_leaderboard"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "site_content_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "public_representatives"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      site_visitors: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          current_page: string | null
          device: string | null
          id: string
          ip_address: string | null
          referrer: string | null
          session_id: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          current_page?: string | null
          device?: string | null
          id?: string
          ip_address?: string | null
          referrer?: string | null
          session_id?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          current_page?: string | null
          device?: string | null
          id?: string
          ip_address?: string | null
          referrer?: string | null
          session_id?: string | null
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          about: string | null
          acronym: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_ecowas_sponsor: boolean | null
          is_published: boolean
          logo_url: string | null
          name: string
          programmes: string[] | null
          slug: string
          sort_order: number
          tier: string
          updated_at: string
          website: string | null
        }
        Insert: {
          about?: string | null
          acronym?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_ecowas_sponsor?: boolean | null
          is_published?: boolean
          logo_url?: string | null
          name: string
          programmes?: string[] | null
          slug: string
          sort_order?: number
          tier?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          about?: string | null
          acronym?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_ecowas_sponsor?: boolean | null
          is_published?: boolean
          logo_url?: string | null
          name?: string
          programmes?: string[] | null
          slug?: string
          sort_order?: number
          tier?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      stakeholder_profiles: {
        Row: {
          category: string
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          title: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_id: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          pillar: string | null
          priority: string
          status: string
          title: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          pillar?: string | null
          priority?: string
          status?: string
          title: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          pillar?: string | null
          priority?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          avatar_url: string | null
          bio: string | null
          category: string
          created_at: string
          display_order: number
          full_name: string
          id: string
          is_active: boolean
          organisation: string | null
          title: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          category?: string
          created_at?: string
          display_order?: number
          full_name: string
          id?: string
          is_active?: boolean
          organisation?: string | null
          title?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          category?: string
          created_at?: string
          display_order?: number
          full_name?: string
          id?: string
          is_active?: boolean
          organisation?: string | null
          title?: string | null
        }
        Relationships: []
      }
      user_email_settings: {
        Row: {
          auto_connect: boolean | null
          imap_host: string | null
          imap_port: number | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_user: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_connect?: boolean | null
          imap_host?: string | null
          imap_port?: number | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_connect?: boolean | null
          imap_host?: string | null
          imap_port?: number | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_email_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_email_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_nominee_leaderboard"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_email_settings_user_id_fkey"
            columns: ["user_id"]
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
      is_crm_staff:
        | { Args: never; Returns: boolean }
        | { Args: { _user_id: string }; Returns: boolean }
      next_invoice_number: { Args: never; Returns: string }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "super_admin"
        | "sponsor"
        | "media"
        | "project_director"
        | "programme_lead"
        | "website_editor"
        | "marketing_manager"
        | "communications_officer"
        | "finance_coordinator"
        | "logistics_coordinator"
        | "sponsor_manager"
        | "consultant"
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
        "moderator",
        "super_admin",
        "sponsor",
        "media",
        "project_director",
        "programme_lead",
        "website_editor",
        "marketing_manager",
        "communications_officer",
        "finance_coordinator",
        "logistics_coordinator",
        "sponsor_manager",
        "consultant",
      ],
    },
  },
} as const
