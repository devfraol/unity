export type ProfileRole = "admin" | "editor" | "member";
export type BlogPostStatus = "draft" | "published" | "archived";
export type CommentStatus = "pending" | "approved" | "rejected" | "spam";

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          full_name: string;
          avatar_url: string | null;
          role: ProfileRole;
          created_at: string;
          updated_at: string;
        },
        { id: string; full_name?: string; avatar_url?: string | null; role?: ProfileRole },
        { full_name?: string; avatar_url?: string | null; role?: ProfileRole }
      >;
      categories: Table<
        {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        },
        { id?: string; name: string; slug: string; description?: string | null },
        { name?: string; slug?: string; description?: string | null }
      >;
      blog_posts: Table<
        {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string;
          cover_image: string | null;
          category_id: string | null;
          author_id: string;
          status: BlogPostStatus;
          featured: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
          seo_title: string | null;
          seo_description: string | null;
        },
        {
          id?: string;
          title: string;
          slug: string;
          content: string;
          author_id: string;
          excerpt?: string | null;
          cover_image?: string | null;
          category_id?: string | null;
          status?: BlogPostStatus;
          featured?: boolean;
          published_at?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
        },
        {
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string | null;
          cover_image?: string | null;
          category_id?: string | null;
          status?: BlogPostStatus;
          featured?: boolean;
          published_at?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
        }
      >;
      comments: Table<
        {
          id: string;
          post_id: string;
          name: string;
          email: string;
          content: string;
          status: CommentStatus;
          created_at: string;
          approved_at: string | null;
          approved_by: string | null;
        },
        {
          id?: string;
          post_id: string;
          name: string;
          email: string;
          content: string;
          status?: CommentStatus;
          created_at?: string;
          approved_at?: string | null;
          approved_by?: string | null;
        },
        {
          status?: CommentStatus;
          approved_at?: string | null;
          approved_by?: string | null;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      set_profile_role: {
        Args: { target_user_id: string; new_role: ProfileRole };
        Returns: Database["public"]["Tables"]["profiles"]["Row"];
      };
    };
    Enums: {
      profile_role: ProfileRole;
      blog_post_status: BlogPostStatus;
      comment_status: CommentStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
