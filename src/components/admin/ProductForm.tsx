import React, { useState, useRef, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Upload } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useToast } from "@/hooks/use-toast"
import {
  uploadProductImage,
  deleteProductImage,
  deleteSizeGuideImage,
  type ProductFormData,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant
} from "@/api/admin"
import type { Product, Category } from "@/api/admin"
import { VariantForm } from "./VariantForm"
import { MultiVariantForm } from "./MultiVariantForm"
import { ExistingVariantsList } from "./ExistingVariantsList"
import { DeleteVariantDialog } from "./DeleteVariantDialog"

interface ProductFormProps {
  product?: Product
  onSave: (data: ProductFormData, images?: File[], variants?: any[]) => void
  onCancel: () => void
  categories: Category[]
  token: string | null
  isCreatingProduct?: boolean
  isNewProduct?: boolean
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSave,
  onCancel,
  categories,
  token,
  isCreatingProduct,
  isNewProduct = false
}) => {
  // --- State and hooks ---

  const [variants, setVariants] = useState<any[]>(product?.variants || [])
  const [isAddingVariant, setIsAddingVariant] = useState(!product) // Expand by default for new products
  const [editingVariant, setEditingVariant] = useState<any | null>(null)
  const [deletingVariant, setDeletingVariant] = useState<any | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || "",
    description: product?.description || "",
    category_id: product?.category?.id ?? 0,
    gender: product?.gender || "unisex",
    is_active: product?.is_active ?? true,
    available_sizes: product?.available_sizes || [],
  });
  const [sizeGuideFile, setSizeGuideFile] = useState<File | null>(null);
  const sizeGuideInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();
  const { language, t } = useLanguage();

  // Cleanup object URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (sizeGuideFile) {
        URL.revokeObjectURL(URL.createObjectURL(sizeGuideFile));
      }
    };
  }, [sizeGuideFile]);

  // ...other hooks and logic...

  // --- Render VariantForm conditionally ---
  // Architecture:
  // - MultiVariantForm: For NEW products - allows adding multiple variants with collapse/expand UI
  // - VariantForm: For EXISTING products - single variant add/edit with immediate save
  function renderVariantForm() {
    if (!(isAddingVariant || editingVariant)) return null

    // For new products, use MultiVariantForm to add multiple variants at once
    if (!product) {
      return (
        <MultiVariantForm
          variants={variants}
          onVariantsChange={setVariants}
          product={product}
          token={token}
          isNewProduct={true}
        />
      )
    }

    // For existing products, use single VariantForm for add/edit
    if (editingVariant) {
      // Editing a single existing variant
      return (
        <VariantForm
          key={`edit-variant-${editingVariant.id}`}
          variant={editingVariant}
          existingVariants={variants}
          onSave={async (variantData) => {
            // Update existing variant
            if (product && token) {
              try {
                const result = await updateProductVariant(
                  product.id,
                  variantData.id,
                  {
                    color: variantData.color,
                    price: Number(variantData.price),
                    sku: variantData.sku,
                  },
                  token
                )

                setVariants(prev =>
                  prev.map(v =>
                    v.id === variantData.id ? { ...variantData, ...result.variant } : v
                  )
                )

                setEditingVariant(null)
                setIsAddingVariant(false)
                
                // Invalidate queries to refresh the product data
                queryClient.invalidateQueries({ queryKey: ["admin-products"] })
                queryClient.invalidateQueries({ queryKey: ["product", product.id.toString()] })
                
                toast.toast({ title: "Variant updated successfully" })
              } catch (error: any) {
                toast.toast({
                  title: "Error updating variant",
                  description: error.message,
                  variant: "destructive",
                })
              }
            }
          }}
          onCancel={() => {
            setIsAddingVariant(false)
            setEditingVariant(null)
          }}
          isEditing={true}
          token={token}
          productId={product?.id}
        />
      )
    }

    // Adding new variant to existing product - use single form with save button
    return (
      <VariantForm
        variant={undefined}
        existingVariants={variants}
        onSave={async (variantData) => {
          // Add new variant
          const isDuplicate = variants.some(
            (v) =>
              v.color.toLowerCase() === variantData.color.toLowerCase()
          )

          if (isDuplicate) {
            toast.toast({
              title: "Duplicate Variant",
              description: `A variant with color "${variantData.color}" already exists.`,
              variant: "destructive",
            })
            return
          }

          if (product && token) {
            try {
              const variantPayload = {
                color: variantData.color,
                price: Number(variantData.price),
                sku: variantData.sku,
              }

              if (variantData.temp_image_ids && variantData.temp_image_ids.length > 0) {
                (variantPayload as any).temp_image_ids = variantData.temp_image_ids
              }

              const result = await createProductVariant(
                product.id,
                variantPayload,
                token
              )

              // Upload variant images if any
              const variantId = result.variant?.id
              if (variantId) {
                // Upload main images
                if (variantData.main_image_files && variantData.main_image_files.length > 0) {
                  for (const file of variantData.main_image_files) {
                    await uploadProductImage(product.id, file, token, 'main', variantId)
                  }
                }

                // Upload styling images
                if (variantData.styling_image_files && variantData.styling_image_files.length > 0) {
                  for (const file of variantData.styling_image_files) {
                    await uploadProductImage(product.id, file, token, 'styling', variantId)
                  }
                }

                // Upload detailed images
                if (variantData.detailed_image_files && variantData.detailed_image_files.length > 0) {
                  for (const file of variantData.detailed_image_files) {
                    await uploadProductImage(product.id, file, token, 'detailed', variantId)
                  }
                }

                // Upload mobile images
                if (variantData.mobile_image_files && variantData.mobile_image_files.length > 0) {
                  for (const file of variantData.mobile_image_files) {
                    await uploadProductImage(product.id, file, token, 'mobile', variantId)
                  }
                }

                // Upload video
                if (variantData.video_file) {
                  const formData = new FormData()
                  formData.append('color', variantData.color)
                  formData.append('video', variantData.video_file)
                  
                  try {
                    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
                    const uploadUrl = `${apiBaseUrl}/products/${product.id}/variant-video`
                    
                    const res = await fetch(uploadUrl, {
                      method: 'POST',
                      body: formData,
                      headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                      },
                    })
                    
                    if (!res.ok) {
                      console.error('Video upload failed:', await res.text())
                    }
                  } catch (err: any) {
                    console.error('Video upload error:', err)
                  }
                }
              }

              setVariants(prev => [...prev, { ...variantData, ...result.variant }])
              setIsAddingVariant(false)
              
              // Invalidate queries to refresh the product data
              queryClient.invalidateQueries({ queryKey: ["admin-products"] })
              queryClient.invalidateQueries({ queryKey: ["product", product.id.toString()] })
              
              toast.toast({ title: "Variant added successfully" })
            } catch (error: any) {
              toast.toast({
                title: "Error creating variant",
                description: error.message,
                variant: "destructive",
              })
            }
          }
        }}
        onCancel={() => {
          setIsAddingVariant(false)
          setEditingVariant(null)
        }}
        isEditing={false}
        token={token}
        productId={product?.id}
      />
    )
  }

  // Variant management functions
  const handleDeleteVariant = async (variantId: number) => {
    if (!product || !token) {
      toast.toast({
        title: "Error",
        description: "Cannot delete variant: missing product or authentication",
        variant: "destructive",
      });
      return;
    }

    // Find the variant to show in confirmation dialog
    const variantToDelete = variants.find(v => v.id === variantId);
    if (!variantToDelete) {
      toast.toast({
        title: "Error",
        description: "Variant not found",
        variant: "destructive",
      });
      return;
    }

    // Show confirmation dialog
    setDeletingVariant(variantToDelete);
  };

  const confirmDeleteVariant = async () => {
    if (!deletingVariant || !product || !token) return;

    try {
      await deleteProductVariant(deletingVariant.id, token);
      
      // Remove from local state
      setVariants((prev) => prev.filter((v) => v.id !== deletingVariant.id));
      
      // Invalidate queries to refresh the product data
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["product", product.id.toString()] });
      
      toast.toast({ 
        title: "Variant deleted successfully",
        description: "The variant has been removed from the product"
      });
      
      setDeletingVariant(null);
    } catch (error: any) {
      toast.toast({
        title: "Error deleting variant",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Function to group variants by color
  const getVariantsByColor = () => {
    const colorGroups: Record<string, any[]> = {};
    variants.forEach(variant => {
      const colorKey = variant.color ? variant.color.toLowerCase() : 'unknown';
      if (!colorGroups[colorKey]) {
        colorGroups[colorKey] = [];
      }
      colorGroups[colorKey].push(variant);
    });
    return colorGroups;
  };

  // Update the handleSubmit function to handle variant videos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Removed: For new products, require at least one variant
    // Now, allow product creation without variants

    // Validate that all variants have valid prices
    const invalidPriceVariants = variants.filter(variant =>
      variant.price === undefined ||
      variant.price === null ||
      variant.price === "" ||
      isNaN(Number(variant.price)) ||
      Number(variant.price) < 0
    );

    if (invalidPriceVariants.length > 0) {
      toast.toast({
        title: "Invalid variant prices",
        description: `Found ${invalidPriceVariants.length} variant(s) with invalid prices. All variants must have valid positive prices.`,
        variant: "destructive",
      });
      return;
    }


    // Upload size guide image if a new file is selected
    if (sizeGuideFile && product && token) {
      try {
        // If there's an existing size guide, delete it first
        if (product.size_guide_image) {
          try {
            await deleteSizeGuideImage(product.id, token);
          } catch (error) {
            // Log but don't fail if delete fails - we'll replace anyway
            console.warn('Failed to delete old size guide:', error);
          }
        }
        
        await uploadProductImage(product.id, sizeGuideFile, token, 'size_guide');
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        // Also invalidate the specific product query to refresh the size guide image
        queryClient.invalidateQueries({ queryKey: ["product", product.id.toString()] });
        setSizeGuideFile(null);
        if (sizeGuideInputRef.current) sizeGuideInputRef.current.value = "";
        toast.toast({ title: "Size guide image uploaded successfully" });
      } catch (error: any) {
        toast.toast({ title: "Failed to upload size guide image", description: error.message, variant: "destructive" });
        return;
      }
    }

    // Pass the form data and variants
    // Ensure all variants have valid prices and preserve image files
    const formattedVariants = variants.map(variant => ({
      ...variant,
      price: Number(variant.price),
      // Preserve image files for upload
      main_image_files: variant.main_image_files || [],
      styling_image_files: variant.styling_image_files || [],
      detailed_image_files: variant.detailed_image_files || [],
      mobile_image_files: variant.mobile_image_files || [],
      video_file: variant.video_file || null,
    }));

    onSave(formData, [], formattedVariants);
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>{product ? "Edit Product" : "Add New Product"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category_id.toString()}
                onValueChange={(value) => setFormData({ ...formData, category_id: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value as "male" | "female" | "unisex" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{language === "en" ? "Male" : t("gender.male")}</SelectItem>
                  <SelectItem value="female">{language === "en" ? "Female" : t("gender.female")}</SelectItem>
                  <SelectItem value="unisex">{language === "en" ? "Unisex" : t("gender.unisex")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.discount || ""}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData({ ...formData, discount: value === "" ? 0 : Number.parseFloat(value) || 0 })
                }}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Optional: Discount percentage for the product (0-100%)
              </p>
            </div>
            <div>
              <Label htmlFor="is_active">Product Status *</Label>
              <Select
                value={formData.is_active ? "true" : "false"}
                onValueChange={(value) => setFormData({ ...formData, is_active: value === "true" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                {product ? "Set whether this product is visible to customers" : "New products are inactive by default"}
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Available Sizes Selection */}
          <div>
            <Label>Available Sizes *</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {['XS', 'S', 'M', 'L', 'XL', 'One Size'].map((size) => (
                <label
                  key={size}
                  className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  <Checkbox
                    checked={formData.available_sizes?.includes(size) || false}
                    onCheckedChange={(checked) => {
                      const currentSizes = formData.available_sizes || [];
                      if (checked) {
                        setFormData({ ...formData, available_sizes: [...currentSizes, size] });
                      } else {
                        setFormData({ ...formData, available_sizes: currentSizes.filter(s => s !== size) });
                      }
                    }}
                  />
                  <span className="text-sm font-medium">{size}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Select all sizes available for this product. Customers will choose from these sizes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="size_guide_image_upload">Size Guide Image</Label>
              <Input
                id="size_guide_image_upload"
                type="file"
                accept="image/*"
                ref={sizeGuideInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSizeGuideFile(e.target.files[0]);
                    toast.toast({
                      title: "Image selected",
                      description: `${e.target.files[0].name} - Click "Save Product" to upload`
                    });
                  }
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {product?.size_guide_image 
                  ? "Select a new image to replace the current size guide" 
                  : "Upload a size guide image (JPG, PNG, etc.)"}
              </p>
              
              {/* Show selected file preview with image */}
              {sizeGuideFile && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded">
                  <div className="flex items-start gap-3">
                    <img
                      src={URL.createObjectURL(sizeGuideFile)}
                      alt="Size Guide Preview"
                      className="w-32 h-32 object-cover rounded border"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        ✓ New image selected
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {sizeGuideFile.name}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Click "Save Product" to upload
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {(product?.size_guide_image || (product?.allImages?.some(img => img.image_type === 'size_guide'))) && !sizeGuideFile && (
                <div className="mt-2 relative inline-block">
                  {(() => {
                    let imageUrl = product.size_guide_image;
                    try {
                      if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
                        const backendUrl = import.meta.env.VITE_BACKEND_URL;
                        imageUrl = `${backendUrl}${imageUrl}`;
                      }
                    } catch (error) {
                      imageUrl = product.size_guide_image; // Fallback to original
                    }
                    return (
                      <>
                        <img
                          src={imageUrl}
                          alt="Size Guide"
                          className="w-48 border rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              sizeGuideInputRef.current?.click();
                            }}
                            title="Replace size guide image"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Replace
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              if (!product?.id || !token) {
                                toast.toast({
                                  title: "Cannot delete image",
                                  description: "Missing required information",
                                  variant: "destructive"
                                });
                                return;
                              }
                              
                              try {
                                await deleteSizeGuideImage(product.id, token);
                                
                                // Immediately update local state
                                if (product) {
                                  product.size_guide_image = null;
                                  if (product.allImages) {
                                    product.allImages = product.allImages.filter(img => img.image_type !== 'size_guide');
                                  }
                                }
                                
                                // Invalidate queries to refresh the product data
                                await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
                                await queryClient.invalidateQueries({ queryKey: ["product", product.id.toString()] });
                                
                                toast.toast({
                                  title: "Size guide deleted",
                                  description: "Size guide image has been removed"
                                });
                              } catch (err: any) {
                                toast.toast({
                                  title: "Failed to delete size guide",
                                  description: err.message,
                                  variant: "destructive"
                                });
                              }
                            }}
                            title="Delete size guide image"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Variant Forms - Show inline for new products, or when editing/adding variants for existing products */}
          {renderVariantForm()}

          {/* Product Variants Section */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Product Variants & Stock</Label>

            {/* Add New Variant Button - Only show for existing products */}
            {!isAddingVariant && !editingVariant && product && (
              <Button
                type="button"
                onClick={() => {
                  setIsAddingVariant(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Variant
              </Button>
            )}

            {/* Existing Variants */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Product Variants ({variants.length})</h3>
              {product ? (
                <ExistingVariantsList
                  variants={variants}
                  onEdit={(variant) => {
                    setEditingVariant(variant);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onDelete={handleDeleteVariant}
                />
              ) : null}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isCreatingProduct}
              className="bg-gold-500 hover:bg-gold-600 text-leather-900 font-semibold"
            >
              {isCreatingProduct ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {product ? "Updating..." : "Creating..."}
                </>
              ) : product ? (
                "Update Product"
              ) : (
                "Add New Product"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isCreatingProduct}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    {/* Delete Variant Confirmation Dialog */}
    <DeleteVariantDialog
      open={!!deletingVariant}
      onOpenChange={(open) => !open && setDeletingVariant(null)}
      onConfirm={confirmDeleteVariant}
      variant={deletingVariant}
      productName={product?.name}
    />
  </>
  )
}

export default ProductForm