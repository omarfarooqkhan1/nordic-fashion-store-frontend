import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import BlogList from '@/components/Blog/BlogList';

const Blog: React.FC = () => {
  const { t } = useLanguage();
  
  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Nordflex Blog - Premium Leather Jackets & Fashion Insights</title>
        <meta name="description" content="Discover the latest in Nordic fashion, leather jacket care tips, styling guides, and sustainable fashion insights from Nordflex." />
        <meta name="keywords" content="nordflex, leather jackets, nordic fashion, sustainable fashion, fashion blog, leather care, winter fashion" />
        <meta property="og:title" content="Nordflex Blog - Premium Leather Jackets & Fashion Insights" />
        <meta property="og:description" content="Discover the latest in Nordic fashion, leather jacket care tips, styling guides, and sustainable fashion insights from Nordflex." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-background py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
                The <span className="text-yellow-500">Nordflex</span> Journal
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Discover the art of premium leather craftsmanship, sustainable fashion, 
                and timeless Nordic style through our curated insights
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-sm">
                <span className="bg-muted text-muted-foreground px-4 py-2 rounded-full hover:bg-yellow-50 hover:text-yellow-700 transition-colors">
                  Fashion Insights
                </span>
                <span className="bg-muted text-muted-foreground px-4 py-2 rounded-full hover:bg-yellow-50 hover:text-yellow-700 transition-colors">
                  Leather Care Tips
                </span>
                <span className="bg-muted text-muted-foreground px-4 py-2 rounded-full hover:bg-yellow-50 hover:text-yellow-700 transition-colors">
                  Styling Guides
                </span>
                <span className="bg-muted text-muted-foreground px-4 py-2 rounded-full hover:bg-yellow-50 hover:text-yellow-700 transition-colors">
                  Sustainability
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Blog Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Featured Categories */}
            <div className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Explore Our Categories
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Dive deep into the world of premium leather fashion and Nordic style
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card rounded-lg shadow-sm border border-border p-4 text-center hover:shadow-md transition-shadow">
                  <div className="text-yellow-500 text-2xl mb-2">❄️</div>
                  <h3 className="font-semibold text-foreground">Winter Style</h3>
                  <p className="text-sm text-muted-foreground">Finnish winter fashion</p>
                </div>
                <div className="bg-card rounded-lg shadow-sm border border-border p-4 text-center hover:shadow-md transition-shadow">
                  <div className="text-yellow-500 text-2xl mb-2">🧥</div>
                  <h3 className="font-semibold text-foreground">Jacket Care</h3>
                  <p className="text-sm text-muted-foreground">Maintenance tips</p>
                </div>
                <div className="bg-card rounded-lg shadow-sm border border-border p-4 text-center hover:shadow-md transition-shadow">
                  <div className="text-yellow-500 text-2xl mb-2">♻️</div>
                  <h3 className="font-semibold text-foreground">Sustainability</h3>
                  <p className="text-sm text-muted-foreground">Eco-friendly fashion</p>
                </div>
                <div className="bg-card rounded-lg shadow-sm border border-border p-4 text-center hover:shadow-md transition-shadow">
                  <div className="text-yellow-500 text-2xl mb-2">✨</div>
                  <h3 className="font-semibold text-foreground">Style Guide</h3>
                  <p className="text-sm text-muted-foreground">Fashion tips</p>
                </div>
              </div>
            </div>

            <BlogList />
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;