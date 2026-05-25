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
      admin_notifications: {
        Row: {
          created_at: string
          id: string
          payload: Json
          read_at: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json
          read_at?: string | null
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          read_at?: string | null
          type?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          image_url: string | null
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          profile_id: string
          token_hash: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          profile_id: string
          token_hash: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          profile_id?: string
          token_hash?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "password_reset_tokens_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "password_reset_tokens_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          adresse: string | null
          contact: string | null
          created_at: string
          direction: string | null
          domaines_expertise: string | null
          email: string | null
          fonction: string | null
          formation_initiale: string | null
          grade: Database["public"]["Enums"]["grade_type"]
          id: string
          ministere: string | null
          nom: string
          password_hash: string
          photo_url: string | null
          prenoms: string
          profession: string | null
          promotion_ena: string | null
          role_assoc: Database["public"]["Enums"]["app_role_assoc"] | null
          sexe: Database["public"]["Enums"]["sex_type"]
          specialisation_ena: string | null
          status: Database["public"]["Enums"]["profile_status"]
          updated_at: string
          user_id: string | null
          valeurs: string | null
        }
        Insert: {
          adresse?: string | null
          contact?: string | null
          created_at?: string
          direction?: string | null
          domaines_expertise?: string | null
          email?: string | null
          fonction?: string | null
          formation_initiale?: string | null
          grade: Database["public"]["Enums"]["grade_type"]
          id?: string
          ministere?: string | null
          nom: string
          password_hash: string
          photo_url?: string | null
          prenoms: string
          profession?: string | null
          promotion_ena?: string | null
          role_assoc?: Database["public"]["Enums"]["app_role_assoc"] | null
          sexe?: Database["public"]["Enums"]["sex_type"]
          specialisation_ena?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
          user_id?: string | null
          valeurs?: string | null
        }
        Update: {
          adresse?: string | null
          contact?: string | null
          created_at?: string
          direction?: string | null
          domaines_expertise?: string | null
          email?: string | null
          fonction?: string | null
          formation_initiale?: string | null
          grade?: Database["public"]["Enums"]["grade_type"]
          id?: string
          ministere?: string | null
          nom?: string
          password_hash?: string
          photo_url?: string | null
          prenoms?: string
          profession?: string | null
          promotion_ena?: string | null
          role_assoc?: Database["public"]["Enums"]["app_role_assoc"] | null
          sexe?: Database["public"]["Enums"]["sex_type"]
          specialisation_ena?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
          user_id?: string | null
          valeurs?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      profiles_public: {
        Row: {
          adresse: string | null
          contact: string | null
          created_at: string | null
          direction: string | null
          domaines_expertise: string | null
          email: string | null
          fonction: string | null
          formation_initiale: string | null
          grade: Database["public"]["Enums"]["grade_type"] | null
          id: string | null
          ministere: string | null
          nom: string | null
          photo_url: string | null
          prenoms: string | null
          profession: string | null
          promotion_ena: string | null
          role_assoc: Database["public"]["Enums"]["app_role_assoc"] | null
          sexe: Database["public"]["Enums"]["sex_type"] | null
          specialisation_ena: string | null
          updated_at: string | null
          user_id: string | null
          valeurs: string | null
        }
        Insert: {
          adresse?: string | null
          contact?: string | null
          created_at?: string | null
          direction?: string | null
          domaines_expertise?: string | null
          email?: string | null
          fonction?: string | null
          formation_initiale?: string | null
          grade?: Database["public"]["Enums"]["grade_type"] | null
          id?: string | null
          ministere?: string | null
          nom?: string | null
          photo_url?: string | null
          prenoms?: string | null
          profession?: string | null
          promotion_ena?: string | null
          role_assoc?: Database["public"]["Enums"]["app_role_assoc"] | null
          sexe?: Database["public"]["Enums"]["sex_type"] | null
          specialisation_ena?: string | null
          updated_at?: string | null
          user_id?: string | null
          valeurs?: string | null
        }
        Update: {
          adresse?: string | null
          contact?: string | null
          created_at?: string | null
          direction?: string | null
          domaines_expertise?: string | null
          email?: string | null
          fonction?: string | null
          formation_initiale?: string | null
          grade?: Database["public"]["Enums"]["grade_type"] | null
          id?: string | null
          ministere?: string | null
          nom?: string | null
          photo_url?: string | null
          prenoms?: string | null
          profession?: string | null
          promotion_ena?: string | null
          role_assoc?: Database["public"]["Enums"]["app_role_assoc"] | null
          sexe?: Database["public"]["Enums"]["sex_type"] | null
          specialisation_ena?: string | null
          updated_at?: string | null
          user_id?: string | null
          valeurs?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      app_role_assoc:
        | "president"
        | "vice_president"
        | "secretaire_general"
        | "tresorier_principal"
        | "secretaire_national"
        | "membre_fondateur"
        | "membre_actif"
      grade_type: "A7" | "A6" | "A5" | "A4" | "A3" | "B3"
      profile_status: "pending" | "approved" | "rejected"
      sex_type: "Homme" | "Femme"
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
      app_role: ["admin", "moderator", "user"],
      app_role_assoc: [
        "president",
        "vice_president",
        "secretaire_general",
        "tresorier_principal",
        "secretaire_national",
        "membre_fondateur",
        "membre_actif",
      ],
      grade_type: ["A7", "A6", "A5", "A4", "A3", "B3"],
      profile_status: ["pending", "approved", "rejected"],
      sex_type: ["Homme", "Femme"],
    },
  },
} as const
