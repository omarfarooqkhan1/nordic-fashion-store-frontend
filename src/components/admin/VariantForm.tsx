import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Image } from "@/types/Product";
import { uploadProductImage, deleteProductImage } from "@/api/admin";
import { DraggableImageList } from "./DraggableImageList";

// Predefined color options
const PREDEFINED_COLORS = [
  "Black",
  "White",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Orange",
  "Purple",
  "Pink",
  "Brown",
  "Gray",
  "Beige",
  "Navy",
  "Maroon",
  "Olive",
  "Teal",
  "Custom" // Option to add custom color
];

interface VariantFormProps {
  variant?: any;
  onSave: (variantData: any) => void;
  onCancel: () => void;
  isEditing?: boolean;
  token?: string | null;
  productId?: number;
  isNewProduct?: boolean;
  existingVariants?: any[]; // List of existing variants to check for duplicates
}

export const VariantForm: React.FC<VariantFormProps> = ({
  variant,
  onSave,
  onCancel,
  isEditing = false,
  token,
  productId,
  isNewProduct = false,
  existingVariants = [],
}) => {
  const { toast } = useToast();

  // Check if variant has a custom color (not in predefined list)
  const isCustomColor = variant?.color && !PREDEFINED_COLORS.includes(variant.color);
  
  const [showCustomColorInput, setShowCustomColorInput] = useState(isCustomColor);
  const [customColorValue, setCustomColorValue] = useState(isCustomColor ? variant.color : '');

  const [variantData, setVariantData] = useState<any>(() => {
    if (variant) {
      return {
        ...variant,
        price: variant.price?.toString() || "",
      };
    }
    return {
      color: "",
      price: "",
      video_url: "",
    };
  });

  const [mainImages, setMainImages] = useState<Image[]>(variant?.main_images || []);
  const [stylingImages, setStylingImages] = useState<Image[]>(variant?.styling_images || []);
  const [detailedImages, setDetailedImages] = useState<Image[]>(variant?.detailed_images || []);
  const [mobileDetailedImages, setMobileDetailedImages] = useState<Image[]>(variant?.mobile_detailed_images || []);
  
  const [newMainImageFile, setNewMainImageFile] = useState<File | null>(null);
  const [newStylingImageFile, setNewStylingImageFile] = useState<File | null>(null);
  const [newDetailedImageFile, setNewDetailedImageFile] = useState<File | null>(null);
  const [newMobileDetailedImageFile, setNewMobileDetailedImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(variant?.video_file || null);
  
  // For new variants, we need to store uploaded images temporarily
  const [tempUploadedImages, setTempUploadedImages] = useState<Record<string, any[]>>({
    main: [],
    styling: [],
    detailed: [],
    mobile: []
  });
  // For new image files (multiple) - initialize from variant prop if available
  const [newMainImageFiles, setNewMainImageFiles] = useState<File[]>(variant?.main_image_files || []);
  const [newStylingImageFiles, setNewStylingImageFiles] = useState<File[]>(variant?.styling_image_files || []);
  const [newDetailedImageFiles, setNewDetailedImageFiles] = useState<File[]>(variant?.detailed_image_files || []);
  const [newMobileDetailedImageFiles, setNewMobileDetailedImageFiles] = useState<File[]>(variant?.mobile_image_files || []);
  
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save variant data when it changes (for new products only)
  useEffect(() => {
    if (isNewProduct && variantData.color && variantData.price) {
      // Debounce the save to avoid too many calls
      const timer = setTimeout(() => {
        // Include image files in the variant data
        const completeVariantData = {
          ...variantData,
          main_image_files: newMainImageFiles,
          styling_image_files: newStylingImageFiles,
          detailed_image_files: newDetailedImageFiles,
          mobile_image_files: newMobileDetailedImageFiles,
          video_file: videoFile,
        };
        onSave(completeVariantData);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [variantData, newMainImageFiles, newStylingImageFiles, newDetailedImageFiles, newMobileDetailedImageFiles, videoFile, isNewProduct, onSave]);

  // Initialize preview URLs for existing files on mount
  useEffect(() => {
    const urls: Record<string, string> = {}
    
    // Create preview URLs for image files
    newMainImageFiles.forEach((file, idx) => {
      urls[`main-${idx}`] = URL.createObjectURL(file)
    })
    newStylingImageFiles.forEach((file, idx) => {
      urls[`styling-${idx}`] = URL.createObjectURL(file)
    })
    newDetailedImageFiles.forEach((file, idx) => {
      urls[`detailed-${idx}`] = URL.createObjectURL(file)
    })
    newMobileDetailedImageFiles.forEach((file, idx) => {
      urls[`mobile-${idx}`] = URL.createObjectURL(file)
    })
    
    // Create preview URL for video file
    if (videoFile) {
      urls['video'] = URL.createObjectURL(videoFile)
    }
    
    setPreviewUrls(urls)
    
    // Cleanup function
    return () => {
      Object.values(urls).forEach(url => URL.revokeObjectURL(url))
    }
  }, []) // Only run on mount

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [previewUrls]);

  const updatePreviewUrl = (key: string, file: File) => {
    // Clean up old URL if it exists
    if (previewUrls[key]) {
      URL.revokeObjectURL(previewUrls[key]);
    }
    
    // Create new URL and update state
    const newUrl = URL.createObjectURL(file);
    setPreviewUrls(prev => ({
      ...prev,
      [key]: newUrl
    }));
  };

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>, key: string) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files);
        
        // Special handling for video files
        if (key === 'video') {
          const videoFile = files[0];
          if (!videoFile.type.startsWith('video/')) {
            toast({
              title: "Invalid file type",
              description: "Please select a video file (MP4, WebM, or QuickTime).",
              variant: "destructive",
            });
            return;
          }
          // Validate video file size (100MB limit)
          if (videoFile.size > 100 * 1024 * 1024) {
            toast({
              title: "File too large",
              description: "Video must be smaller than 100MB.",
              variant: "destructive",
            });
            return;
          }
          setter(videoFile);
          updatePreviewUrl(key, videoFile);
          return;
        }
        
        // Image file handling
        const validFiles = files.filter(file => file.type.startsWith('image/'));
        if (validFiles.length !== files.length) {
          toast({
            title: "Invalid file type",
            description: "Please select only image files.",
            variant: "destructive",
          });
          return;
        }
        // Validate file size (50MB limit per file)
        if (validFiles.some(file => file.size > 50 * 1024 * 1024)) {
          toast({
            title: "File too large",
            description: "Each image must be smaller than 50MB.",
            variant: "destructive",
          });
          return;
        }
        // Set files for each image type
  if (key === 'main') setNewMainImageFiles(prev => [...prev, ...validFiles]);
  if (key === 'styling') setNewStylingImageFiles(prev => [...prev, ...validFiles]);
  if (key === 'detailed') setNewDetailedImageFiles(prev => [...prev, ...validFiles]);
  if (key === 'mobile') setNewMobileDetailedImageFiles(prev => [...prev, ...validFiles]);
        // Optionally update preview for first file
        if (validFiles[0]) updatePreviewUrl(key, validFiles[0]);
      }
    };

  const uploadImage = async (file: File, imageType: string): Promise<any> => {
    if (isNewProduct) {
      // For new products, handle images locally
      return await handleImageUploadForNewProduct(file, imageType);
    }

    if (!productId || !token) {
      throw new Error("Product ID and token are required for image upload");
    }

    // For new variants, we can't associate images until the variant is saved
    // For existing variants, we can associate images directly
    if (variantData.id) {
      return await uploadProductImage(productId, file, token, imageType, variantData.id);
    } else {
      // For new variants, we'll upload to product and reassign later
      // But we still need to specify the image type
      return await uploadProductImage(productId, file, token, imageType);
    }
  };

  // For new products, we need to handle image uploads differently
  const handleImageUploadForNewProduct = async (file: File, imageType: string): Promise<any> => {
    if (!token) {
      throw new Error("Token is required for image upload");
    }

    // For new products, we can't upload images until the product is created
    // So we'll create a temporary image object that will be handled later
    return {
      id: Date.now() + Math.random(), // Temporary ID
      url: URL.createObjectURL(file),
      alt_text: `${imageType} image`,
      image_type: imageType,
      is_temporary: true,
      file: file
    };
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!variantData.color.trim()) {
      newErrors.color = "Color is required";
    } else {
      // Check for duplicate colors (exclude current variant when editing)
      const isDuplicate = existingVariants.some(
        (v) => v.id !== variant?.id && v.color?.toLowerCase() === variantData.color.toLowerCase()
      );
      
      if (isDuplicate) {
        newErrors.color = `A variant with color "${variantData.color}" already exists`;
      }
    }
    
    if (!variantData.price) {
      newErrors.price = "Price is required";
    } else {
      const price = Number.parseFloat(variantData.price);
      if (isNaN(price) || price < 0) {
        newErrors.price = "Please enter a valid price";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    try {
      if (!validateForm()) {
        toast({
          title: "Validation Error",
          description: "Please fix the errors in the form before saving.",
          variant: "destructive",
        });
        return;
      }

    const price = Number.parseFloat(variantData.price);

      setIsUploading(true);

      let formattedVariantData: any = {
         ...variantData,
         id: variantData.id || Date.now(),
   price: price,
       };

      if (isNewProduct) {
        // For new products, just pass selected files up to ProductForm
        formattedVariantData = {
          ...formattedVariantData,
          main_image_files: newMainImageFiles,
          styling_image_files: newStylingImageFiles,
          detailed_image_files: newDetailedImageFiles,
          mobile_image_files: newMobileDetailedImageFiles,
          video_file: videoFile,
        };
      } else if (!variantData.id) {
        // For new variants being added to existing products, also pass files
        formattedVariantData = {
          ...formattedVariantData,
          main_image_files: newMainImageFiles,
          styling_image_files: newStylingImageFiles,
          detailed_image_files: newDetailedImageFiles,
          mobile_image_files: newMobileDetailedImageFiles,
          video_file: videoFile,
        };
      } else {
        // ...existing upload logic for existing products...
        // Upload all selected files for each image type
        const uploadedImages = {
          main: [...mainImages],
          styling: [...stylingImages],
          detailed: [...detailedImages],
          mobile: [...mobileDetailedImages],
        };
        const tempImageIds: number[] = [];

        const uploadMultiple = async (files: File[], type: string) => {
          const results: any[] = [];
          for (const file of files) {
            toast({ title: `Uploading ${type} image...`, description: `Uploading ${file.name}` });
            const uploadedImage = await uploadImage(file, type);
            results.push(uploadedImage);
            toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} image uploaded successfully` });
          }
          return results;
        };

        // Main images
        if (newMainImageFiles.length > 0) {
          const results = await uploadMultiple(newMainImageFiles, 'main');
          if (variantData.id) {
            uploadedImages.main.push(...results);
          } else {
            tempImageIds.push(...results.map(img => img.id));
            setTempUploadedImages(prev => ({ ...prev, main: [...prev.main, ...results] }));
          }
        }

        // Styling images
        if (newStylingImageFiles.length > 0) {
          const results = await uploadMultiple(newStylingImageFiles, 'styling');
          if (variantData.id) {
            uploadedImages.styling.push(...results);
          } else {
            tempImageIds.push(...results.map(img => img.id));
            setTempUploadedImages(prev => ({ ...prev, styling: [...prev.styling, ...results] }));
          }
        }

        // Detailed images
        if (newDetailedImageFiles.length > 0) {
          const results = await uploadMultiple(newDetailedImageFiles, 'detailed');
          if (variantData.id) {
            uploadedImages.detailed.push(...results);
          } else {
            tempImageIds.push(...results.map(img => img.id));
            setTempUploadedImages(prev => ({ ...prev, detailed: [...prev.detailed, ...results] }));
          }
        }

        // Mobile detailed images
        if (newMobileDetailedImageFiles.length > 0) {
          const results = await uploadMultiple(newMobileDetailedImageFiles, 'mobile');
          if (variantData.id) {
            uploadedImages.mobile.push(...results);
          } else {
            tempImageIds.push(...results.map(img => img.id));
            setTempUploadedImages(prev => ({ ...prev, mobile: [...prev.mobile, ...results] }));
          }
        }

        // Upload video if it exists (deferred until save)
        let videoPath = variantData.video_url;
        if (videoFile && productId && token) {
          toast({
            title: "Uploading video...",
            description: "Please wait while we upload your video.",
          });
          
          console.log('Starting video upload:', {
            productId,
            color: variantData.color,
            fileName: videoFile.name,
            fileSize: videoFile.size,
            fileType: videoFile.type
          });
          
          const formData = new FormData();
          formData.append('color', variantData.color);
          formData.append('video', videoFile);
          
          try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
            const uploadUrl = `${apiBaseUrl}/products/${productId}/variant-video`;
            
            console.log('Upload URL:', uploadUrl);
            console.log('Token present:', !!token);
            
            const res = await fetch(uploadUrl, {
              method: 'POST',
              body: formData,
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              },
            });
            
            console.log('Response status:', res.status);
            console.log('Response ok:', res.ok);
            
            if (!res.ok) {
              const errorText = await res.text();
              console.error('Error response:', errorText);
              
              let errorData;
              try {
                errorData = JSON.parse(errorText);
              } catch {
                errorData = { message: errorText || 'Upload failed' };
              }
              
              // Show detailed error message
              let errorMessage = errorData.message || `Upload failed with status ${res.status}`;
              
              if (errorData.errors?.video) {
                errorMessage += ': ' + errorData.errors.video.join(', ');
              }
              
              if (errorData.php_limits) {
                errorMessage += `\n\nPHP Limits:\n- Max upload: ${errorData.php_limits.upload_max_filesize}\n- Max post: ${errorData.php_limits.post_max_size}`;
              }
              
              throw new Error(errorMessage);
            }
            
            const data = await res.json();
            console.log('Upload response:', data);
            
            videoPath = data.video_path || data.video_url;
            setVideoFile(null);
            
            toast({ 
              title: "Video uploaded successfully",
              description: `Video saved for ${variantData.color} variants`
            });
          } catch (err: any) {
            console.error('Video upload error:', err);
            toast({ 
              title: 'Video upload failed', 
              description: err.message || 'Unknown error occurred', 
              variant: 'destructive' 
            });
          }
        }

        formattedVariantData = {
          ...formattedVariantData,
          main_images: uploadedImages.main,
          styling_images: uploadedImages.styling,
          detailed_images: uploadedImages.detailed,
          mobile_detailed_images: uploadedImages.mobile,
          video_url: videoPath,
          temp_image_ids: tempImageIds.length > 0 ? tempImageIds : undefined
        };
        
        // Save image order if variant exists
        if (variantData.id && productId && token) {
          try {
            const { updateVariantImageOrder } = await import('@/api/admin');
            
            // Collect all images with their sort_order
            const allImages = [
              ...uploadedImages.main,
              ...uploadedImages.styling,
              ...uploadedImages.detailed,
              ...uploadedImages.mobile
            ].filter(img => img.id); // Only existing images with IDs
            
            if (allImages.length > 0) {
              const imageUpdates = allImages.map(img => ({
                id: img.id,
                sort_order: img.sort_order || 0
              }));
              
              await updateVariantImageOrder(productId, variantData.id, imageUpdates, token);
            }
          } catch (err: any) {
            console.error('Failed to save image order:', err);
            // Don't block the save if image order update fails
          }
        }
      }

      // Clean up preview URLs
      Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls({});
      setIsUploading(false);
      onSave(formattedVariantData);
    } catch (err: any) {
      setIsUploading(false);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Variant" : "Add New Variant"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="variant-color">Color *</Label>
              {showCustomColorInput ? (
                <div className="space-y-2">
                  <Input
                    id="variant-color-custom"
                    value={customColorValue}
                    onChange={(e) => {
                      setCustomColorValue(e.target.value);
                      setVariantData({ ...variantData, color: e.target.value });
                      if (errors.color) setErrors(prev => ({ ...prev, color: '' }));
                    }}
                    placeholder="Enter custom color"
                    required
                    className={errors.color ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCustomColorInput(false);
                      setCustomColorValue('');
                      setVariantData({ ...variantData, color: '' });
                    }}
                  >
                    Back to dropdown
                  </Button>
                </div>
              ) : (
                <Select
                  value={variantData.color}
                  onValueChange={(value) => {
                    if (value === 'Custom') {
                      setShowCustomColorInput(true);
                      setCustomColorValue('');
                    } else {
                      setVariantData({ ...variantData, color: value });
                      if (errors.color) setErrors(prev => ({ ...prev, color: '' }));
                    }
                  }}
                >
                  <SelectTrigger className={errors.color ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_COLORS.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                    <SelectItem value="Custom">+ Add Custom Color</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {errors.color && <p className="text-sm text-red-500 mt-1">{errors.color}</p>}
            </div>
            <div>
              <Label htmlFor="variant-price">Price (€) *</Label>
              <Input
                id="variant-price"
                type="number"
                step="0.01"
                min="0"
                value={variantData.price}
                onChange={(e) => {
                  setVariantData({ ...variantData, price: e.target.value });
                  if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
                }}
                placeholder="e.g., 29.99"
                required
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
            </div>
          </div>
          {/* Main Images */}
          <div className="space-y-3">
            <Label>Main Images</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange(() => {}, 'main')}
              />
              <span className="text-xs text-muted-foreground">You can select multiple images.</span>
            </div>
            {/* Existing Images - Draggable */}
            {mainImages.filter(img => img.id).length > 0 && (
              <div className="mt-2">
                <div className="font-semibold text-xs text-muted-foreground mb-1">Existing Images (Drag to reorder)</div>
                <DraggableImageList
                  images={mainImages.filter(img => img.id)}
                  onReorder={(reorderedImages) => {
                    // Update the images with new sort_order
                    const updatedImages = reorderedImages.map((img, idx) => ({
                      ...img,
                      sort_order: idx
                    }));
                    setMainImages(prev => [
                      ...updatedImages,
                      ...prev.filter(img => !img.id)
                    ]);
                  }}
                  onDelete={async (index) => {
                    const existingImages = mainImages.filter(img => img.id);
                    const image = existingImages[index];
                    if (image.id && productId && token) {
                      try {
                        await deleteProductImage(productId, image.id, token);
                      } catch (err: any) {
                        toast({ title: "Failed to delete image", description: err.message, variant: "destructive" });
                      }
                    }
                    setMainImages(prev => prev.filter(img => img.id !== image.id));
                  }}
                  isUploading={isUploading}
                />
              </div>
            )}
            {mainImages.filter(img => !img.id).map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url.startsWith('http') ? image.url : `https://backend.nordflex.store${image.url}`}
                  alt={image.alt_text || `Main image`}
                  className="w-full h-24 object-cover rounded border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setMainImages(prev => prev.filter((_, i) => i !== index))}
                  disabled={isUploading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {newMainImageFiles.length > 0 && (
              <div className="mt-2">
                <div className="font-semibold text-xs text-muted-foreground mb-1">Selected Images (not yet uploaded)</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {newMainImageFiles.map((file, index) => {
                    const url = URL.createObjectURL(file);
                    return (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={file.name}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setNewMainImageFiles(prev => prev.filter((_, i) => i !== index));
                            URL.revokeObjectURL(url);
                          }}
                          title="Remove this image"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg truncate">
                          {file.name}
                        </div>
                        <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
                          #{index + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Styling Images */}
          <div className="space-y-3">
            <Label>Styling Images</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange(() => {}, 'styling')}
              />
              <span className="text-xs text-muted-foreground">You can select multiple images.</span>
            </div>
            
            {stylingImages.filter(img => img.id).length > 0 && (
              <div className="mt-2">
                <div className="font-semibold text-xs text-muted-foreground mb-1">Existing Images (Drag to reorder)</div>
                <DraggableImageList
                  images={stylingImages.filter(img => img.id)}
                  onReorder={(reorderedImages) => {
                    const updatedImages = reorderedImages.map((img, idx) => ({
                      ...img,
                      sort_order: idx
                    }));
                    setStylingImages(prev => [
                      ...updatedImages,
                      ...prev.filter(img => !img.id)
                    ]);
                  }}
                  onDelete={async (index) => {
                    const existingImages = stylingImages.filter(img => img.id);
                    const image = existingImages[index];
                    if (image.id && productId && token) {
                      try {
                        await deleteProductImage(productId, image.id, token);
                      } catch (err: any) {
                        toast({ title: "Failed to delete image", description: err.message, variant: "destructive" });
                      }
                    }
                    setStylingImages(prev => prev.filter(img => img.id !== image.id));
                  }}
                  isUploading={isUploading}
                />
              </div>
            )}
            
            {newStylingImageFiles.length > 0 && (
              <div className="mt-2">
                <div className="font-semibold text-xs text-muted-foreground mb-1">Selected Styling Images (not yet uploaded)</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {newStylingImageFiles.map((file, index) => {
                    const url = URL.createObjectURL(file);
                    return (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={file.name}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setNewStylingImageFiles(prev => prev.filter((_, i) => i !== index));
                            URL.revokeObjectURL(url);
                          }}
                          title="Remove this image"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg truncate">
                          {file.name}
                        </div>
                        <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
                          #{index + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Detailed Images */}
          <div className="space-y-3">
            <Label>Detailed Images</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange(() => {}, 'detailed')}
              />
              <span className="text-xs text-muted-foreground">You can select multiple images.</span>
            </div>
            
            {detailedImages.filter(img => img.id).length > 0 && (
              <div className="mt-2">
                <div className="font-semibold text-xs text-muted-foreground mb-1">Existing Images (Drag to reorder)</div>
                <DraggableImageList
                  images={detailedImages.filter(img => img.id)}
                  onReorder={(reorderedImages) => {
                    const updatedImages = reorderedImages.map((img, idx) => ({
                      ...img,
                      sort_order: idx
                    }));
                    setDetailedImages(prev => [
                      ...updatedImages,
                      ...prev.filter(img => !img.id)
                    ]);
                  }}
                  onDelete={async (index) => {
                    const existingImages = detailedImages.filter(img => img.id);
                    const image = existingImages[index];
                    if (image.id && productId && token) {
                      try {
                        await deleteProductImage(productId, image.id, token);
                      } catch (err: any) {
                        toast({ title: "Failed to delete image", description: err.message, variant: "destructive" });
                      }
                    }
                    setDetailedImages(prev => prev.filter(img => img.id !== image.id));
                  }}
                  isUploading={isUploading}
                />
              </div>
            )}
            
            {newDetailedImageFiles.length > 0 && (
              <div className="mt-2">
                <div className="font-semibold text-xs text-muted-foreground mb-1">Selected Detailed Images (not yet uploaded)</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {newDetailedImageFiles.map((file, index) => {
                    const url = URL.createObjectURL(file);
                    return (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={file.name}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setNewDetailedImageFiles(prev => prev.filter((_, i) => i !== index));
                            URL.revokeObjectURL(url);
                          }}
                          title="Remove this image"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg truncate">
                          {file.name}
                        </div>
                        <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
                          #{index + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Detailed Images */}
          <div className="space-y-3">
            <Label>Mobile Detailed Images</Label>
            
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange(() => {}, 'mobile')}
              />
              <span className="text-xs text-muted-foreground">You can select multiple images.</span>
            </div>
            
            {mobileDetailedImages.filter(img => img.id).length > 0 && (
              <div className="mt-2">
                <div className="font-semibold text-xs text-muted-foreground mb-1">Existing Images (Drag to reorder)</div>
                <DraggableImageList
                  images={mobileDetailedImages.filter(img => img.id)}
                  onReorder={(reorderedImages) => {
                    const updatedImages = reorderedImages.map((img, idx) => ({
                      ...img,
                      sort_order: idx
                    }));
                    setMobileDetailedImages(prev => [
                      ...updatedImages,
                      ...prev.filter(img => !img.id)
                    ]);
                  }}
                  onDelete={async (index) => {
                    const existingImages = mobileDetailedImages.filter(img => img.id);
                    const image = existingImages[index];
                    if (image.id && productId && token) {
                      try {
                        await deleteProductImage(productId, image.id, token);
                      } catch (err: any) {
                        toast({ title: "Failed to delete image", description: err.message, variant: "destructive" });
                      }
                    }
                    setMobileDetailedImages(prev => prev.filter(img => img.id !== image.id));
                  }}
                  isUploading={isUploading}
                />
              </div>
            )}
            
            {newMobileDetailedImageFiles.length > 0 && (
              <div className="mt-2">
                <div className="font-semibold text-xs text-muted-foreground mb-1">Selected Mobile Detailed Images (not yet uploaded)</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {newMobileDetailedImageFiles.map((file, index) => {
                    const url = URL.createObjectURL(file);
                    return (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={file.name}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setNewMobileDetailedImageFiles(prev => prev.filter((_, i) => i !== index));
                            URL.revokeObjectURL(url);
                          }}
                          title="Remove this image"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg truncate">
                          {file.name}
                        </div>
                        <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
                          #{index + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Video */}
          <div className="space-y-3">
            <Label>Variant Video</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleFileChange(setVideoFile, 'video')}
              />
              <Button 
                type="button" 
                onClick={() => {
                  if (videoFile) {
                    toast({ title: "Video selected for upload" });
                  }
                }}
                disabled={!videoFile || isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Select
              </Button>
            </div>
            
            {variantData.video_url && (
              <div className="mt-2 relative">
                <video
                  src={
                    variantData.video_url.startsWith('http') 
                      ? variantData.video_url 
                      : `${import.meta.env.VITE_BACKEND_URL}${variantData.video_url.startsWith('/') ? variantData.video_url : `/${variantData.video_url}`}`
                  }
                  className="w-full h-32 object-cover rounded border"
                  controls
                  onError={(e) => {
                    (e.target as HTMLVideoElement).src = '/placeholder.svg';
                  }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={async () => {
                    if (!productId || !token || !variantData.color) {
                      toast({
                        title: "Cannot delete video",
                        description: "Missing required information",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    try {
                      const { deleteVariantVideo } = await import('@/api/admin');
                      await deleteVariantVideo(productId, variantData.color, token);
                      setVariantData({ ...variantData, video_url: '' });
                      toast({
                        title: "Video deleted",
                        description: "Video has been removed from all variants of this color"
                      });
                    } catch (err: any) {
                      toast({
                        title: "Failed to delete video",
                        description: err.message,
                        variant: "destructive"
                      });
                    }
                  }}
                  disabled={isUploading}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Video
                </Button>
                <p className="text-xs text-muted-foreground mt-1">Current video</p>
              </div>
            )}
            
            {previewUrls.video && (
              <div className="mt-2">
                <video 
                  src={previewUrls.video} 
                  className="w-full h-32 object-cover rounded border" 
                  controls
                />
                <p className="text-xs text-muted-foreground mt-1">Preview of selected video</p>
              </div>
            )}
          </div>

         {/* Action Buttons - Only show for existing products */}
         {!isNewProduct && (
           <div className="flex gap-4 pt-4">
             <Button
               type="button"
               onClick={handleSave}
               disabled={isUploading}
               className="bg-gold-500 hover:bg-gold-600 text-leather-900 font-semibold"
             >
               {isUploading ? "Saving..." : "Save Variant"}
             </Button>
             <Button
               type="button"
               variant="outline"
               onClick={onCancel}
               disabled={isUploading}
             >
               Cancel
             </Button>
           </div>
         )}
       </div>
     </CardContent>
   </Card>
 );
};