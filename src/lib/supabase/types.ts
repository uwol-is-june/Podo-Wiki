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
      edit_locks: {
        Row: {
          document_slug: string;
          user_id: string;
          acquired_at: string;
          expires_at: string;
        };
        Insert: {
          document_slug: string;
          user_id: string;
          acquired_at?: string;
          expires_at?: string;
        };
        Update: {
          user_id?: string;
          acquired_at?: string;
          expires_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          organization: string;
          status: 'pending' | 'approved' | 'rejected';
          role: 'member' | 'admin';
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          organization: string;
          status?: 'pending' | 'approved' | 'rejected';
          role?: 'member' | 'admin';
          created_at?: string;
        };
        Update: {
          name?: string;
          organization?: string;
          status?: 'pending' | 'approved' | 'rejected';
          role?: 'member' | 'admin';
        };
        Relationships: [];
      };
      deletion_requests: {
        Row: {
          id: string;
          document_slug: string;
          requester_id: string;
          reason: string;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          document_slug: string;
          requester_id: string;
          reason: string;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          reviewed_at?: string | null;
        };
        Update: {
          status?: 'pending' | 'approved' | 'rejected';
          reviewed_at?: string | null;
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
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileStatus = Profile['status'];
export type ProfileRole = Profile['role'];
export type DeletionRequest = Database["public"]["Tables"]["deletion_requests"]["Row"];
export type FeatureRequest = Database["public"]["Tables"]["feature_requests"]["Row"];
