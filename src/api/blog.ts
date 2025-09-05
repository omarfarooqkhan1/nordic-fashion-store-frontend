import api from './axios';
import { Blog, BlogListResponse, BlogCreateRequest, BlogUpdateRequest, BlogStats, BlogFilters } from '@/types/Blog';

export const blogApi = {
  // Public blog endpoints
  getBlogs: async (filters?: BlogFilters): Promise<BlogListResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.tags?.length) params.append('tags', filters.tags.join(','));
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const url = `/blogs?${params.toString()}`;
    const response = await api.get(url);
    return response.data;
  },

  getBlog: async (slug: string): Promise<Blog> => {
    const response = await api.get(`/blogs/${slug}`);
    return response.data;
  },

  getRelatedBlogs: async (slug: string): Promise<Blog[]> => {
    const response = await api.get(`/blogs/${slug}/related`);
    return response.data;
  },

  likeBlog: async (slug: string): Promise<{ message: string; likes_count: number; success: boolean }> => {
    const response = await api.post(`/blogs/${slug}/like`);
    return response.data;
  },

  getBlogTags: async (): Promise<string[]> => {
    const response = await api.get('/blog-tags');
    return response.data;
  },

  // Admin blog endpoints
  getAdminBlogs: async (filters?: BlogFilters): Promise<BlogListResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const response = await api.get(`/admin/blogs?${params.toString()}`);
    return response.data;
  },

  getAdminBlog: async (id: number): Promise<Blog> => {
    const response = await api.get(`/admin/blogs/${id}`);
    return response.data;
  },

  createBlog: async (blogData: BlogCreateRequest): Promise<{ message: string; data: Blog; success: boolean }> => {
    // Check if there are new image files to upload
    if (blogData.newImageFiles && blogData.newImageFiles.length > 0) {
      const formData = new FormData();
      
      // Add all text fields
      Object.keys(blogData).forEach(key => {
        if (key !== 'newImageFiles' && blogData[key as keyof BlogCreateRequest] !== undefined) {
          const value = blogData[key as keyof BlogCreateRequest];
          if (Array.isArray(value)) {
            value.forEach(item => formData.append(`${key}[]`, item));
          } else if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        }
      });
      
      // Add image files
      blogData.newImageFiles.forEach(file => {
        formData.append('images[]', file);
      });
      
      // Add featured image file if present
      if (blogData.featuredImageFile) {
        formData.append('featured_image_file', blogData.featuredImageFile);
      }
      
      const response = await api.post('/admin/blogs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      const response = await api.post('/admin/blogs', blogData);
      return response.data;
    }
  },

  updateBlog: async (id: number, blogData: Partial<BlogCreateRequest>): Promise<{ message: string; data: Blog; success: boolean }> => {
    // Check if there are new image files to upload
    if (blogData.newImageFiles && blogData.newImageFiles.length > 0) {
      const formData = new FormData();
      
      // Add all text fields
      Object.keys(blogData).forEach(key => {
        if (key !== 'newImageFiles' && blogData[key as keyof BlogCreateRequest] !== undefined) {
          const value = blogData[key as keyof BlogCreateRequest];
          if (Array.isArray(value)) {
            value.forEach(item => formData.append(`${key}[]`, item));
          } else if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        }
      });
      
      // Add image files
      blogData.newImageFiles.forEach(file => {
        formData.append('images[]', file);
      });
      
      // Add featured image file if present
      if (blogData.featuredImageFile) {
        formData.append('featured_image_file', blogData.featuredImageFile);
      }
      
      const response = await api.put(`/admin/blogs/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      const response = await api.put(`/admin/blogs/${id}`, blogData);
      return response.data;
    }
  },

  deleteBlog: async (id: number): Promise<{ message: string; success: boolean }> => {
    const response = await api.delete(`/admin/blogs/${id}`);
    return response.data;
  },

  getBlogStats: async (): Promise<BlogStats> => {
    const response = await api.get('/admin/blog-stats');
    return response.data;
  },
};
