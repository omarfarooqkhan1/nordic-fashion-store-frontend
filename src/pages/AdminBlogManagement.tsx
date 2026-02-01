import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BarChart3, FileText, Eye, Edit, Trash2 } from 'lucide-react';
import { BlogPost } from '@/types/Blog';
import { blogApi } from '@/api/blog';
import BlogList from '@/components/Blog/BlogList';
import BlogForm from '@/components/Blog/BlogForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AdminTabsNavigation } from '@/components/admin/AdminTabsNavigation';

const AdminBlogManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Determine active tab - always 'blogs' for this page
  const [activeTab, setActiveTab] = useState('blogs');

  const fetchStats = async () => {
    try {
      const statsData = await blogApi.getBlogStats();
      setStats(statsData);
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCreate = () => {
    setSelectedBlog(null);
    setView('create');
  };

  const handleEdit = async (id: number) => {
    try {
      setLoading(true);
      const blogData = await blogApi.getAdminBlog(id);
      setSelectedBlog(blogData);
      setView('edit');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load blog post',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      setLoading(true);
      await blogApi.deleteBlog(id);
      toast({
        title: 'Success',
        description: 'Blog post deleted successfully',
        className: 'bg-green-500 text-white'
      });
      // Refresh the list
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete blog post',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      
      if (selectedBlog) {
        await blogApi.updateBlog(selectedBlog.id, data);
        toast({
          title: 'Success',
          description: 'Blog post updated successfully',
          className: 'bg-green-500 text-white'
        });
      } else {
        await blogApi.createBlog(data);
        toast({
          title: 'Success',
          description: 'Blog post created successfully',
          className: 'bg-green-500 text-white'
        });
      }
      
      setView('list');
      fetchStats(); // Refresh stats
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save blog post',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setView('list');
    setSelectedBlog(null);
  };

  if (view === 'create' || view === 'edit') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
          <Helmet>
            <title>{view === 'create' ? 'Create Blog Post' : 'Edit Blog Post'} - Admin</title>
          </Helmet>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-foreground">Blog Management</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <AdminTabsNavigation activeTab={activeTab} />

            <TabsContent value="blogs" className="space-y-4 sm:space-y-6">
              <BlogForm
                blog={selectedBlog || undefined}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Blog Management - Admin</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-foreground">Blog Management</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <AdminTabsNavigation activeTab={activeTab} />

            <TabsContent value="blogs" className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-semibold">Manage Blog Posts</h2>
                <Button onClick={handleCreate} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create New Post
                </Button>
              </div>

              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total_blogs}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.published_blogs} published, {stats.draft_blogs} drafts
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Published</CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.published_blogs}</div>
                      <p className="text-xs text-muted-foreground">
                        Live blog posts
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total_views.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">
                        Across all posts
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total_likes.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">
                        User engagement
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Recent Posts */}
              {stats?.recent_blogs && stats.recent_blogs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.recent_blogs.map((blog) => (
                        <div key={blog.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-medium">{blog.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Created {new Date(blog.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={blog.status === 'published' ? 'default' : 'secondary'}>
                              {blog.status}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(blog.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Blog List */}
              <Card>
                <CardHeader>
                  <CardTitle>All Blog Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <BlogList
                    showAdminActions={true}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default AdminBlogManagement;
