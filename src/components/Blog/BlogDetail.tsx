import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, Eye, Clock, User, ArrowLeft, Share2 } from 'lucide-react';
import { Blog } from '@/types/Blog';
import { blogApi } from '@/api/blog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LoginModal from '@/components/Auth/LoginModal';
import BlogCard from './BlogCard';
import { getImageUrl, getPlaceholderImageUrl } from '@/utils/imageUtils';

const BlogDetail: React.FC = () => {
  const { t } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liking, setLiking] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const fetchBlog = async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [blogData, relatedData] = await Promise.all([
        blogApi.getBlog(slug),
        blogApi.getRelatedBlogs(slug)
      ]);
      
      setBlog(blogData);
      setRelatedBlogs(relatedData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch blog post');
      toast({
        title: 'Error',
        description: 'Failed to fetch blog post',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const handleLike = async () => {
    if (!blog || liking) return;
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    
    try {
      setLiking(true);
      const response = await blogApi.likeBlog(blog.slug);
      setBlog(prev => prev ? { ...prev, likes_count: response.likes_count } : null);
      toast({
        title: 'Liked!',
        description: 'Thank you for liking this blog post',
        className: 'bg-green-500 text-white'
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to like blog post',
        variant: 'destructive'
      });
    } finally {
      setLiking(false);
    }
  };

  const handleLoginSuccess = () => {
    // After successful login, automatically like the blog post
    if (blog) {
      handleLike();
    }
  };

  const handleShare = async () => {
    if (!blog) return;
    
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: url
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: 'Link copied!',
          description: 'Blog post link copied to clipboard',
          className: 'bg-green-500 text-white'
        });
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to copy link',
          variant: 'destructive'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">{error || 'Blog post not found'}</p>
        <Link to="/blogs">
          <Button>Back to Blog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Back Button */}
      <Link to="/blogs">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('blog.backToBlog')}
        </Button>
      </Link>

      {/* Blog Header */}
      <div className="space-y-4">
        {blog.featured_image && (
          <div className="aspect-video overflow-hidden rounded-lg">
            <img
              src={getImageUrl(blog.featured_image)}
              alt={blog.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = getPlaceholderImageUrl(blog.title);
              }}
            />
          </div>
        )}

        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {blog.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              {blog.author_name}
            </div>
            
            {blog.formatted_published_date && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {blog.formatted_published_date}
              </div>
            )}
            
            {blog.reading_time && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {blog.reading_time}
              </div>
            )}
            
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              {blog.views_count} views
            </div>
          </div>

          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Blog Content */}
      <div className="prose prose-lg max-w-none dark:prose-invert bg-background text-foreground dark:bg-background dark:text-foreground rounded-xl p-4 shadow">
        <div 
          dangerouslySetInnerHTML={{ __html: blog.content || '' }}
          className="blog-content text-foreground dark:text-foreground leading-relaxed"
        />
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handleLike}
          disabled={liking}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Heart className="w-4 h-4" />
          {liking ? 'Liking...' : `Like (${blog.likes_count})`}
        </Button>

        <Button
          onClick={handleShare}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>

      {/* Related Blogs */}
      {relatedBlogs.length > 0 && (
        <div className="space-y-6">
          <Separator />
          
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <BlogCard
                  key={relatedBlog.id}
                  blog={relatedBlog}
                  onLike={handleLike}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        title="Login to Like"
        description="Please log in to like this blog post and show your appreciation!"
      />
    </div>
  );
};

export default BlogDetail;
