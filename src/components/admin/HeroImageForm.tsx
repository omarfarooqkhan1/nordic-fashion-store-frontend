import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { type HeroImage, type HeroImageFormData } from "@/api/admin";

interface HeroImageFormProps {
  heroImage?: HeroImage;
  onSave: (heroImage: HeroImage) => void;
  onCancel: () => void;
  token: string | null;
  isCreating?: boolean;
}

export const HeroImageForm: React.FC<HeroImageFormProps> = ({
  heroImage,
  onSave,
  onCancel,
  token,
  isCreating = false,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<HeroImageFormData>({
    image_url: heroImage?.image_url || "",
    alt_text: heroImage?.alt_text || "",
    sort_order: heroImage?.sort_order || 0,
    is_active: heroImage?.is_active ?? true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedFile && !formData.image_url) {
      newErrors.image = "Please select an image file or provide an image URL";
    }

    if (formData.sort_order < 0) {
      newErrors.sort_order = "Sort order must be 0 or greater";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission and page reload

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before saving.",
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      toast({
        title: "Authentication Error",
        description: "You are not authenticated. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      let result: HeroImage;

      // Upload file if selected
      if (selectedFile) {
        toast({ title: "Uploading image...", description: "Please wait while we upload your image." });
        // For hero images, we'll upload as a file to the hero image endpoint
        // The backend should handle file uploads for hero images
        const uploadFormData = new FormData();
        uploadFormData.append('image', selectedFile, selectedFile.name);
        uploadFormData.append('alt_text', formData.alt_text || '');
        uploadFormData.append('sort_order', formData.sort_order.toString());
        uploadFormData.append('is_active', formData.is_active ? '1' : '0');

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/hero-images`, {
          method: 'POST',
          body: uploadFormData,
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to upload image');
        }

        const uploadResult = await response.json();
        result = uploadResult.data || uploadResult;
        toast({ title: "Hero image created successfully" });

        onSave(result);
        return;
      }
      if (heroImage) {
        // For editing, use PUT request to update existing hero image
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/hero-images/${heroImage.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update hero image');
        }

        const updateResult = await response.json();
        result = updateResult.data || updateResult;
        toast({ title: "Hero image updated successfully" });
      } else {
        // For creating, use POST request to create new hero image
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/hero-images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create hero image');
        }

        const createResult = await response.json();
        result = createResult.data || createResult;
        toast({ title: "Hero image created successfully" });
      }

      onSave(result);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{heroImage ? "Edit Hero Image" : "Add New Hero Image"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="image_file">Image File {heroImage ? "(Optional - leave empty to keep current image)" : "*"}</Label>
            <Input
              id="image_file"
              type="file"
              accept="image/*"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              className={errors.image ? "border-red-500" : ""}
            />
            {errors.image && <p className="text-sm text-red-500 mt-1">{errors.image}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              Select an image file (JPG, PNG, etc.) - Max 20MB {heroImage && "(Leave empty to keep current image)"}
            </p>
          </div>

          <div>
            <Label htmlFor="alt_text">Alt Text</Label>
            <Input
              id="alt_text"
              value={formData.alt_text}
              onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
              placeholder="Describe the image for accessibility"
            />
          </div>

          <div>
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input
              id="sort_order"
              type="number"
              min="0"
              value={formData.sort_order}
              onChange={(e) => {
                setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 });
                if (errors.sort_order) setErrors(prev => ({ ...prev, sort_order: '' }));
              }}
              placeholder="0"
              className={errors.sort_order ? "border-red-500" : ""}
            />
            {errors.sort_order && <p className="text-sm text-red-500 mt-1">{errors.sort_order}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              Lower numbers appear first. Images are sorted by this value.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isCreating || isUploading}>
              {isUploading ? "Uploading..." : isCreating ? "Saving..." : heroImage ? "Update Hero Image" : "Add Hero Image"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isCreating}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default HeroImageForm;