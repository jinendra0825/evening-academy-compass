export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assignment_submissions: {
        Row: {
          assignment_id: string
          feedback: string | null
          file_name: string | null
          file_type: string | null
          file_url: string | null
          grade: number | null
          graded_at: string | null
          id: string
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          assignment_id: string
          feedback?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          grade?: number | null
          graded_at?: string | null
          id?: string
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          assignment_id?: string
          feedback?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          grade?: number | null
          graded_at?: string | null
          id?: string
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          course_id: string | null
          description: string | null
          due_date: string | null
          file_name: string | null
          file_type: string | null
          file_url: string | null
          id: string
          title: string
        }
        Insert: {
          course_id?: string | null
          description?: string | null
          due_date?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          title: string
        }
        Update: {
          course_id?: string | null
          description?: string | null
          due_date?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          absent_student_ids: string[] | null
          course_id: string | null
          date: string | null
          id: string
          present_student_ids: string[] | null
        }
        Insert: {
          absent_student_ids?: string[] | null
          course_id?: string | null
          date?: string | null
          id?: string
          present_student_ids?: string[] | null
        }
        Update: {
          absent_student_ids?: string[] | null
          course_id?: string | null
          date?: string | null
          id?: string
          present_student_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          course_id: string | null
          created_at: string | null
          id: string
          status: string
          student_id: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          status?: string
          student_id?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          status?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          description: string | null
          id: string
          materials: Json | null
          name: string
          room: string | null
          teacher_id: string | null
        }
        Insert: {
          code: string
          description?: string | null
          id?: string
          materials?: Json | null
          name: string
          room?: string | null
          teacher_id?: string | null
        }
        Update: {
          code?: string
          description?: string | null
          id?: string
          materials?: Json | null
          name?: string
          room?: string | null
          teacher_id?: string | null
        }
        Relationships: []
      }
      grades: {
        Row: {
          assignment_id: string | null
          id: string
          max_score: number | null
          score: number | null
          student_id: string | null
        }
        Insert: {
          assignment_id?: string | null
          id?: string
          max_score?: number | null
          score?: number | null
          student_id?: string | null
        }
        Update: {
          assignment_id?: string | null
          id?: string
          max_score?: number | null
          score?: number | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grades_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          id: string
          recipient_id: string | null
          sender_id: string | null
          sent_at: string | null
        }
        Insert: {
          content?: string | null
          id?: string
          recipient_id?: string | null
          sender_id?: string | null
          sent_at?: string | null
        }
        Update: {
          content?: string | null
          id?: string
          recipient_id?: string | null
          sender_id?: string | null
          sent_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          course_id: string | null
          date: string | null
          id: string
          message: string
          read: boolean | null
          recipientids: string[] | null
          title: string
          type: string
        }
        Insert: {
          course_id?: string | null
          date?: string | null
          id?: string
          message: string
          read?: boolean | null
          recipientids?: string[] | null
          title: string
          type?: string
        }
        Update: {
          course_id?: string | null
          date?: string | null
          id?: string
          message?: string
          read?: boolean | null
          recipientids?: string[] | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          payment_type: string | null
          status: string
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          payment_type?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          payment_type?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string | null
          email: string | null
          fees_paid: boolean | null
          id: string
          name: string | null
          phone: string | null
          role: string
          stripe_customer_id: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          email?: string | null
          fees_paid?: boolean | null
          id: string
          name?: string | null
          phone?: string | null
          role?: string
          stripe_customer_id?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          email?: string | null
          fees_paid?: boolean | null
          id?: string
          name?: string | null
          phone?: string | null
          role?: string
          stripe_customer_id?: string | null
        }
        Relationships: []
      }
      schedule: {
        Row: {
          course_id: string | null
          day_of_week: string | null
          end_time: string | null
          id: string
          start_time: string | null
        }
        Insert: {
          course_id?: string | null
          day_of_week?: string | null
          end_time?: string | null
          id?: string
          start_time?: string | null
        }
        Update: {
          course_id?: string | null
          day_of_week?: string | null
          end_time?: string | null
          id?: string
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          id: string
          notifications_enabled: boolean | null
          theme: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          notifications_enabled?: boolean | null
          theme?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          notifications_enabled?: boolean | null
          theme?: string | null
          user_id?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
