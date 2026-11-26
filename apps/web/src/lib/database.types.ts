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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          company_id: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          company_id: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          company_id?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          code: string
          company_id: string
          created_at: string
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          country_code: string
          created_at: string
          default_currency: string
          default_timezone: string
          id: string
          industry_codes: string[]
          name: string
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          country_code?: string
          created_at?: string
          default_currency?: string
          default_timezone?: string
          id?: string
          industry_codes?: string[]
          name: string
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          default_currency?: string
          default_timezone?: string
          id?: string
          industry_codes?: string[]
          name?: string
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepted_at: string | null
          company_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          revoked_at: string | null
          role_code: string
          token_hash: string
          warehouse_ids: string[]
        }
        Insert: {
          accepted_at?: string | null
          company_id: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          revoked_at?: string | null
          role_code: string
          token_hash: string
          warehouse_ids?: string[]
        }
        Update: {
          accepted_at?: string | null
          company_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          revoked_at?: string | null
          role_code?: string
          token_hash?: string
          warehouse_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_role_code_fkey"
            columns: ["role_code"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["code"]
          },
        ]
      }
      memberships: {
        Row: {
          company_id: string
          created_at: string
          is_owner: boolean
          role_code: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          is_owner?: boolean
          role_code: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          is_owner?: boolean
          role_code?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_role_code_fkey"
            columns: ["role_code"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string
          id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          code: string
          description: string
          name: string
        }
        Insert: {
          code: string
          description?: string
          name: string
        }
        Update: {
          code?: string
          description?: string
          name?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          allows_decimal: boolean
          code: string
          company_id: string
          created_at: string
          id: string
          name: string
          status: string
          symbol: string
          updated_at: string
        }
        Insert: {
          allows_decimal?: boolean
          code: string
          company_id: string
          created_at?: string
          id?: string
          name: string
          status?: string
          symbol: string
          updated_at?: string
        }
        Update: {
          allows_decimal?: boolean
          code?: string
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          status?: string
          symbol?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_warehouses: {
        Row: {
          assigned_at: string
          company_id: string
          user_id: string
          warehouse_id: string
        }
        Insert: {
          assigned_at?: string
          company_id: string
          user_id: string
          warehouse_id: string
        }
        Update: {
          assigned_at?: string
          company_id?: string
          user_id?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_warehouses_company_id_user_id_fkey"
            columns: ["company_id", "user_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["company_id", "user_id"]
          },
          {
            foreignKeyName: "user_warehouses_company_id_warehouse_id_fkey"
            columns: ["company_id", "warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["company_id", "id"]
          },
        ]
      }
      warehouse_regions: {
        Row: {
          company_id: string
          created_at: string
          description: string
          id: string
          name: string
          status: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string
          id?: string
          name: string
          status?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_regions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          code: string
          company_id: string
          country_code: string
          created_at: string
          id: string
          name: string
          region_id: string | null
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          code: string
          company_id: string
          country_code?: string
          created_at?: string
          id?: string
          name: string
          region_id?: string | null
          status?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          code?: string
          company_id?: string
          country_code?: string
          created_at?: string
          id?: string
          name?: string
          region_id?: string | null
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouses_company_id_region_id_fkey"
            columns: ["company_id", "region_id"]
            isOneToOne: false
            referencedRelation: "warehouse_regions"
            referencedColumns: ["company_id", "id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_access_context: { Args: never; Returns: Json }
      accept_invitation: {
        Args: { invitation_token: string }
        Returns: undefined
      }
      can_access_warehouse: { Args: { target_id: string }; Returns: boolean }
      create_company: {
        Args: {
          company_name: string
          company_slug: string
          country?: string
          currency?: string
          timezone_name?: string
        }
        Returns: string
      }
      create_company_invitation: {
        Args: {
          expires_in_hours?: number
          invited_role: string
          invitee_email: string
          warehouse_ids?: string[]
        }
        Returns: {
          expires_at: string
          invitation_id: string
          invitation_token: string
        }[]
      }
      current_company_id: { Args: never; Returns: string }
      current_role: { Args: never; Returns: string }
      list_company_members: {
        Args: never
        Returns: {
          email: string
          full_name: string
          is_owner: boolean
          membership_status: string
          role_code: string
          user_id: string
          warehouse_codes: string[]
          warehouse_ids: string[]
        }[]
      }
      onboard_company: {
        Args: {
          company_name: string
          company_slug: string
          industry_code?: string
        }
        Returns: string
      }
      transfer_company_ownership: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      update_company_member: {
        Args: {
          next_role_code: string
          next_status: string
          target_user_id: string
          warehouse_ids?: string[]
        }
        Returns: undefined
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
