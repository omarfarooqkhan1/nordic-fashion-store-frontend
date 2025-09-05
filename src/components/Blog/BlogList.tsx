import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Blog, BlogFilters } from '@/types/Blog';
import { blogApi } from '@/api/blog';
import BlogCard from './BlogCard';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface BlogListProps {
  showAdminActions?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onLike?: (slug: string) => void;
}

const BlogList: React.FC<BlogListProps> = ({
  showAdminActions = false,
  onEdit,
  onDelete,
  onLike
}) => {
  const { t } = useLanguage();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BlogFilters>({
    search: '',
    per_page: 12,
    page: 1
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
    has_more_pages: false
  });
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = showAdminActions 
        ? await blogApi.getAdminBlogs(filters)
        : await blogApi.getBlogs(filters);
      
      setBlogs(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || t('blog.failedToFetch'));
      toast({
        title: 'Error',
        description: t('blog.failedToFetch'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const tags = await blogApi.getBlogTags();
      setAvailableTags(tags);
    } catch (err) {
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [filters, showAdminActions]);

  useEffect(() => {
    if (!showAdminActions) {
      fetchTags();
    }
  }, [showAdminActions]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleTagFilter = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag],
      page: 1
    }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status as 'draft' | 'published' | 'archived',
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleLike = async (slug: string) => {
    try {
      const response = await blogApi.likeBlog(slug);
      setBlogs(prev => prev.map(blog => 
        blog.slug === slug 
          ? { ...blog, likes_count: response.likes_count }
          : blog
      ));
      toast({
        title: t('blog.liked'),
        description: t('blog.thankYouForLiking'),
        className: 'bg-green-500 text-white'
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: t('blog.failedToLike'),
        variant: 'destructive'
      });
    }
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchBlogs}>{t('blog.tryAgain')}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t('blog.searchPlaceholder')}
              value={filters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {showAdminActions && (
            <Select onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('blog.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('blog.allStatus')}</SelectItem>
                <SelectItem value="published">{t('blog.published')}</SelectItem>
                <SelectItem value="draft">{t('blog.draft')}</SelectItem>
                <SelectItem value="archived">{t('blog.archived')}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tags Filter */}
      {!showAdminActions && availableTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableTags.slice(0, 10).map((tag) => (
            <Badge
              key={tag}
              variant={filters.tags?.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
              onClick={() => handleTagFilter(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Blog Grid/List */}
      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('blog.noBlogsFound')}</p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              onLike={showAdminActions ? undefined : onLike || handleLike}
              showAdminActions={showAdminActions}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
          >
            {t('blog.previous')}
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={pagination.current_page === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={!pagination.has_more_pages}
          >
            {t('blog.next')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlogList;
