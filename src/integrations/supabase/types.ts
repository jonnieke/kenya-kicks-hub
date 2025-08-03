export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      matches: {
        Row: {
          api_match_id: string | null
          away_team: string
          created_at: string
          home_team: string
          id: string
          league: string
          match_date: string
          status: string | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          api_match_id?: string | null
          away_team: string
          created_at?: string
          home_team: string
          id?: string
          league: string
          match_date: string
          status?: string | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          api_match_id?: string | null
          away_team?: string
          created_at?: string
          home_team?: string
          id?: string
          league?: string
          match_date?: string
          status?: string | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      prediction_accuracy: {
        Row: {
          actual_score: string | null
          confidence_score: number | null
          created_at: string
          id: string
          match_date: string
          prediction_id: string
          was_correct: boolean | null
        }
        Insert: {
          actual_score?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          match_date: string
          prediction_id: string
          was_correct?: boolean | null
        }
        Update: {
          actual_score?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          match_date?: string
          prediction_id?: string
          was_correct?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "prediction_accuracy_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          ai_model_used: string | null
          away_win_odds: number | null
          confidence_score: number
          created_at: string
          draw_odds: number | null
          home_win_odds: number | null
          id: string
          match_id: string
          predicted_score: string
          reasoning: string | null
          updated_at: string
        }
        Insert: {
          ai_model_used?: string | null
          away_win_odds?: number | null
          confidence_score: number
          created_at?: string
          draw_odds?: number | null
          home_win_odds?: number | null
          id?: string
          match_id: string
          predicted_score: string
          reasoning?: string | null
          updated_at?: string
        }
        Update: {
          ai_model_used?: string | null
          away_win_odds?: number | null
          confidence_score?: number
          created_at?: string
          draw_odds?: number | null
          home_win_odds?: number | null
          id?: string
          match_id?: string
          predicted_score?: string
          reasoning?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          difficulty: string
          explanation: string | null
          id: string
          options: Json
          question: string
          quiz_id: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          difficulty: string
          explanation?: string | null
          id?: string
          options: Json
          question: string
          quiz_id: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          difficulty?: string
          explanation?: string | null
          id?: string
          options?: Json
          question?: string
          quiz_id?: string
        }
        Relationships: []
      }
      quiz_sessions: {
        Row: {
          answers: Json
          completed_at: string | null
          created_at: string
          id: string
          quiz_id: string
          score: number
          time_taken: number | null
          total_questions: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          answers?: Json
          completed_at?: string | null
          created_at?: string
          id?: string
          quiz_id: string
          score?: number
          time_taken?: number | null
          total_questions: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          created_at?: string
          id?: string
          quiz_id?: string
          score?: number
          time_taken?: number | null
          total_questions?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      team_stats: {
        Row: {
          created_at: string
          draws: number | null
          goals_against: number | null
          goals_for: number | null
          id: string
          last_updated: string
          league: string
          losses: number | null
          matches_played: number | null
          recent_form: string | null
          team_name: string
          wins: number | null
        }
        Insert: {
          created_at?: string
          draws?: number | null
          goals_against?: number | null
          goals_for?: number | null
          id?: string
          last_updated?: string
          league: string
          losses?: number | null
          matches_played?: number | null
          recent_form?: string | null
          team_name: string
          wins?: number | null
        }
        Update: {
          created_at?: string
          draws?: number | null
          goals_against?: number | null
          goals_for?: number | null
          id?: string
          last_updated?: string
          league?: string
          losses?: number | null
          matches_played?: number | null
          recent_form?: string | null
          team_name?: string
          wins?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
