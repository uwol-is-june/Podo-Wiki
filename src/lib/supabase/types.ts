export type Database = {
  public: {
    Tables: {
      documents: {
        Row: {
          slug: string;
          title: string;
          content: string;
          author_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          slug: string;
          title: string;
          content?: string;
          author_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          title?: string;
          content?: string;
          author_id?: string | null;
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
        };
        Insert: {
          id?: string;
          document_slug: string;
          content: string;
          editor_id?: string | null;
          edited_at?: string;
        };
        Update: {
          content?: string;
          editor_id?: string | null;
          edited_at?: string;
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
