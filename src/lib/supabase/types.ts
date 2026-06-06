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
      profiles: {
        Row: {
          id: string;
          name: string;
          organization: string;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          organization: string;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
        };
        Update: {
          name?: string;
          organization?: string;
          status?: 'pending' | 'approved' | 'rejected';
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
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileStatus = Profile['status'];
