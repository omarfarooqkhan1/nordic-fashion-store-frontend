import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical } from 'lucide-react';
import type { Image } from '@/types/Product';

interface DraggableImageListProps {
  images: Image[];
  onReorder: (images: Image[]) => void;
  onDelete: (index: number) => void;
  isUploading?: boolean;
}

export const DraggableImageList: React.FC<DraggableImageListProps> = ({
  images,
  onReorder,
  onDelete,
  isUploading = false,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    
    // Remove from old position
    newImages.splice(draggedIndex, 1);
    // Insert at new position
    newImages.splice(index, 0, draggedItem);
    
    // Update sort_order for all images
    const updatedImages = newImages.map((img, idx) => ({
      ...img,
      sort_order: idx
    }));
    
    onReorder(updatedImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
      {images.map((image, index) => (
        <div
          key={image.id || index}
          draggable={!isUploading}
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`relative group cursor-move border-2 rounded-lg overflow-hidden transition-all ${
            draggedIndex === index ? 'opacity-50 border-blue-500' : 'border-transparent hover:border-blue-300'
          } ${isUploading ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          {/* Drag Handle */}
          <div className="absolute top-1 left-1 bg-black/50 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <GripVertical className="h-4 w-4 text-white" />
          </div>
          
          {/* Image */}
          <img
            src={image.url}
            alt={image.alt_text || 'Product image'}
            className="w-full h-32 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          
          {/* Delete Button */}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete(index)}
            disabled={isUploading}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          
          {/* Order Number */}
          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
            #{index + 1}
          </div>
        </div>
      ))}
    </div>
  );
};
