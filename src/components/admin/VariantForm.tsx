import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Image } from "@/types/Product";
import { uploadProductImage, deleteProductImage } from "@/api/admin";

interface VariantFormProps {
  variant?: any;
  onSave: (variantData: any) => void;
  onCancel: () => void;
  isEditing?: boolean;
  token?: string | null;
  productId?: number;
  isNewProduct?: boolean;
}

export const VariantForm: React.FC<VariantFormProps> = ({
  variant,
  onSave,
  onCancel,
  isEditing = false,
  token,
  productId,
  isNewProduct = false,
}) => {
  const { toast } = useToast();

  const [variantData, setVariantData] = useState<any>(() => {
    if (variant) {
      return {
        ...variant,
        actual_price: variant.actual_price?.toString() || "",
        stock: variant.stock?.toString() || "",
      };
    }
    return {
      size: "",
      color: "",
      actual_price: "",
      stock: "",
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
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  // For new variants, we need to store uploaded images temporarily
  const [tempUploadedImages, setTempUploadedImages] = useState<Record<string, any[]>>({
    main: [],
    styling: [],
    detailed: [],
    mobile: []
  });
  // For new image files (multiple)
  const [newMainImageFiles, setNewMainImageFiles] = useState<File[]>([]);
  const [newStylingImageFiles, setNewStylingImageFiles] = useState<File[]>([]);
  const [newDetailedImageFiles, setNewDetailedImageFiles] = useState<File[]>([]);
  const [newMobileDetailedImageFiles, setNewMobileDetailedImageFiles] = useState<File[]>([]);
  
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    
    if (!variantData.size.trim()) {
      newErrors.size = "Size is required";
    }
    
    if (!variantData.color.trim()) {
      newErrors.color = "Color is required";
    }
    
    if (!variantData.actual_price) {
      newErrors.actual_price = "Price is required";
    } else {
      const price = Number.parseFloat(variantData.actual_price);
      if (isNaN(price) || price < 0) {
        newErrors.actual_price = "Please enter a valid price";
      }
    }
    
    if (!variantData.stock) {
      newErrors.stock = "Stock is required";
    } else {
      const stock = Number.parseInt(variantData.stock);
      if (isNaN(stock) || stock < 0) {
        newErrors.stock = "Please enter a valid stock quantity";
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

      const price = Number.parseFloat(variantData.actual_price);
      const stock = Number.parseInt(variantData.stock);

      setIsUploading(true);

      let formattedVariantData: any = {
        ...variantData,
        id: variantData.id || Date.now(),
        actual_price: price, // send as 'actual_price' to match backend
        stock: stock,
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
          const formData = new FormData();
          formData.append('color', variantData.color);
          formData.append('video', videoFile);
          try {
            const res = await fetch(`/api/products/${productId}/variant-video`, {
              method: 'POST',
              body: formData,
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            videoPath = data.video_url;
            setVideoFile(null);
            toast({ title: "Video uploaded successfully" });
          } catch (err: any) {
            toast({ title: 'Video upload failed', description: err.message, variant: 'destructive' });
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
              <Label htmlFor="variant-size">Size *</Label>
              <Input
                id="variant-size"
                value={variantData.size}
                onChange={(e) => {
                  setVariantData({ ...variantData, size: e.target.value });
                  if (errors.size) setErrors(prev => ({ ...prev, size: '' }));
                }}
                placeholder="S, M, L, etc."
                required
                className={errors.size ? "border-red-500" : ""}
              />
              {errors.size && <p className="text-sm text-red-500 mt-1">{errors.size}</p>}
            </div>
            <div>
              <Label htmlFor="variant-color">Color *</Label>
              <Input
                id="variant-color"
                value={variantData.color}
                onChange={(e) => {
                  setVariantData({ ...variantData, color: e.target.value });
                  if (errors.color) setErrors(prev => ({ ...prev, color: '' }));
                }}
                placeholder="Red, Blue, etc."
                required
                className={errors.color ? "border-red-500" : ""}
              />
              {errors.color && <p className="text-sm text-red-500 mt-1">{errors.color}</p>}
            </div>
            <div>
              <Label htmlFor="variant-price">Price (€) *</Label>
              <Input
                id="variant-price"
                type="number"
                step="0.01"
                min="0"
                value={variantData.actual_price}
                onChange={(e) => {
                  setVariantData({ ...variantData, actual_price: e.target.value });
                  if (errors.actual_price) setErrors(prev => ({ ...prev, actual_price: '' }));
                }}
                placeholder="e.g., 29.99"
                required
                className={errors.actual_price ? "border-red-500" : ""}
              />
              {errors.actual_price && <p className="text-sm text-red-500 mt-1">{errors.actual_price}</p>}
            </div>
            <div>
              <Label htmlFor="variant-stock">Stock *</Label>
              <Input
                id="variant-stock"
                type="number"
                min="0"
                value={variantData.stock}
                onChange={(e) => {
                  setVariantData({ ...variantData, stock: e.target.value });
                  if (errors.stock) setErrors(prev => ({ ...prev, stock: '' }));
                }}
                placeholder="0"
                required
                className={errors.stock ? "border-red-500" : ""}
              />
              {errors.stock && <p className="text-sm text-red-500 mt-1">{errors.stock}</p>}
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
            {/* Existing Images */}
            {mainImages.filter(img => img.id).length > 0 && (
              <div className="mt-2">
                <div className="font-semibold text-xs text-muted-foreground mb-1">Existing Images</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {mainImages.filter(img => img.id).map((image, index) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url.startsWith('http') ? image.url : `https://backend.nordflex.shop${image.url}`}
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
                </div>
              </div>
            )}
            {mainImages.filter(img => !img.id).map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url.startsWith('http') ? image.url : `https://backend.nordflex.shop${image.url}`}
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
            
            {stylingImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {stylingImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url.startsWith('http') ? image.url : `https://backend.nordflex.shop${image.url}`}
                      alt={image.alt_text || `Styling image ${index + 1}`}
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
                      onClick={async () => {
                        const image = stylingImages[index];
                        if (image.id && productId && token) {
                          try {
                            await deleteProductImage(productId, image.id, token);
                            toast({ title: "Styling image deleted from server" });
                          } catch (err: any) {
                            toast({ title: "Failed to delete image", description: err.message, variant: "destructive" });
                            return;
                          }
                        }
                        setStylingImages(prev => prev.filter((_, i) => i !== index));
                      }}
                      disabled={isUploading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
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
            
            {detailedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {detailedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url.startsWith('http') ? image.url : `https://backend.nordflex.shop${image.url}`}
                      alt={image.alt_text || `Detailed image ${index + 1}`}
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
                      onClick={async () => {
                        const image = detailedImages[index];
                        if (image.id && productId && token) {
                          try {
                            await deleteProductImage(productId, image.id, token);
                            toast({ title: "Detailed image deleted from server" });
                          } catch (err: any) {
                            toast({ title: "Failed to delete image", description: err.message, variant: "destructive" });
                            return;
                          }
                        }
                        setDetailedImages(prev => prev.filter((_, i) => i !== index));
                      }}
                      disabled={isUploading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
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
            
            {mobileDetailedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {mobileDetailedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url.startsWith('http') ? image.url : `https://backend.nordflex.shop${image.url}`}
                      alt={image.alt_text || `Mobile detailed image ${index + 1}`}
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
                      onClick={async () => {
                        const image = mobileDetailedImages[index];
                        if (image.id && productId && token) {
                          try {
                            await deleteProductImage(productId, image.id, token);
                            toast({ title: "Mobile detailed image deleted from server" });
                          } catch (err: any) {
                            toast({ title: "Failed to delete image", description: err.message, variant: "destructive" });
                            return;
                          }
                        }
                        setMobileDetailedImages(prev => prev.filter((_, i) => i !== index));
                      }}
                      disabled={isUploading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
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
              <div className="mt-2">
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

         {/* Action Buttons */}
         <div className="flex gap-3 pt-4">
           <Button type="button" onClick={handleSave} disabled={isUploading}>
             Save Variant
           </Button>
           <Button type="button" variant="outline" onClick={onCancel} disabled={isUploading}>
             Cancel
           </Button>
         </div>
       </div>
     </CardContent>
   </Card>
 );
};