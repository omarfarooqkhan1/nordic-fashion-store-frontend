import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Eye, Clock, User } from 'lucide-react';
import { Blog } from '@/types/Blog';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { getImageUrl, getPlaceholderImageUrl } from '@/utils/imageUtils';

interface BlogCardProps {
  blog: Blog;
  onLike?: (slug: string) => void;
  showAdminActions?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const BlogCard: React.FC<BlogCardProps> = ({
  blog,
  onLike,
  showAdminActions = false,
  onEdit,
  onDelete
}) => {
  const { t } = useLanguage();
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLike) {
      onLike(blog.slug);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(blog.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(blog.id);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border bg-card overflow-hidden">
      <Link to={`/blogs/${blog.slug}`} className="block">
        {(blog.featured_image || (blog.images && blog.images.length > 0)) && (
          <div className="aspect-video overflow-hidden">
            <img
              src={getImageUrl(blog.featured_image || blog.images[0]) || getPlaceholderImageUrl(blog.title)}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = getPlaceholderImageUrl(blog.title);
              }}
            />
          </div>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <Badge 
              variant={blog.status === 'published' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {blog.status}
            </Badge>
            {blog.reading_time && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-3 h-3 mr-1" />
                {blog.reading_time}
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-foreground group-hover:text-yellow-600 transition-colors line-clamp-2">
            {blog.title}
          </h3>
          
          {blog.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
              {blog.excerpt}
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <div className="flex items-center">
              <User className="w-3 h-3 mr-1" />
              {blog.author_name}
            </div>
            {blog.formatted_published_date && (
              <span>{blog.formatted_published_date}</span>
            )}
          </div>

          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {blog.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {blog.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{blog.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {blog.views_count} {t('blog.views')}
              </div>
              <div className="flex items-center">
                <Heart className="w-3 h-3 mr-1" />
                {blog.likes_count} {t('blog.likes')}
              </div>
            </div>

            {showAdminActions && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="h-7 px-2"
                >
                  {t('common.edit')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  className="h-7 px-2"
                >
                  {t('common.delete')}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default BlogCard;
