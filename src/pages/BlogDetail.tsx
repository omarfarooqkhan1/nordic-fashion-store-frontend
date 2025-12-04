import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { withLazyLoading } from '@/components/common/LazyWrapper';
import { useBlogPost } from '@/hooks/useBlog';
import LoadingState from '@/components/common/LoadingState';

const LazyBlogDetail = withLazyLoading(() => import('@/components/Blog/BlogDetail'));

const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: blogPost, isLoading, error } = useBlogPost(slug);

  // Loading state
  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Loading... - Nordflex Blog</title>
        </Helmet>
        <div className="min-h-screen bg-slate-50">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-64 bg-slate-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error || !blogPost) {
    return (
      <>
        <Helmet>
          <title>Blog Post Not Found - Nordflex Blog</title>
        </Helmet>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-50">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-slate-800 mb-4">
                Blog Post Not Found
              </h1>
              <p className="mb-8 text-slate-600 dark:text-black">
                {typeof error === 'string' ? error : "The blog post you're looking for doesn't exist or has been moved."}
              </p>
              <a 
                href="/blog" 
                className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Back to Blog
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{blogPost.meta_title || blogPost.title || 'Blog Post'} - Nordflex Blog</title>
        <meta name="description" content={blogPost.meta_description || blogPost.excerpt || 'Nordflex Blog Post'} />
        <meta name="keywords" content={(blogPost.tags ?? []).join(', ')} />
        <meta name="author" content={blogPost.author_name} />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={blogPost.meta_title || blogPost.title || 'Blog Post'} />
        <meta property="og:description" content={blogPost.meta_description || blogPost.excerpt || 'Nordflex Blog Post'} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={blogPost.featured_image} />
        <meta property="og:site_name" content="Nordflex Blog" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blogPost.meta_title || blogPost.title || 'Blog Post'} />
        <meta name="twitter:description" content={blogPost.meta_description || blogPost.excerpt || 'Nordflex Blog Post'} />
        <meta name="twitter:image" content={blogPost.featured_image} />
        
        {/* Article Meta Tags */}
        <meta property="article:author" content={blogPost.author_name} />
        <meta property="article:published_time" content={blogPost.created_at} />
        <meta property="article:section" content="Fashion" />
        {Array.isArray(blogPost.tags) ? blogPost.tags.map((tag: string, index: number) => (
          <meta key={index} property="article:tag" content={tag} />
        )) : null}
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": blogPost.title || 'Blog Post',
            "description": blogPost.meta_description || blogPost.excerpt || 'Nordflex Blog Post',
            "image": blogPost.featured_image,
            "author": {
              "@type": "Person",
              "name": blogPost.author_name
            },
            "publisher": {
              "@type": "Organization",
              "name": "Nordflex",
              "logo": {
                "@type": "ImageObject",
                "url": "/logo.png"
              }
            },
            "datePublished": blogPost.created_at,
            "dateModified": blogPost.created_at,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": window.location.href
            },
            "keywords": Array.isArray(blogPost.tags) ? blogPost.tags.join(', ') : '',
            "articleSection": "Fashion",
            "wordCount": blogPost.content?.length || 0,
            "interactionStatistic": [
              {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/ViewAction",
                "userInteractionCount": blogPost.views_count
              },
              {
                "@type": "InteractionCounter", 
                "interactionType": "https://schema.org/LikeAction",
                "userInteractionCount": blogPost.likes_count
              }
            ]
          })}
        </script>
      </Helmet>
      <LazyBlogDetail fallback={<div className="py-12"><LoadingState message="Loading blog details..." /></div>} />
    </>
  );
};

export default BlogDetailPage;