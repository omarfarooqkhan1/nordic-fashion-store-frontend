import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import useSWR from 'swr';
import axios from 'axios';

interface StaticPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  updated_at: string;
}

const AdminStaticPages: React.FC = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: pagesData, mutate } = useSWR<{ data: StaticPage[] }>(
    `${import.meta.env.VITE_BACKEND_URL}/api/static-pages`,
    (url) => axios.get(url).then((res) => res.data)
  );

  const pages = pagesData?.data || [];

  const handleEdit = (page: StaticPage) => {
    setEditingPage({ ...page });
  };

  const handleCancel = () => {
    setEditingPage(null);
  };

  const handleSave = async () => {
    if (!editingPage || !token) return;

    setIsSaving(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/static-pages/${editingPage.id}`,
        {
          title: editingPage.title,
          content: editingPage.content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: 'Success',
        description: 'Page updated successfully',
      });

      mutate();
      setEditingPage(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update page',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getPageIcon = (slug: string) => {
    switch (slug) {
      case 'terms-and-conditions':
        return '📜';
      case 'privacy-policy':
        return '🔒';
      case 'delivery':
        return '🚚';
      case 'return-policy':
        return '↩️';
      case 'product-care-guide':
        return '✨';
      default:
        return '📄';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Static Pages</h2>
      </div>

      {editingPage ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Page: {editingPage.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="page-title">Page Title</Label>
              <Input
                id="page-title"
                value={editingPage.title}
                onChange={(e) =>
                  setEditingPage({ ...editingPage, title: e.target.value })
                }
                placeholder="Page Title"
              />
            </div>

            <div>
              <Label htmlFor="page-content">Page Content (HTML)</Label>
              <Textarea
                id="page-content"
                value={editingPage.content}
                onChange={(e) =>
                  setEditingPage({ ...editingPage, content: e.target.value })
                }
                placeholder="Enter HTML content..."
                rows={20}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground mt-2">
                You can use HTML tags to format the content. The content will be rendered as HTML on the page.
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pages.map((page) => (
            <Card key={page.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getPageIcon(page.slug)}</span>
                      <h3 className="text-lg font-semibold">{page.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Slug: <code className="bg-muted px-1 py-0.5 rounded">{page.slug}</code>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last updated: {new Date(page.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handleEdit(page)}>
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pages.length === 0 && !editingPage && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p>No static pages found. Run the seeder to create initial pages.</p>
            <p className="text-sm mt-2">
              Command: <code className="bg-muted px-2 py-1 rounded">php artisan db:seed --class=StaticPageSeeder</code>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminStaticPages;
