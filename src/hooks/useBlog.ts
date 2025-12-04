// hooks/useBlog.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BlogPost, BlogListResponse, BlogFilters } from '@/types/Blog';
import api from '@/api/axios'; // Assuming you have an API service

// Fetch blog posts with filtering and pagination
export const useBlogPosts = (filters: BlogFilters = {}, page: number = 1) => {
  return useQuery({
    queryKey: ['blogs', filters, page],
    queryFn: async (): Promise<BlogListResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '12',
        ...filters,
      });
      
      const response = await api.get(`/api/blogs?${params}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch single blog post by slug
export const useBlogPost = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: async (): Promise<BlogPost> => {
      if (!slug) throw new Error('Slug is required');
      const response = await api.get(`/api/blogs/${slug}`);
      return response.data;
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Fetch related blog posts
export const useRelatedBlogPosts = (currentSlug: string, tags: string[] = []) => {
  return useQuery({
    queryKey: ['relatedBlogs', currentSlug, tags],
    queryFn: async (): Promise<BlogPost[]> => {
      const params = new URLSearchParams({
        exclude: currentSlug,
        tags: tags.join(','),
        limit: '4',
      });
      
      const response = await api.get(`/api/blogs/related?${params}`);
      return response.data;
    },
    enabled: !!currentSlug && tags.length > 0,
    staleTime: 10 * 60 * 1000,
  });
};

// Fetch popular blog posts
export const usePopularBlogPosts = (limit: number = 5) => {
  return useQuery({
    queryKey: ['popularBlogs', limit],
    queryFn: async (): Promise<BlogPost[]> => {
      const response = await api.get(`/api/blogs/popular?limit=${limit}`);
      return response.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Fetch blog categories/tags
export const useBlogTags = () => {
  return useQuery({
    queryKey: ['blogTags'],
    queryFn: async (): Promise<string[]> => {
      const response = await api.get('/api/blogs/tags');
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Like a blog post
export const useLikeBlogPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (slug: string) => {
      const response = await api.post(`/api/blogs/${slug}/like`);
      return response.data;
    },
    onSuccess: (_, slug) => {
      // Invalidate and refetch blog post data
      queryClient.invalidateQueries({ queryKey: ['blog', slug] });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
};

// Increment blog post view count
export const useIncrementBlogViews = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      const response = await api.post(`/api/blogs/${slug}/view`);
      return response.data;
    },
  });
};

// Search blogs
export const useSearchBlogs = (searchTerm: string) => {
  return useQuery({
    queryKey: ['searchBlogs', searchTerm],
    queryFn: async (): Promise<BlogPost[]> => {
      if (!searchTerm.trim()) return [];
      
      const response = await api.get(`/api/blogs/search?q=${encodeURIComponent(searchTerm)}`);
      return response.data;
    },
    enabled: searchTerm.length > 2,
    staleTime: 5 * 60 * 1000,
  });
};