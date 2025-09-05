import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import BlogDetail from '@/components/Blog/BlogDetail';
import { useBlogPost } from '@/hooks/useBlog';

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
        <div className="min-h-screen bg-slate-50">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-slate-800 mb-4">
                Blog Post Not Found
              </h1>
              <p className="text-slate-600 mb-8">
                The blog post you're looking for doesn't exist or has been moved.
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

  const {
    title,
    meta_title,
    meta_description,
    excerpt,
    author_name,
    created_at,
    featured_image,
    tags = [],
    views_count,
    likes_count
  } = blogPost;

  return (
    <>
      <Helmet>
        <title>{meta_title || title || 'Blog Post'} - Nordflex Blog</title>
        <meta name="description" content={meta_description || excerpt || 'Nordflex Blog Post'} />
        <meta name="keywords" content={tags.join(', ')} />
        <meta name="author" content={author_name} />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={meta_title || title || 'Blog Post'} />
        <meta property="og:description" content={meta_description || excerpt || 'Nordflex Blog Post'} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={featured_image} />
        <meta property="og:site_name" content="Nordflex Blog" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta_title || title || 'Blog Post'} />
        <meta name="twitter:description" content={meta_description || excerpt || 'Nordflex Blog Post'} />
        <meta name="twitter:image" content={featured_image} />
        
        {/* Article Meta Tags */}
        <meta property="article:author" content={author_name} />
        <meta property="article:published_time" content={created_at} />
        <meta property="article:section" content="Fashion" />
        {tags.map((tag: string, index: number) => (
          <meta key={index} property="article:tag" content={tag} />
        ))}
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": title || 'Blog Post',
            "description": meta_description || excerpt || 'Nordflex Blog Post',
            "image": featured_image,
            "author": {
              "@type": "Person",
              "name": author_name
            },
            "publisher": {
              "@type": "Organization",
              "name": "Nordflex",
              "logo": {
                "@type": "ImageObject",
                "url": "/logo.png"
              }
            },
            "datePublished": created_at,
            "dateModified": created_at,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": window.location.href
            },
            "keywords": tags.join(', '),
            "articleSection": "Fashion",
            "wordCount": blogPost.content?.length || 0,
            "interactionStatistic": [
              {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/ViewAction",
                "userInteractionCount": views_count
              },
              {
                "@type": "InteractionCounter", 
                "interactionType": "https://schema.org/LikeAction",
                "userInteractionCount": likes_count
              }
            ]
          })}
        </script>
      </Helmet>
      
      <BlogDetail />
    </>
  );
};

export default BlogDetailPage;