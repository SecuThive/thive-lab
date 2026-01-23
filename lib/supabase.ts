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
          category?: string;
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
          category?: string;
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
          category?: string;
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
      steam_deals: {
        Row: {
          id: number;
          app_id: string;
          name: string;
          discount_percent: number;
          original_price: number;
          final_price: number;
          steam_deck_compatible: boolean;
          metacritic_score: number | null;
          header_image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          app_id: string;
          name: string;
          discount_percent: number;
          original_price: number;
          final_price: number;
          steam_deck_compatible?: boolean;
          metacritic_score?: number | null;
          header_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          app_id?: string;
          name?: string;
          discount_percent?: number;
          original_price?: number;
          final_price?: number;
          steam_deck_compatible?: boolean;
          metacritic_score?: number | null;
          header_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      movies: {
        Row: {
          id: number;
          tmdb_id: string;
          title: string;
          original_title: string | null;
          release_date: string | null;
          rating: number | null;
          vote_count: number;
          popularity: number;
          overview: string | null;
          poster_path: string | null;
          backdrop_path: string | null;
          genre_ids: number[];
          adult: boolean;
          original_language: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          tmdb_id: string;
          title: string;
          original_title?: string | null;
          release_date?: string | null;
          rating?: number | null;
          vote_count?: number;
          popularity?: number;
          overview?: string | null;
          poster_path?: string | null;
          backdrop_path?: string | null;
          genre_ids?: number[];
          adult?: boolean;
          original_language?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          tmdb_id?: string;
          title?: string;
          original_title?: string | null;
          release_date?: string | null;
          rating?: number | null;
          vote_count?: number;
          popularity?: number;
          overview?: string | null;
          poster_path?: string | null;
          backdrop_path?: string | null;
          genre_ids?: number[];
          adult?: boolean;
          original_language?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
