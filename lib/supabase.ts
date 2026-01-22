import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: number;
          name: string;
          status: 'Live' | 'Beta' | 'Coming Soon';
          description: string;
          link: string;
          icon_name: string;
          layout: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          status: 'Live' | 'Beta' | 'Coming Soon';
          description: string;
          link: string;
          icon_name: string;
          layout: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          status?: 'Live' | 'Beta' | 'Coming Soon';
          description?: string;
          link?: string;
          icon_name?: string;
          layout?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      waitlist: {
        Row: {
          id: number;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          email?: string;
          created_at?: string;
        };
      };
      focus_areas: {
        Row: {
          id: number;
          title: string;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          display_order: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
