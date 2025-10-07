import React, { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Upload, X } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useToast } from "@/hooks/use-toast"
import {
  uploadProductImage,
  deleteProductImage,
  uploadProductImages,
  type ProductFormData,
} from "@/api/admin"
import type { Product, Category } from "@/api/admin"

interface ProductFormProps {
  product?: Product
  onSave: (data: ProductFormData, images?: File[], variants?: any[]) => void
  onCancel: () => void
  categories: Category[]
  token: string | null
  isCreatingProduct?: boolean
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSave,
  onCancel,
  categories,
  token,
  isCreatingProduct = false,
}) => {
  const { t, language } = useLanguage()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || "",
    description: product?.description || "",
    gender: product?.gender || "unisex",
    price: product ? Number.parseFloat(product.price) : 0,
    category_id: product?.category?.id || categories[0]?.id || 1,
  })

  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  // Stable preview URLs for selected images to avoid recreating object URLs on each render
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  // Variants state
  const [variants, setVariants] = useState<any[]>(product?.variants || [])
  const [newVariant, setNewVariant] = useState({
    size: "",
    color: "",
    actual_price: "",
    stock: "",
  })

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: ({ productId, imageFile }: { productId: number; imageFile: File }) =>
      uploadProductImage(productId, imageFile, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
      toast({ title: "Image uploaded successfully" })
    },
    onError: (error: any) => {
      toast({
        title: "Error uploading image",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Image delete mutation with enhanced feedback
  const deleteImageMutation = useMutation({
    mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) =>
      deleteProductImage(productId, imageId, token!),
    onSuccess: (data) => {
      // Invalidate both admin products list and individual product queries
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
      if (product) {
        queryClient.invalidateQueries({ queryKey: ["product", product.id.toString()] })
      }

      if (data.warning && data.variant_info) {
        toast({
          title: "Image deleted with warning",
          description: `${data.warning}. Variant: ${data.variant_info.color} (${data.variant_info.size})`,
          variant: "default",
        })
      } else {
        toast({ title: "Image deleted successfully" })
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting image",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      console.log("[ProductForm] Files selected:", files.length, files)

      setSelectedImages((prev) => {
        const newImages = [...prev, ...files]
        console.log("[ProductForm] Updated selectedImages:", newImages.length, newImages)
        return newImages
      })

      // Show feedback toast
      toast({
        title: `${files.length} image${files.length > 1 ? "s" : ""} selected`,
        description: `Total: ${selectedImages.length + files.length} image${selectedImages.length + files.length > 1 ? "s" : ""} ready to upload`,
      })

      // Reset the input so the same files can be selected again if needed
      e.target.value = ""
    } else {
      console.log("[ProductForm] No files in event.target.files")
    }
  }

  const handleRemoveSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    toast({
      title: "Image removed from selection",
      description: `${selectedImages.length - 1} image${selectedImages.length - 1 !== 1 ? "s" : ""} remaining`,
    })
  }

  // Build and cleanup object URLs for previews when selection changes
  useEffect(() => {
    console.log("[ProductForm] useEffect triggered, selectedImages.length:", selectedImages.length)
    if (selectedImages.length === 0) {
      setPreviewUrls([])
      return
    }
    const urls = selectedImages.map((file) => URL.createObjectURL(file))
    console.log("[ProductForm] Created preview URLs:", urls)
    setPreviewUrls(urls)

    // Cleanup when component unmounts or selection changes
    return () => {
      console.log("[ProductForm] Cleaning up URLs:", urls)
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [selectedImages])

  const handleDeleteExistingImage = async (imageId: number, imageCategory?: string) => {
    if (!product) return

    // Enhanced confirmation dialog with warnings
    let confirmMessage = "Are you sure you want to delete this image?"
    if (imageCategory && imageCategory.includes("Variant:")) {
      confirmMessage = `⚠️ WARNING: This appears to be a variant-specific image (${imageCategory}).\n\nDeleting it may affect the product variant's visual representation.\n\nAre you sure you want to proceed?`
    }

    const confirmed = window.confirm(confirmMessage)
    if (confirmed) {
      try {
        const result = await deleteImageMutation.mutateAsync({ productId: product.id, imageId })

        // Additional warning if it was indeed a variant image
        if (result.warning) {
          const followUpConfirm = window.confirm(
            `✅ Image deleted successfully.\n\n${result.warning}\n\nWould you like to review the remaining images for this product?`,
          )

          if (followUpConfirm) {
            // Could trigger a refresh or scroll to images section
            queryClient.invalidateQueries({ queryKey: ["admin-products"] })
          }
        }
      } catch (error) {
        // Error handling is already done in the mutation
      }
    }
  }

  const handleUploadImages = async () => {
    if (!product || selectedImages.length === 0) return

    setIsUploadingImages(true)

    try {
      // Use batch upload instead of looping through individual uploads
      await uploadProductImages(product.id, selectedImages, token!)

      toast({
        title: "All images uploaded successfully",
        description: `${selectedImages.length} image${selectedImages.length > 1 ? "s" : ""} uploaded. You can add more images now.`,
      })

      // Clear selected images after successful upload
      setSelectedImages([])

      // Refresh product data to show new images
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload images",
        variant: "destructive",
      })
    } finally {
      setIsUploadingImages(false)
    }
  }

  // Variant management functions
  const handleAddVariant = () => {
    if (!newVariant.size || !newVariant.color || !newVariant.actual_price || !newVariant.stock) {
      toast({
        title: "Error",
        description: "Please fill all variant fields",
        variant: "destructive",
      })
      return
    }

    // Validate numeric values
    const price = Number.parseFloat(newVariant.actual_price)
    const stock = Number.parseInt(newVariant.stock)

    if (isNaN(price) || price < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive",
      })
      return
    }

    if (isNaN(stock) || stock < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid stock quantity",
        variant: "destructive",
      })
      return
    }

    // Check for duplicate variant (same size and color, case-insensitive)
    const isDuplicate = variants.some(
      (v) => 
        v.size.toLowerCase() === newVariant.size.toLowerCase() && 
        v.color.toLowerCase() === newVariant.color.toLowerCase()
    )

    if (isDuplicate) {
      toast({
        title: "Duplicate Variant",
        description: `A variant with size "${newVariant.size}" and color "${newVariant.color}" already exists.`,
        variant: "destructive",
      })
      return
    }

    const variantData = {
      id: Date.now(), // Temporary ID for new variants
      size: newVariant.size,
      color: newVariant.color,
      actual_price: price,
      stock: stock,
    }

    setVariants((prev) => [...prev, variantData])
    setNewVariant({ size: "", color: "", actual_price: "", stock: "" })
    
    toast({
      title: "Variant Added",
      description: `Added ${newVariant.color} (${newVariant.size}) variant`,
    })
  }

  const handleDeleteVariant = (variantId: number) => {
    setVariants((prev) => prev.filter((v) => v.id !== variantId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // If editing an existing product and there are images to upload, upload them first
    if (product && selectedImages.length > 0) {
      setIsUploadingImages(true)
      try {
        await uploadProductImages(product.id, selectedImages, token!)
        
        // Refresh product data to show new images
        queryClient.invalidateQueries({ queryKey: ["admin-products"] })
        
        toast({
          title: "Images uploaded successfully",
          description: `${selectedImages.length} image${selectedImages.length > 1 ? "s" : ""} uploaded`,
        })
        // Clear selected images after successful upload
        setSelectedImages([])
      } catch (error: any) {
        console.error("[ProductForm] Image upload error:", error)
        console.error("[ProductForm] Error response:", error.response?.data)
        toast({
          title: "Image upload failed",
          description: error.response?.data?.message || error.message || "Failed to upload images",
          variant: "destructive",
        })
        setIsUploadingImages(false)
        return // Don't proceed with form submission if image upload fails
      } finally {
        setIsUploadingImages(false)
      }
    }

    // Pass the form data and variants
    // For edit mode: images already uploaded above, so pass empty array
    // For create mode: pass selectedImages so they're uploaded during creation
    onSave(formData, product ? [] : selectedImages, variants)
  }

  return (
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

          <div>
            <Label htmlFor="price">Base Price (€) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price || ""}
              onChange={(e) => {
                const value = e.target.value
                setFormData({ ...formData, price: value === "" ? 0 : Number.parseFloat(value) || 0 })
              }}
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Base price for the product. Variants can have different prices.
            </p>
          </div>

          {/* Product Variants Section */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Product Variants & Stock</Label>

            {/* Add New Variant */}
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-foreground">Add New Variant</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="variant-size" className="text-foreground">Size *</Label>
                    <Input
                      id="variant-size"
                      value={newVariant.size}
                      onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                      placeholder="XS, S, M, L, XL"
                      className="bg-background text-foreground placeholder:text-muted-foreground border-border focus-visible:ring-primary"
                    />
                  </div>

                  <div>
                    <Label htmlFor="variant-color" className="text-foreground">Color *</Label>
                    <Input
                      id="variant-color"
                      value={newVariant.color}
                      onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                      placeholder="Red, Blue, etc."
                      className="bg-background text-foreground placeholder:text-muted-foreground border-border focus-visible:ring-primary"
                    />
                  </div>

                  <div>
                    <Label htmlFor="variant-price" className="text-foreground">Price (€) *</Label>
                    <Input
                      id="variant-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newVariant.actual_price}
                      onChange={(e) => {
                        const value = e.target.value
                        setNewVariant({ ...newVariant, actual_price: value })
                      }}
                      placeholder="0.00"
                      className="bg-background text-foreground placeholder:text-muted-foreground border-border focus-visible:ring-primary"
                    />
                  </div>

                  <div>
                    <Label htmlFor="variant-stock" className="text-foreground">Stock *</Label>
                    <Input
                      id="variant-stock"
                      type="number"
                      min="0"
                      value={newVariant.stock}
                      onChange={(e) => {
                        const value = e.target.value
                        setNewVariant({ ...newVariant, stock: value })
                      }}
                      placeholder="0"
                      className="bg-background text-foreground placeholder:text-muted-foreground border-border focus-visible:ring-primary"
                    />
                  </div>
                </div>
                <Button 
                  type="button" 
                  onClick={handleAddVariant} 
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </Button>
              </CardContent>
            </Card>

            {/* Existing Variants */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Product Variants ({variants.length})</h3>
              {variants.length === 0 ? (
                <p className="text-muted-foreground">No variants added yet. Add your first variant above.</p>
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
                              <p className="font-medium text-foreground">€{variant.actual_price}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Stock</Label>
                              <p className="font-medium text-foreground">{variant.stock} units</p>
                            </div>
                          </div>
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Image Management Section */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Product Images</Label>

            {/* Existing Images */}
            {product && product.images && product.images.length > 0 && (
              <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-green-900 flex items-center gap-2">
                    ✓ Current Images ({product.images.length})
                  </h4>
                  <span className="text-xs text-green-700">These images are already saved</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {product.images.map((image) => {
                    const isVariantImage =
                      image.alt_text?.includes("variant") ||
                      image.alt_text?.includes("color") ||
                      image.alt_text?.includes("size")
                    const imageCategory = isVariantImage ? `Variant Image` : `General Product Image`

                    return (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={image.alt_text || product.name}
                          className="w-full h-32 object-cover rounded-lg border-2 border-green-300"
                        />

                        {/* Enhanced delete button with warning indicator */}
                        <Button
                          type="button"
                          variant={isVariantImage ? "destructive" : "secondary"}
                          size="sm"
                          className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                            isVariantImage ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-gray-700"
                          }`}
                          onClick={() => handleDeleteExistingImage(image.id, imageCategory)}
                          disabled={deleteImageMutation.isPending}
                          title={isVariantImage ? "⚠️ Variant-specific image - delete with caution" : "Delete image"}
                        >
                          {isVariantImage ? <span className="text-xs">⚠️</span> : <X className="h-4 w-4" />}
                        </Button>

                        {/* Enhanced info overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg">
                          <div className="flex justify-between items-center">
                            <span>Order: {image.sort_order}</span>
                            {isVariantImage && <span className="bg-yellow-600 px-1 rounded text-xs">VAR</span>}
                          </div>
                          <div className="text-xs opacity-75 truncate" title={imageCategory}>
                            {imageCategory}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Warning notice */}
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-xs text-yellow-800">
                    <strong>⚠️ Note:</strong> Images marked with "VAR" may be variant-specific. Deleting them could
                    affect product variant display.
                  </p>
                </div>
              </div>
            )}

            {product && product.images && product.images.length > 0 && (
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="text-sm font-medium text-gray-500">Add More Images</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>
            )}

            {/* Add New Images section with clearer instructions */}
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
              <h4 className="text-sm font-semibold mb-2 text-blue-900">
                📸 {product ? "Add More Images" : "Add Product Images"}
              </h4>
              <p className="text-xs text-blue-700 mb-3">
                {product
                  ? "Select multiple images to add to this product. They will be uploaded when you click 'Update Product'."
                  : "Select multiple images at once. They will be uploaded when you save the product."}
              </p>

              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="mb-3 cursor-pointer bg-white text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300 dark:hover:file:bg-blue-800/30"
                id="image-upload-input"
              />

              <div className="flex items-center gap-2 text-xs text-blue-600">
                <span className="font-medium">💡 Tip:</span>
                <span>Hold Ctrl/Cmd to select multiple files, or drag & drop multiple images</span>
              </div>

              {selectedImages.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-semibold text-blue-900">Selected Images ({selectedImages.length})</h5>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedImages([])
                        toast({ title: "All selections cleared" })
                      }}
                      className="text-xs"
                    >
                      Clear All
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={previewUrls[index] || "/placeholder.svg"}
                          alt={file.name}
                          className="w-full h-32 object-cover rounded-lg border-2 border-blue-200"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveSelectedImage(index)}
                          title="Remove this image"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg truncate">
                          {file.name}
                        </div>
                        <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedImages.length > 0 && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-700 flex items-center gap-2">
                    <span className="text-lg">✓</span>
                    <span>
                      {selectedImages.length} image{selectedImages.length > 1 ? "s" : ""} ready. Click "{product ? "Update" : "Add"} Product" to {product ? "upload and save" : "save"}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isCreatingProduct || isUploadingImages}
              className="bg-gold-500 hover:bg-gold-600 text-leather-900 font-semibold"
            >
              {isUploadingImages ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading Images...
                </>
              ) : isCreatingProduct ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {product ? "Updating..." : "Creating..."}
                </>
              ) : product ? (
                selectedImages.length > 0 ? `Update & Upload ${selectedImages.length} Image${selectedImages.length > 1 ? "s" : ""}` : "Update Product"
              ) : (
                "Add Product"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isCreatingProduct || isUploadingImages}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default ProductForm
