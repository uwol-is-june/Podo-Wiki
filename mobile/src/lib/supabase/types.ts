// Copied from src/lib/supabase/types.ts — keep in sync (모바일은 documents/revisions만 사용)
export type Database = {
  public: {
    Tables: {
      documents: {
        Row: {
          slug: string;
          title: string;
          content: string;
          author_id: string | null;
          protected: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          slug: string;
          title: string;
          content?: string;
          author_id?: string | null;
          protected?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          title?: string;
          content?: string;
          author_id?: string | null;
          protected?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      revisions: {
        Row: {
          id: string;
          document_slug: string;
          content: string;
          editor_id: string | null;
          edited_at: string;
          comment: string;
        };
        Insert: {
          id?: string;
          document_slug: string;
          content: string;
          editor_id?: string | null;
          edited_at?: string;
          comment?: string;
        };
        Update: {
          content?: string;
          editor_id?: string | null;
          edited_at?: string;
          comment?: string;
        };
        Relationships: [];
      };
      feature_requests: {
        Row: {
          id: string;
          content: string;
          source: 'app' | 'web';
          status: 'open' | 'done';
          created_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          source?: 'app' | 'web';
          status?: 'open' | 'done';
          created_at?: string;
        };
        Update: {
          content?: string;
          source?: 'app' | 'web';
          status?: 'open' | 'done';
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type Revision = Database["public"]["Tables"]["revisions"]["Row"];
