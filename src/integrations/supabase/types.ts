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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      chunk_feedback: {
        Row: {
          chunk_id: string | null
          created_at: string
          id: string
          reason: string
          session_id: string | null
          tool_slug: string
        }
        Insert: {
          chunk_id?: string | null
          created_at?: string
          id?: string
          reason: string
          session_id?: string | null
          tool_slug: string
        }
        Update: {
          chunk_id?: string | null
          created_at?: string
          id?: string
          reason?: string
          session_id?: string | null
          tool_slug?: string
        }
        Relationships: []
      }
      chunk_progress: {
        Row: {
          chunk_id: string
          id: string
          last_position: Json
          read_percent: number
          session_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chunk_id: string
          id?: string
          last_position?: Json
          read_percent?: number
          session_id?: string | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chunk_id?: string
          id?: string
          last_position?: Json
          read_percent?: number
          session_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chunk_progress_chunk_id_fkey"
            columns: ["chunk_id"]
            isOneToOne: false
            referencedRelation: "chunks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chunk_progress_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chunks: {
        Row: {
          chunk_type: string
          content: string
          created_at: string
          id: string
          priority: number
          tags_audience: string[]
          tags_confidence: string[]
          tags_ladder_stage: number | null
          tags_use_case: string[]
          title: string | null
          tool_id: string
          updated_at: string
        }
        Insert: {
          chunk_type: string
          content: string
          created_at?: string
          id?: string
          priority?: number
          tags_audience?: string[]
          tags_confidence?: string[]
          tags_ladder_stage?: number | null
          tags_use_case?: string[]
          title?: string | null
          tool_id: string
          updated_at?: string
        }
        Update: {
          chunk_type?: string
          content?: string
          created_at?: string
          id?: string
          priority?: number
          tags_audience?: string[]
          tags_confidence?: string[]
          tags_ladder_stage?: number | null
          tags_use_case?: string[]
          title?: string | null
          tool_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chunks_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          session_id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_id: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      email_captures: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          session_id: string | null
          subscribed: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          session_id?: string | null
          subscribed?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          session_id?: string | null
          subscribed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "email_captures_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      learning_events: {
        Row: {
          created_at: string
          event_type: Database["public"]["Enums"]["learning_event_type"]
          id: string
          payload: Json
          plan_id: string
          step_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: Database["public"]["Enums"]["learning_event_type"]
          id?: string
          payload?: Json
          plan_id: string
          step_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: Database["public"]["Enums"]["learning_event_type"]
          id?: string
          payload?: Json
          plan_id?: string
          step_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_events_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "learning_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_events_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "learning_plan_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_plan_steps: {
        Row: {
          completed_at: string | null
          created_at: string
          estimated_minutes: number | null
          foundation_slug: string | null
          id: string
          instruction: string
          metadata: Json
          plan_id: string
          position: number
          primary_chunk_id: string | null
          purpose: string
          status: Database["public"]["Enums"]["learning_step_status"]
          step_kind: string
          title: string
          tool_slug: string | null
          unlock_rule: Json
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          estimated_minutes?: number | null
          foundation_slug?: string | null
          id?: string
          instruction: string
          metadata?: Json
          plan_id: string
          position: number
          primary_chunk_id?: string | null
          purpose: string
          status?: Database["public"]["Enums"]["learning_step_status"]
          step_kind: string
          title: string
          tool_slug?: string | null
          unlock_rule?: Json
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          estimated_minutes?: number | null
          foundation_slug?: string | null
          id?: string
          instruction?: string
          metadata?: Json
          plan_id?: string
          position?: number
          primary_chunk_id?: string | null
          purpose?: string
          status?: Database["public"]["Enums"]["learning_step_status"]
          step_kind?: string
          title?: string
          tool_slug?: string | null
          unlock_rule?: Json
        }
        Relationships: [
          {
            foreignKeyName: "learning_plan_steps_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "learning_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_plan_steps_primary_chunk_id_fkey"
            columns: ["primary_chunk_id"]
            isOneToOne: false
            referencedRelation: "chunks"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_plans: {
        Row: {
          active_tool_slugs: string[]
          created_at: string
          current_step_id: string | null
          id: string
          lane: Database["public"]["Enums"]["learning_lane"]
          plan_version: number
          rationale: Json
          session_id: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active_tool_slugs?: string[]
          created_at?: string
          current_step_id?: string | null
          id?: string
          lane: Database["public"]["Enums"]["learning_lane"]
          plan_version?: number
          rationale?: Json
          session_id: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active_tool_slugs?: string[]
          created_at?: string
          current_step_id?: string | null
          id?: string
          lane?: Database["public"]["Enums"]["learning_lane"]
          plan_version?: number
          rationale?: Json
          session_id?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_plans_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action: string
          count: number
          created_at: string
          id: string
          identifier: string
          window_start: string
        }
        Insert: {
          action: string
          count?: number
          created_at?: string
          id?: string
          identifier: string
          window_start?: string
        }
        Update: {
          action?: string
          count?: number
          created_at?: string
          id?: string
          identifier?: string
          window_start?: string
        }
        Relationships: []
      }
      saved_chunks: {
        Row: {
          chunk_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          chunk_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          chunk_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_chunks_chunk_id_fkey"
            columns: ["chunk_id"]
            isOneToOne: false
            referencedRelation: "chunks"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          ai_pick_reasoning: Json | null
          ai_picked_at: string | null
          ai_picked_tools: string[] | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          onboarding_existing_tools: string[] | null
          onboarding_role: string | null
          onboarding_time_budget: string | null
          q2_audience: string | null
          q3_other_text: string | null
          q3_use_case: string | null
          q4_confidence: string | null
          q5_learning_style: string | null
          result_payload: Json | null
          stack_label: string | null
          user_id: string | null
        }
        Insert: {
          ai_pick_reasoning?: Json | null
          ai_picked_at?: string | null
          ai_picked_tools?: string[] | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          onboarding_existing_tools?: string[] | null
          onboarding_role?: string | null
          onboarding_time_budget?: string | null
          q2_audience?: string | null
          q3_other_text?: string | null
          q3_use_case?: string | null
          q4_confidence?: string | null
          q5_learning_style?: string | null
          result_payload?: Json | null
          stack_label?: string | null
          user_id?: string | null
        }
        Update: {
          ai_pick_reasoning?: Json | null
          ai_picked_at?: string | null
          ai_picked_tools?: string[] | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          onboarding_existing_tools?: string[] | null
          onboarding_role?: string | null
          onboarding_time_budget?: string | null
          q2_audience?: string | null
          q3_other_text?: string | null
          q3_use_case?: string | null
          q4_confidence?: string | null
          q5_learning_style?: string | null
          result_payload?: Json | null
          stack_label?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      tools: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          slug: string
          source_doc: string | null
          status: string
          tagline: string | null
          tool_number: string | null
          update_message: string | null
          updated_at: string
          when_not_to_use: string | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          name: string
          slug: string
          source_doc?: string | null
          status?: string
          tagline?: string | null
          tool_number?: string | null
          update_message?: string | null
          updated_at?: string
          when_not_to_use?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          slug?: string
          source_doc?: string | null
          status?: string
          tagline?: string | null
          tool_number?: string | null
          update_message?: string | null
          updated_at?: string
          when_not_to_use?: string | null
        }
        Relationships: []
      }
      user_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          summary: string | null
          summary_updated_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          summary?: string | null
          summary_updated_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          summary?: string | null
          summary_updated_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_action: string
          p_identifier: string
          p_max_count: number
          p_window_seconds: number
        }
        Returns: boolean
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      learning_event_type:
        | "plan_created"
        | "step_opened"
        | "step_completed"
        | "step_skipped"
        | "chunk_saved"
        | "note_added"
        | "resume_position_saved"
        | "plan_repaired"
      learning_lane: "starting" | "comfortable"
      learning_step_status:
        | "locked"
        | "available"
        | "in_progress"
        | "done"
        | "skipped"
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
      learning_event_type: [
        "plan_created",
        "step_opened",
        "step_completed",
        "step_skipped",
        "chunk_saved",
        "note_added",
        "resume_position_saved",
        "plan_repaired",
      ],
      learning_lane: ["starting", "comfortable"],
      learning_step_status: [
        "locked",
        "available",
        "in_progress",
        "done",
        "skipped",
      ],
    },
  },
} as const
