import React, { useState, useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useToast } from "@/hooks/use-toast"
import {
  uploadProductImage,
  deleteProductImage,
  type ProductFormData,
  createProductVariant,
  updateProductVariant
} from "@/api/admin"
import type { Product, Category } from "@/api/admin"
import { VariantForm } from "./VariantForm"

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

  const [variants, setVariants] = useState<any[]>(product?.variants || []);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || "",
    description: product?.description || "",
  category_id: product?.category?.id ?? 0,
    gender: product?.gender || "unisex",
    // ...add other fields as needed
  });
  const [sizeGuideFile, setSizeGuideFile] = useState<File | null>(null);
  const sizeGuideInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();
  const { language, t } = useLanguage();

  // ...other hooks and logic...

  // --- Render VariantForm conditionally ---
  function renderVariantForm() {
    if (!(isAddingVariant || editingVariant)) return null;
    return (
      <VariantForm
        variant={editingVariant}
        onSave={async (variantData) => {
          if (editingVariant) {
            // Update existing variant (only for existing products)
            if (product && token) {
              try {
                const result = await updateProductVariant(
                  product.id,
                  variantData.id,
                  {
                    size: variantData.size,
                    color: variantData.color,
                    actual_price: Number(variantData.actual_price),
                    stock: Number(variantData.stock),
                    sku: variantData.sku,
                  },
                  token
                );
                setVariants(prev => prev.map(v => 
                  v.id === variantData.id ? {...variantData, ...result.variant} : v
                ));
                setEditingVariant(null);
                setIsAddingVariant(false);
                toast.toast({ title: "Variant updated successfully" });
              } catch (error: any) {
                toast.toast({
                  title: "Error updating variant",
                  description: error.message,
                  variant: "destructive",
                });
              }
            }
          } else {
            // Add new variant
            const isDuplicate = variants.some(
              (v) => 
                v.size.toLowerCase() === variantData.size.toLowerCase() && 
                v.color.toLowerCase() === variantData.color.toLowerCase()
            );
            if (isDuplicate) {
              toast.toast({
                title: "Duplicate Variant",
                description: `A variant with size \"${variantData.size}\" and color \"${variantData.color}\" already exists.`,
                variant: "destructive",
              });
              return;
            }
            // For new products, just add to local state
            if (!product) {
              setVariants(prev => [...prev, variantData]);
              setIsAddingVariant(false);
              toast.toast({ title: "Variant added successfully" });
            } else if (product && token) {
              try {
                // Prepare variant data for API
                const variantPayload = {
                  size: variantData.size,
                  color: variantData.color,
                  actual_price: Number(variantData.actual_price),
                  stock: Number(variantData.stock),
                  sku: variantData.sku,
                };
                if (variantData.temp_image_ids && variantData.temp_image_ids.length > 0) {
                  (variantPayload as any).temp_image_ids = variantData.temp_image_ids;
                }
                const result = await createProductVariant(
                  product.id,
                  variantPayload,
                  token
                );
                setVariants(prev => [...prev, {...variantData, ...result.variant}]);
                setIsAddingVariant(false);
                toast.toast({ title: "Variant added successfully" });
              } catch (error: any) {
                toast.toast({
                  title: "Error creating variant",
                  description: error.message,
                  variant: "destructive",
                });
              }
            }
          }
        }}
        onCancel={() => {
          setIsAddingVariant(false);
          setEditingVariant(null);
        }}
        isEditing={!!editingVariant}
        token={token}
        productId={product?.id}
        isNewProduct={!product}
      />
    );
  }

  // Variant management functions
  const handleDeleteVariant = (variantId: number) => {
    setVariants((prev) => prev.filter((v) => v.id !== variantId));
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
      isNaN(Number(variant.price ?? variant.actual_price)) ||
      Number(variant.price ?? variant.actual_price) < 0
    );

    if (invalidPriceVariants.length > 0) {
      toast.toast({
        title: "Invalid variant prices",
        description: `Found ${invalidPriceVariants.length} variant(s) with invalid prices. All variants must have valid positive prices.`,
        variant: "destructive",
      });
      return;
    }

    // Validate that all variants have valid stock values
    const invalidStockVariants = variants.filter(variant =>
      variant.stock === undefined ||
      variant.stock === null ||
      variant.stock === "" ||
      isNaN(Number(variant.stock)) ||
      Number(variant.stock) < 0
    );

    if (invalidStockVariants.length > 0) {
      toast.toast({
        title: "Invalid variant stock",
        description: `Found ${invalidStockVariants.length} variant(s) with invalid stock values. All variants must have valid non-negative stock quantities.`,
        variant: "destructive",
      });
      return;
    }

    // Upload size guide image if a new file is selected
    if (sizeGuideFile && product && token) {
      try {
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
    // Ensure all variants have valid prices before sending
    const formattedVariants = variants.map(variant => ({
      ...variant,
      price: Number(variant.price ?? variant.actual_price),
      stock: Number(variant.stock)
    }));

    onSave(formData, [], formattedVariants);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product ? "Edit Product" : "Add New Product"}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderVariantForm()}
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
                  }
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Upload a size guide image (JPG, PNG, etc.)
              </p>
              {(product?.size_guide_image || (product?.allImages?.some(img => img.image_type === 'size_guide'))) && (
                <div className="mt-2">
                  {(() => {
                    let imageUrl = product.size_guide_image;
                    try {
                      if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
                        const backendUrl = import.meta.env.VITE_BACKEND_URL;
                        if (imageUrl.startsWith('/')) {
                          imageUrl = `${backendUrl}${imageUrl}`;
                        } else {
                          imageUrl = `${backendUrl}/${imageUrl}`;
                        }
                      }
                    } catch (error) {
                      imageUrl = product.size_guide_image; // Fallback to original
                    }
                    return (
                      <img
                        src={imageUrl}
                        alt="Size Guide"
                        className="w-48 border rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Product Variants Section */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Product Variants & Stock</Label>

            {/* Add New Variant Button */}
            {!isAddingVariant && !editingVariant && (
              product ? (
                <Button
                  type="button"
                  onClick={() => setIsAddingVariant(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Variant
                </Button>
              ) : (
                <Button
                  type="button"
                  className="bg-green-600 text-white opacity-60 cursor-not-allowed"
                  disabled
                  tabIndex={-1}
                  style={{ pointerEvents: 'auto' }}
                  title="will be available once you create this product"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Variant
                </Button>
              )
            )}

            {/* Variant Form */}
            {(isAddingVariant || editingVariant) && (
              <VariantForm
                variant={editingVariant}
                onSave={async (variantData) => {
                  if (editingVariant) {
                    // Update existing variant
                    if (product && token) {
                      try {
                        const result = await updateProductVariant(
                          product.id,
                          variantData.id,
                          {
                            size: variantData.size,
                            color: variantData.color,
                            actual_price: Number(variantData.actual_price),
                            stock: Number(variantData.stock),
                            sku: variantData.sku,
                          },
                          token
                        );
                        
                        // Update variant in state
                        setVariants(prev => prev.map(v => 
                          v.id === variantData.id ? {...variantData, ...result.variant} : v
                        ));
                        
                        setEditingVariant(null);
                        setIsAddingVariant(false);
                        toast.toast({ title: "Variant updated successfully" });
                      } catch (error: any) {
                        toast.toast({
                          title: "Error updating variant",
                          description: error.message,
                          variant: "destructive",
                        });
                      }
                    }
                  } else {
                    // Add new variant
                    // Check for duplicate variant (same size and color, case-insensitive)
                    const isDuplicate = variants.some(
                      (v) => 
                        v.size.toLowerCase() === variantData.size.toLowerCase() && 
                        v.color.toLowerCase() === variantData.color.toLowerCase()
                    );

                    if (isDuplicate) {
                      toast.toast({
                        title: "Duplicate Variant",
                        description: `A variant with size "${variantData.size}" and color "${variantData.color}" already exists.`,
                        variant: "destructive",
                      });
                      return;
                    }

                    if (product && token) {
                      try {
                        // Prepare variant data for API
                        const variantPayload = {
                          size: variantData.size,
                          color: variantData.color,
                          actual_price: Number(variantData.actual_price),
                          stock: Number(variantData.stock),
                          sku: variantData.sku,
                        };

                        // If there are temp image IDs, include them
                        if (variantData.temp_image_ids && variantData.temp_image_ids.length > 0) {
                          (variantPayload as any).temp_image_ids = variantData.temp_image_ids;
                        }

                        const result = await createProductVariant(
                          product.id,
                          variantPayload,
                          token
                        );
                        
                        // Add the new variant to state
                        setVariants(prev => [...prev, {...variantData, ...result.variant}]);
                        setIsAddingVariant(false);
                        toast.toast({ title: "Variant added successfully" });
                      } catch (error: any) {
                        toast.toast({
                          title: "Error creating variant",
                          description: error.message,
                          variant: "destructive",
                        });
                      }
                    } else {
                      // Fallback for when product or token is not available
                      setVariants(prev => [...prev, variantData]);
                      setIsAddingVariant(false);
                      toast.toast({ title: "Variant added successfully" });
                    }
                  }
                }}
                onCancel={() => {
                  setIsAddingVariant(false);
                  setEditingVariant(null);
                }}
                isEditing={!!editingVariant}
                token={token}
                productId={product?.id}
              />
            )}

            {/* Existing Variants */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Product Variants ({variants.length})</h3>
              {variants.length === 0 ? (
                product ? (
                  <p className="text-muted-foreground">No variants added yet. Add your first variant above.</p>
                ) : null
              ) : (
                <div className="grid gap-4">
                  {variants.map((variant) => (
                    <Card key={variant.id} className="border-l-4 border-l-blue-500 dark:border-l-blue-600 bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                            <div>
                              <Label className="text-sm text-muted-foreground">Size</Label>
                              <p className="font-medium text-foreground">{variant.size}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Color</Label>
                              <p className="font-medium text-foreground">{variant.color}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Price</Label>
                              <p className="font-medium text-foreground">
                                €{variant.actual_price !== undefined && variant.actual_price !== null && !isNaN(Number(variant.actual_price)) ? 
                                  Number(variant.actual_price).toFixed(2) : 'Invalid'}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Stock</Label>
                              <p className="font-medium text-foreground">{variant.stock} units</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingVariant(variant)}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteVariant(variant.id)}
                              className="hover:bg-destructive/90"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Show image counts */}
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>
                            <Label className="text-xs text-muted-foreground">Main Images</Label>
                            <p className="font-medium">{variant.main_images?.length || 0}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Styling Images</Label>
                            <p className="font-medium">{variant.styling_images?.length || 0}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Detailed Images</Label>
                            <p className="font-medium">{variant.detailed_images?.length || 0}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Mobile Images</Label>
                            <p className="font-medium">{variant.mobile_detailed_images?.length || 0}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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
                "Add Product"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isCreatingProduct}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default ProductForm