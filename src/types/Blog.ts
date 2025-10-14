// types/blog.ts
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  images: string[];
  status: 'draft' | 'published' | 'archived';
  author_name: string;
  meta_title?: string;
  meta_description?: string;
  tags: string[];
  views_count: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export interface BlogListResponse {
  data: BlogPost[];
  pagination: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
    has_more_pages?: boolean;
  };
}

export interface BlogFilters {
  search?: string;
  tag?: string;
  author?: string;
  status?: string;
  sort?: 'latest' | 'oldest' | 'most_viewed' | 'most_liked';
}