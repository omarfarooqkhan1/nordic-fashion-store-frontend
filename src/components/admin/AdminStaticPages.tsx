import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import useSWR from 'swr';
import axios from 'axios';
import { X, Upload, GripVertical } from 'lucide-react';

interface PageImage {
  id: string;
  url: string;
  path: string;
  position: 'top' | 'middle' | 'bottom' | 'left' | 'right' | 'center' | 'full-width';
  caption: string;
  alt_text: string;
  width: string;
  height: string;
  uploaded_at: string;
}

interface StaticPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  images?: PageImage[];
  updated_at: string;
}

const AdminStaticPages: React.FC = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);

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
    setEditingImageId(null);
  };

  const handleSave = async () => {
    if (!editingPage || !token) return;

    setIsSaving(true);
    try {
      await axios.put(
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingPage || !token || !e.target.files?.[0]) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    formData.append('position', 'center');

    setIsUploadingImage(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/static-pages/${editingPage.id}/upload-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const newImage = response.data.image;
      const images = editingPage.images || [];
      images.push(newImage);

      setEditingPage({ ...editingPage, images });
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (imagePath: string) => {
    if (!editingPage || !token) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/static-pages/${editingPage.id}/delete-image`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            image_path: imagePath,
          },
        }
      );

      const images = (editingPage.images || []).filter((img) => img.path !== imagePath);
      setEditingPage({ ...editingPage, images });

      toast({
        title: 'Success',
        description: 'Image deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete image',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateImagePosition = async (image: PageImage) => {
    if (!editingPage || !token) return;

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/static-pages/${editingPage.id}/update-image-position`,
        {
          image_id: image.id,
          position: image.position,
          caption: image.caption,
          alt_text: image.alt_text,
          width: image.width,
          height: image.height,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditingPage({ ...editingPage, images: response.data.images });
      setEditingImageId(null);
      toast({
        title: 'Success',
        description: 'Image settings updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update image',
        variant: 'destructive',
      });
    }
  };

  const handleDragStart = (imageId: string) => {
    setDraggedImageId(imageId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetImageId: string) => {
    if (!draggedImageId || !editingPage || !token || draggedImageId === targetImageId) return;

    const images = editingPage.images || [];
    const draggedIndex = images.findIndex((img) => img.id === draggedImageId);
    const targetIndex = images.findIndex((img) => img.id === targetImageId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Swap images
    [images[draggedIndex], images[targetIndex]] = [images[targetIndex], images[draggedIndex]];

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/static-pages/${editingPage.id}/reorder-images`,
        {
          image_ids: images.map((img) => img.id),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditingPage({ ...editingPage, images });
      setDraggedImageId(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to reorder images',
        variant: 'destructive',
      });
    }
  };

  const getPageIcon = (slug: string) => {
    switch (slug) {
      case 'about':
        return '📖';
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

  const getPositionLabel = (position: string) => {
    const labels: Record<string, string> = {
      'top': 'Top',
      'middle': 'Middle',
      'bottom': 'Bottom',
      'left': 'Left',
      'right': 'Right',
      'center': 'Center',
      'full-width': 'Full Width',
    };
    return labels[position] || position;
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

            {/* Image Management Section */}
            <div className="space-y-4 border-t pt-4">
              <div>
                <Label htmlFor="page-images">Page Images</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="page-images"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                  />
                  <Button
                    disabled={isUploadingImage}
                    className="whitespace-nowrap"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploadingImage ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload images and configure their position, caption, and other properties.
                </p>
              </div>

              {/* Display uploaded images */}
              {editingPage.images && editingPage.images.length > 0 && (
                <div>
                  <Label>Uploaded Images (Drag to reorder)</Label>
                  <div className="space-y-3 mt-2">
                    {editingPage.images.map((image) => (
                      <div
                        key={image.id}
                        draggable
                        onDragStart={() => handleDragStart(image.id)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(image.id)}
                        className="border rounded-lg p-3 bg-muted/50 hover:bg-muted cursor-move transition-colors"
                      >
                        {editingImageId === image.id ? (
                          // Edit mode
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <img
                                src={image.url}
                                alt={image.alt_text}
                                className="w-20 h-20 object-cover rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                                }}
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{image.url.split('/').pop()}</p>
                                <p className="text-xs text-muted-foreground">Position: {getPositionLabel(image.position)}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 ml-6">
                              <div>
                                <Label className="text-xs">Position</Label>
                                <Select
                                  value={image.position}
                                  onValueChange={(value) => {
                                    const images = editingPage.images || [];
                                    const idx = images.findIndex((img) => img.id === image.id);
                                    if (idx !== -1) {
                                      images[idx].position = value as any;
                                      setEditingPage({ ...editingPage, images });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="top">Top</SelectItem>
                                    <SelectItem value="middle">Middle</SelectItem>
                                    <SelectItem value="bottom">Bottom</SelectItem>
                                    <SelectItem value="left">Left</SelectItem>
                                    <SelectItem value="right">Right</SelectItem>
                                    <SelectItem value="center">Center</SelectItem>
                                    <SelectItem value="full-width">Full Width</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-xs">Width</Label>
                                <Input
                                  type="text"
                                  value={image.width}
                                  onChange={(e) => {
                                    const images = editingPage.images || [];
                                    const idx = images.findIndex((img) => img.id === image.id);
                                    if (idx !== -1) {
                                      images[idx].width = e.target.value;
                                      setEditingPage({ ...editingPage, images });
                                    }
                                  }}
                                  placeholder="e.g., 100%, 500px"
                                  className="h-8"
                                />
                              </div>

                              <div>
                                <Label className="text-xs">Height</Label>
                                <Input
                                  type="text"
                                  value={image.height}
                                  onChange={(e) => {
                                    const images = editingPage.images || [];
                                    const idx = images.findIndex((img) => img.id === image.id);
                                    if (idx !== -1) {
                                      images[idx].height = e.target.value;
                                      setEditingPage({ ...editingPage, images });
                                    }
                                  }}
                                  placeholder="e.g., auto, 300px"
                                  className="h-8"
                                />
                              </div>

                              <div className="col-span-2">
                                <Label className="text-xs">Alt Text</Label>
                                <Input
                                  type="text"
                                  value={image.alt_text}
                                  onChange={(e) => {
                                    const images = editingPage.images || [];
                                    const idx = images.findIndex((img) => img.id === image.id);
                                    if (idx !== -1) {
                                      images[idx].alt_text = e.target.value;
                                      setEditingPage({ ...editingPage, images });
                                    }
                                  }}
                                  placeholder="Image description"
                                  className="h-8"
                                />
                              </div>

                              <div className="col-span-2">
                                <Label className="text-xs">Caption</Label>
                                <Textarea
                                  value={image.caption}
                                  onChange={(e) => {
                                    const images = editingPage.images || [];
                                    const idx = images.findIndex((img) => img.id === image.id);
                                    if (idx !== -1) {
                                      images[idx].caption = e.target.value;
                                      setEditingPage({ ...editingPage, images });
                                    }
                                  }}
                                  placeholder="Image caption (optional)"
                                  rows={2}
                                  className="text-xs"
                                />
                              </div>
                            </div>

                            <div className="flex gap-2 ml-6">
                              <Button
                                size="sm"
                                onClick={() => handleUpdateImagePosition(image)}
                              >
                                Save Settings
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingImageId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <img
                                src={image.url}
                                alt={image.alt_text}
                                className="w-20 h-20 object-cover rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                                }}
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{image.url.split('/').pop()}</p>
                                <p className="text-xs text-muted-foreground">
                                  Position: {getPositionLabel(image.position)} | Size: {image.width} × {image.height}
                                </p>
                                {image.caption && (
                                  <p className="text-xs text-muted-foreground mt-1">Caption: {image.caption}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingImageId(image.id)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteImage(image.path)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                    {page.images && page.images.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📷 {page.images.length} image(s)
                      </p>
                    )}
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
