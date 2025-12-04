import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Edit, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import {
  deleteHeroImage,
  updateHeroImage,
  reorderHeroImages,
  type HeroImage
} from "@/api/admin";
import HeroImageForm from "./HeroImageForm";
import { ConfirmationDialog } from "@/components/common";
// import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

export const AdminHeroImages: React.FC = () => {
  const { user, token, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingHeroImage, setEditingHeroImage] = useState<HeroImage | null>(null);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);

  const { data: heroImagesData, isLoading, error } = useQuery<HeroImage[]>({
    queryKey: ['hero-images'],
    queryFn: async () => {
      try {
        const response = await api.get("admin/hero-images");
        return response.data || [];
      } catch (error) {
        return [];
      }
    },
    enabled: true, // No token required for public route
  });

  useEffect(() => {
    if (heroImagesData) {
      setHeroImages(heroImagesData);
    }
  }, [heroImagesData]);

  const deleteMutation = useMutation({
    mutationFn: (heroImageId: number) => deleteHeroImage(heroImageId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hero-images'] });
      queryClient.invalidateQueries({ queryKey: ['hero-images'] });
      toast({ title: "Hero image deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting hero image",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateHeroImage(id, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hero-images'] });
      queryClient.invalidateQueries({ queryKey: ['hero-images'] });
      toast({ title: "Hero image updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating hero image",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (images: { id: number; sort_order: number }[]) =>
      reorderHeroImages(images, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hero-images'] });
      queryClient.invalidateQueries({ queryKey: ['hero-images'] });
      toast({ title: "Hero images reordered successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error reordering hero images",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleActive = (heroImage: HeroImage) => {
    updateMutation.mutate({
      id: heroImage.id,
      data: { is_active: !heroImage.is_active }
    });
  };

  const handleDelete = (heroImage: HeroImage) => {
    deleteMutation.mutate(heroImage.id);
  };

  const handleEdit = (heroImage: HeroImage) => {
    setEditingHeroImage(heroImage);
    setShowForm(true);
  };

  const handleSave = (heroImage: HeroImage) => {
    setShowForm(false);
    setEditingHeroImage(null);
    queryClient.invalidateQueries({ queryKey: ['admin-hero-images'] });
    queryClient.invalidateQueries({ queryKey: ['hero-images'] });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingHeroImage(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;

    const items = Array.from(heroImages);
    [items[index - 1], items[index]] = [items[index], items[index - 1]];

    const updatedItems = items.map((item, idx) => ({
      ...item,
      sort_order: idx
    }));

    setHeroImages(updatedItems);

    const reorderData = updatedItems.map((item, idx) => ({
      id: item.id,
      sort_order: idx
    }));

    reorderMutation.mutate(reorderData);
  };

  const handleMoveDown = (index: number) => {
    if (index === heroImages.length - 1) return;

    const items = Array.from(heroImages);
    [items[index], items[index + 1]] = [items[index + 1], items[index]];

    const updatedItems = items.map((item, idx) => ({
      ...item,
      sort_order: idx
    }));

    setHeroImages(updatedItems);

    const reorderData = updatedItems.map((item, idx) => ({
      id: item.id,
      sort_order: idx
    }));

    reorderMutation.mutate(reorderData);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading hero images...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error loading hero images: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Hero Images Management</h1>
          <p className="text-muted-foreground">Manage the hero images displayed on the homepage</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Hero Image
        </Button>
      </div>

      {showForm && (
        <HeroImageForm
          heroImage={editingHeroImage || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
          token={token}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Hero Images ({heroImages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {heroImages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hero images found. Add your first hero image above.
            </div>
          ) : (
            <div className="space-y-4">
              {heroImages.map((heroImage, index) => (
                <Card key={heroImage.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0 || reorderMutation.isPending}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === heroImages.length - 1 || reorderMutation.isPending}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex-shrink-0">
                        <img
                          src={heroImage ? `${import.meta.env.VITE_BACKEND_URL}${heroImage.image_url}` : "/placeholder.svg"}
                          alt={heroImage.alt_text || "Hero image"}
                          className="w-20 h-20 object-cover rounded border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={heroImage.is_active ? "default" : "secondary"}>
                            {heroImage.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Order: {heroImage.sort_order}
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate">
                          {heroImage.alt_text || "No alt text"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {heroImage.image_url}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(heroImage)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <ConfirmationDialog
                          trigger={
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                          title="Delete Hero Image"
                          description={`Are you sure you want to delete this hero image? This action cannot be undone.`}
                          confirmText="Delete"
                          onConfirm={() => handleDelete(heroImage)}
                          variant="destructive"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHeroImages;
