import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  label?: string;
  maxFiles?: number;
  accept?: string;
  existingImages?: string[];
  onImagesChange: (images: string[]) => void;
  onNewFilesChange?: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
  showPreview?: boolean;
  previewSize?: 'sm' | 'md' | 'lg';
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label = 'Images',
  maxFiles = 5,
  accept = 'image/*',
  existingImages = [],
  onImagesChange,
  onNewFilesChange,
  disabled = false,
  className,
  showPreview = true,
  previewSize = 'md'
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<{ url: string; type: string; file?: File }[]>([]);
  const [currentImages, setCurrentImages] = useState<string[]>(existingImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update current images when existingImages prop changes
  useEffect(() => {
    setCurrentImages(existingImages);
  }, [existingImages]);

  // Generate previews for selected files
  useEffect(() => {
    if (selectedFiles.length === 0) {
      setMediaPreviews([]);
      return;
    }
    const previews = selectedFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image',
      file,
    }));
    setMediaPreviews(previews);
    
    // Cleanup
    return () => previews.forEach(p => URL.revokeObjectURL(p.url));
  }, [selectedFiles]);

  // Notify parent of changes
  useEffect(() => {
    onImagesChange(currentImages);
    if (onNewFilesChange) {
      onNewFilesChange(selectedFiles);
    }
  }, [currentImages, selectedFiles, onImagesChange, onNewFilesChange]);

  // Remove selected file before upload
  const handleRemoveSelected = (idx: number) => {
    if (disabled) return;
    setSelectedFiles(files => files.filter((_, i) => i !== idx));
  };

  // Remove existing image
  const handleRemoveExisting = (idx: number) => {
    if (disabled) return;
    setCurrentImages(images => images.filter((_, i) => i !== idx));
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (!e.target.files) return;
    
    const newFiles = Array.from(e.target.files);
    const totalFiles = selectedFiles.length + newFiles.length;
    
    if (totalFiles > maxFiles) {
      // Maximum files exceeded
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleUploadClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const getPreviewSize = () => {
    switch (previewSize) {
      case 'sm': return 'w-16 h-16';
      case 'lg': return 'w-32 h-32';
      default: return 'w-24 h-24';
    }
  };

  const totalImages = currentImages.length + mediaPreviews.length;

  return (
    <div className={cn('space-y-3', className)}>
      <Label className="text-sm font-medium">{label}</Label>
      
      {/* Upload Button */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleUploadClick}
          disabled={disabled || totalImages >= maxFiles}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Images
        </Button>
        <span className="text-xs text-muted-foreground">
          {totalImages}/{maxFiles} files
        </span>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      {/* Image Previews */}
      {showPreview && totalImages > 0 && (
        <div className="flex flex-wrap gap-3">
          {/* Existing images */}
          {currentImages.map((imageUrl, idx) => (
            <div key={`existing-${idx}`} className={cn(
              'relative border rounded overflow-hidden flex items-center justify-center bg-gray-50 group',
              getPreviewSize()
            )}>
              <img 
                src={imageUrl} 
                alt={`Upload ${idx + 1}`} 
                className="object-cover w-full h-full" 
              />
              <button
                type="button"
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveExisting(idx)}
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {/* New file previews */}
          {mediaPreviews.map((media, idx) => (
            <div key={`new-${idx}`} className={cn(
              'relative border rounded overflow-hidden flex items-center justify-center bg-gray-50 group',
              getPreviewSize()
            )}>
              {media.type === 'image' ? (
                <img 
                  src={media.url} 
                  alt="preview" 
                  className="object-cover w-full h-full" 
                />
              ) : (
                <video 
                  src={
                    media.url.startsWith('http://') || media.url.startsWith('https://') 
                      ? media.url 
                      : `${import.meta.env.VITE_BACKEND_URL}${media.url.startsWith('/') ? media.url : `/${media.url}`}`
                  } 
                  controls 
                  className="object-cover w-full h-full" 
                />
              )}
              <button
                type="button"
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveSelected(idx)}
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        Supported formats: JPG, PNG, GIF, WebP. Maximum {maxFiles} files.
      </p>
    </div>
  );
};

export default ImageUpload;
