import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, Eye, Image as ImageIcon, Upload } from 'lucide-react';
import { Blog, BlogCreateRequest } from '@/types/Blog';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ui/ImageUpload';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  excerpt: z.string().max(1000, 'Excerpt is too long').optional(),
  content: z.string().min(1, 'Content is required'),
  featured_image: z.string().url('Invalid URL').optional().or(z.literal('')),
  images: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']),
  author_name: z.string().min(1, 'Author name is required').max(255, 'Author name is too long'),
});

type BlogFormData = z.infer<typeof blogSchema>;

interface BlogFormProps {
  blog?: Blog;
  onSubmit: (data: BlogCreateRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const BlogForm: React.FC<BlogFormProps> = ({
  blog,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [tags, setTags] = useState<string[]>(blog?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [blogImages, setBlogImages] = useState<string[]>(blog?.images || []);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(blog?.featured_image || null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: blog?.title || '',
      excerpt: blog?.excerpt || '',
      content: blog?.content || '',
      featured_image: blog?.featured_image || '',
      status: blog?.status || 'draft',
      author_name: blog?.author_name || '',
    }
  });

  const watchedContent = watch('content');
  const watchedTitle = watch('title');

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const onFormSubmit = async (data: BlogFormData) => {
    try {
      // Validate that at least one featured image method is provided
      if (!data.featured_image && !featuredImageFile && blogImages.length === 0) {
        toast({
          title: 'Featured Image Required',
          description: 'Please provide either a featured image URL, upload a file, or add gallery images.',
          variant: 'destructive'
        });
        return;
      }

      const submitData: BlogCreateRequest = {
        ...data,
        tags: tags.length > 0 ? tags : undefined,
        featured_image: data.featured_image || undefined,
        images: blogImages.length > 0 ? blogImages : undefined,
      };

      // If there are new image files, we need to handle them differently
      // For now, we'll pass them as a separate property
      if (newImageFiles.length > 0) {
        (submitData as any).newImageFiles = newImageFiles;
      }
      
      // Add featured image file if uploaded
      if (featuredImageFile) {
        (submitData as any).featuredImageFile = featuredImageFile;
      }

      // Auto-set featured image from first gallery image if no featured image is set
      if (!submitData.featured_image && !featuredImageFile && blogImages.length > 0) {
        submitData.featured_image = blogImages[0];
      }

      await onSubmit(submitData);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const generatePreview = () => {
    const content = watchedContent || '';
    const title = watchedTitle || 'Preview';
    
    return (
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <h1>{title}</h1>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {blog ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h1>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {generatePreview()}
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter blog title"
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  {...register('excerpt')}
                  placeholder="Enter blog excerpt (optional)"
                  rows={3}
                />
                {errors.excerpt && (
                  <p className="text-sm text-destructive mt-1">{errors.excerpt.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="featured_image">Featured Image</Label>
                <div className="space-y-3">
                  {/* Featured Image URL Input */}
                  <div>
                    <Label htmlFor="featured_image_url" className="text-sm text-muted-foreground">
                      Or enter image URL
                    </Label>
                    <Input
                      id="featured_image"
                      {...register('featured_image')}
                      placeholder="https://example.com/image.jpg"
                      onChange={(e) => {
                        // Clear file upload when URL is entered
                        if (e.target.value && featuredImageFile) {
                          setFeaturedImageFile(null);
                          setFeaturedImagePreview(null);
                        }
                        register('featured_image').onChange(e);
                      }}
                    />
                    {errors.featured_image && (
                      <p className="text-sm text-destructive mt-1">{errors.featured_image.message}</p>
                    )}
                  </div>
                  
                  {/* Featured Image File Upload */}
                  <div>
                    <Label htmlFor="featured_image_file" className="text-sm text-muted-foreground">
                      Or upload image file
                    </Label>
                    <Input
                      id="featured_image_file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Clear URL field when file is selected
                          setValue('featured_image', '');
                          setFeaturedImageFile(file);
                          const preview = URL.createObjectURL(file);
                          setFeaturedImagePreview(preview);
                        }
                      }}
                      className="mt-1"
                    />
                  </div>
                  
                  {/* Featured Image Preview */}
                  {featuredImagePreview && (
                    <div className="relative w-32 h-32 border rounded overflow-hidden">
                      <img
                        src={featuredImagePreview}
                        alt="Featured image preview"
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        onClick={() => {
                          setFeaturedImageFile(null);
                          setFeaturedImagePreview(null);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  {...register('content')}
                  placeholder="Write your blog content here..."
                  rows={15}
                  className="font-mono"
                />
                {errors.content && (
                  <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  You can use HTML tags for formatting
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Image Gallery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                label="Blog Images"
                maxFiles={10}
                accept="image/*"
                existingImages={blogImages}
                onImagesChange={setBlogImages}
                onNewFilesChange={setNewImageFiles}
                disabled={loading}
                previewSize="md"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Upload images to create a rich visual experience for your blog post. 
                The first image will be used as the featured image if no URL is provided above.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={watch('status')}
                    onValueChange={(value) => setValue('status', value as 'draft' | 'published' | 'archived')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-destructive mt-1">{errors.status.message}</p>
                  )}
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author_name">Author Name *</Label>
                  <Input
                    id="author_name"
                    {...register('author_name')}
                    placeholder="Enter author name"
                  />
                  {errors.author_name && (
                    <p className="text-sm text-destructive mt-1">{errors.author_name.message}</p>
                  )}
                </div>

              </div>

              <div>
                <Label>Tags</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag"
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : (blog ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BlogForm;
