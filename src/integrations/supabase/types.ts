// Mock types to avoid build errors with Supabase

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
      gemachs: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          description: string;
          category: string;
          neighborhood: string;
          address: string;
          phone_number: string;
          alt_phone_number: string | null;
          email: string | null;
          website: string | null;
          location_instructions: string | null;
          payment_method: string | null;
          is_free: boolean;
          user_id: string;
          status: 'pending' | 'approved' | 'rejected';
        };
        Insert: Omit<Database['public']['Tables']['gemachs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['gemachs']['Row']>;
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          is_admin: boolean;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['users']['Row']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
