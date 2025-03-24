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
      gemach_images: {
        Row: {
          created_at: string | null
          gemach_id: string | null
          id: string
          is_primary: boolean | null
          storage_path: string
        }
        Insert: {
          created_at?: string | null
          gemach_id?: string | null
          id?: string
          is_primary?: boolean | null
          storage_path: string
        }
        Update: {
          created_at?: string | null
          gemach_id?: string | null
          id?: string
          is_primary?: boolean | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "gemach_images_gemach_id_fkey"
            columns: ["gemach_id"]
            isOneToOne: false
            referencedRelation: "gemachs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gemach_images_gemach_id_fkey"
            columns: ["gemach_id"]
            isOneToOne: false
            referencedRelation: "pending_gemachs"
            referencedColumns: ["id"]
          },
        ]
      }
      gemachs: {
        Row: {
          address: string
          category: string
          city: string | null
          created_at: string | null
          description: string
          email: string | null
          facebook_url: string | null
          featured: boolean | null
          fee_details: string | null
          has_fee: boolean | null
          hours: string
          id: string
          is_approved: boolean | null
          lat: number | null
          lng: number | null
          location_instructions: string | null
          manager_phone: string | null
          name: string
          neighborhood: string
          owner_id: string | null
          phone: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          address: string
          category: string
          city?: string | null
          created_at?: string | null
          description: string
          email?: string | null
          facebook_url?: string | null
          featured?: boolean | null
          fee_details?: string | null
          has_fee?: boolean | null
          hours: string
          id?: string
          is_approved?: boolean | null
          lat?: number | null
          lng?: number | null
          location_instructions?: string | null
          manager_phone?: string | null
          name: string
          neighborhood: string
          owner_id?: string | null
          phone: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string
          category?: string
          city?: string | null
          created_at?: string | null
          description?: string
          email?: string | null
          facebook_url?: string | null
          featured?: boolean | null
          fee_details?: string | null
          has_fee?: boolean | null
          hours?: string
          id?: string
          is_approved?: boolean | null
          lat?: number | null
          lng?: number | null
          location_instructions?: string | null
          manager_phone?: string | null
          name?: string
          neighborhood?: string
          owner_id?: string | null
          phone?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          is_admin: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          is_admin?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          gemach_id: string | null
          id: string
          rating: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          gemach_id?: string | null
          id?: string
          rating: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          gemach_id?: string | null
          id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_gemach_id_fkey"
            columns: ["gemach_id"]
            isOneToOne: false
            referencedRelation: "gemachs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_gemach_id_fkey"
            columns: ["gemach_id"]
            isOneToOne: false
            referencedRelation: "pending_gemachs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      pending_gemachs: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          created_at: string | null
          description: string | null
          email: string | null
          facebook_url: string | null
          featured: boolean | null
          fee_details: string | null
          has_fee: boolean | null
          hours: string | null
          id: string | null
          is_approved: boolean | null
          lat: number | null
          lng: number | null
          location_instructions: string | null
          manager_phone: string | null
          name: string | null
          neighborhood: string | null
          owner_email: string | null
          owner_id: string | null
          phone: string | null
          updated_at: string | null
          website_url: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
