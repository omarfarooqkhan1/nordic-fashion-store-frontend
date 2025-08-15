import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Package, 
  Upload, 
  Download, 
  Edit, 
  Trash2, 
  Plus, 
  Euro, 
  Users, 
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  X,
  Image as ImageIcon,
  Truck
} from 'lucide-react';

import { fetchProducts } from '@/api/products';
// import { 
//   createProduct, 
//   updateProduct, 
//   deleteProduct, 
//   bulkUploadProducts, 
//   getBulkUploadTemplate,
//   fetchCategories,
//   createCategory,
//   updateCategory,
//   deleteCategory,
//   uploadProductImage,
//   deleteProductImage,
//   updateProductImageOrder,
//   getCategorizedImages,
//   type ProductFormData,
// } from '@/api/products';
import {
  type Product,
  type Category
} from '@/api/admin';
import { 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  bulkUploadProducts, 
  getBulkUploadTemplate,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadProductImage,
  deleteProductImage,
  updateProductImageOrder,
  getCategorizedImages,
  type ProductFormData,
} from '@/api/admin';
import OrderManagement from '@/components/admin/OrderManagement';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [updateExisting, setUpdateExisting] = useState(false);

  // Determine active tab based on URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/admin/products')) return 'products';
    if (path.includes('/admin/dashboard')) return 'overview';
    return 'overview'; // default
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  // Check authentication
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [user, navigate]);

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const data = await fetchProducts();
      // Cast to admin Product type for compatibility
      return data as unknown as Product[];
    },
    enabled: isAuthenticated,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(),
    enabled: isAuthenticated,
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: (data: ProductFormData) => createProduct(data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'Product created successfully' });
      setIsAddingProduct(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error creating product', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductFormData }) => 
      updateProduct(id, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'Product updated successfully' });
      setEditingProduct(null);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error updating product', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'Product deleted successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error deleting product', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const handleDeleteProduct = (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  const handleBulkUpload = async () => {
    if (!uploadFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to upload',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    try {
      const result = await bulkUploadProducts(uploadFile, updateExisting, token!);
      
      const uniqueProducts = result.unique_products || Math.ceil(result.successful / 2); // Fallback estimate
      
      toast({
        title: 'Bulk upload completed',
        description: `${uniqueProducts} unique products with ${result.successful} variants uploaded successfully${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
        className: result.failed > 0 ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
      });

      if (result.failed > 0) {
        console.log('Upload errors:', result.errors);
      }

      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setUploadFile(null);
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await getBulkUploadTemplate(token!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product-upload-template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      toast({
        title: 'Error downloading template',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Product Form Component
  const ProductForm = ({ product, onSave, onCancel }: { 
    product?: Product; 
    onSave: (data: ProductFormData) => void; 
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<ProductFormData>({
      name: product?.name || '',
      description: product?.description || '',
      price: product ? parseFloat(product.price) : 0,
      category_id: product?.category?.id || (categories[0]?.id || 1),
    });

    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
    const [isUploadingImages, setIsUploadingImages] = useState(false);

    // Image upload mutation
    const uploadImageMutation = useMutation({
      mutationFn: ({ productId, imageFile }: { productId: number; imageFile: File }) =>
        uploadProductImage(productId, imageFile, token!),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        toast({ title: 'Image uploaded successfully' });
      },
      onError: (error: any) => {
        toast({
          title: 'Error uploading image',
          description: error.message,
          variant: 'destructive'
        });
      },
    });

    // Image delete mutation with enhanced feedback
    const deleteImageMutation = useMutation({
      mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) =>
        deleteProductImage(productId, imageId, token!),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        
        if (data.warning && data.variant_info) {
          toast({
            title: 'Image deleted with warning',
            description: `${data.warning}. Variant: ${data.variant_info.color} (${data.variant_info.size})`,
            variant: 'default'
          });
        } else {
          toast({ title: 'Image deleted successfully' });
        }
      },
      onError: (error: any) => {
        toast({
          title: 'Error deleting image',
          description: error.message,
          variant: 'destructive'
        });
      },
    });

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        setSelectedImages(prev => [...prev, ...files]);
      }
    };

    const handleRemoveSelectedImage = (index: number) => {
      setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteExistingImage = async (imageId: number, imageCategory?: string) => {
      if (!product) return;

      // Enhanced confirmation dialog with warnings
      let confirmMessage = "Are you sure you want to delete this image?";
      if (imageCategory && imageCategory.includes("Variant:")) {
        confirmMessage = `⚠️ WARNING: This appears to be a variant-specific image (${imageCategory}).\n\nDeleting it may affect the product variant's visual representation.\n\nAre you sure you want to proceed?`;
      }

      const confirmed = window.confirm(confirmMessage);
      if (confirmed) {
        try {
          const result = await deleteImageMutation.mutateAsync({ productId: product.id, imageId });
          
          // Additional warning if it was indeed a variant image
          if (result.warning) {
            const followUpConfirm = window.confirm(
              `✅ Image deleted successfully.\n\n${result.warning}\n\nWould you like to review the remaining images for this product?`
            );
            
            if (followUpConfirm) {
              // Could trigger a refresh or scroll to images section
              queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            }
          }
        } catch (error) {
          // Error handling is already done in the mutation
          console.error('Delete image error:', error);
        }
      }
    };

    const handleUploadImages = async () => {
      if (!product || selectedImages.length === 0) return;
      
      setIsUploadingImages(true);
      try {
        for (const imageFile of selectedImages) {
          await uploadImageMutation.mutateAsync({ productId: product.id, imageFile });
        }
        setSelectedImages([]);
      } finally {
        setIsUploadingImages(false);
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>{product ? 'Edit Product' : 'Add New Product'}</CardTitle>
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
                  onValueChange={(value) => setFormData({ ...formData, category_id: parseInt(value) })}
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
              <Label htmlFor="price">Price (€) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
              />
            </div>

            {/* Image Management Section */}
            <div className="space-y-4">
              <Label>Product Images</Label>
              
              {/* Existing Images */}
              {product && product.images && product.images.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Current Images ({product.images.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {product.images.map((image) => {
                      // Determine image category (this is a simplified version - ideally we'd use the categorized endpoint)
                      const isVariantImage = image.alt_text?.includes('variant') || image.alt_text?.includes('color') || image.alt_text?.includes('size');
                      const imageCategory = isVariantImage ? `Variant Image` : `General Product Image`;
                      
                      return (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.url}
                            alt={image.alt_text || product.name}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          
                          {/* Enhanced delete button with warning indicator */}
                          <Button
                            type="button"
                            variant={isVariantImage ? "destructive" : "secondary"}
                            size="sm"
                            className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                              isVariantImage ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                            }`}
                            onClick={() => handleDeleteExistingImage(image.id, imageCategory)}
                            disabled={deleteImageMutation.isPending}
                            title={isVariantImage ? "⚠️ Variant-specific image - delete with caution" : "Delete image"}
                          >
                            {isVariantImage ? (
                              <span className="text-xs">⚠️</span>
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </Button>
                          
                          {/* Enhanced info overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg">
                            <div className="flex justify-between items-center">
                              <span>Order: {image.sort_order}</span>
                              {isVariantImage && (
                                <span className="bg-yellow-600 px-1 rounded text-xs">VAR</span>
                              )}
                            </div>
                            <div className="text-xs opacity-75 truncate" title={imageCategory}>
                              {imageCategory}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Warning notice */}
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-xs text-yellow-800">
                      <strong>⚠️ Note:</strong> Images marked with "VAR" may be variant-specific. 
                      Deleting them could affect product variant display. Use caution when removing these images.
                    </p>
                  </div>
                </div>
              )}

              {/* Add New Images */}
              <div>
                <h4 className="text-sm font-medium mb-2">Add New Images</h4>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="mb-2"
                />
                
                {/* Preview Selected Images */}
                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveSelectedImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Images Button */}
                {product && selectedImages.length > 0 && (
                  <Button
                    type="button"
                    onClick={handleUploadImages}
                    disabled={isUploadingImages}
                    className="mt-2"
                    variant="outline"
                  >
                    {isUploadingImages ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload {selectedImages.length} Image{selectedImages.length > 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                )}

                {!product && selectedImages.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Save the product first to upload images
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
                className="bg-gold-500 hover:bg-gold-600 text-leather-900 font-semibold"
              >
                {product ? 'Update Product' : 'Add Product'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-4xl font-bold text-foreground">Admin Dashboard</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1">
          <TabsTrigger 
            value="overview" 
            onClick={() => navigate('/admin/dashboard')}
            className="text-xs sm:text-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="products" 
            onClick={() => navigate('/admin/products')}
            className="text-xs sm:text-sm"
          >
            Products
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-xs sm:text-sm">
            Categories
          </TabsTrigger>
          <TabsTrigger value="bulk-upload" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Bulk Upload</span>
            <span className="sm:hidden">Upload</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-xs sm:text-sm">
            Orders
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <Card>
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center space-x-2">
                  <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  <div>
                    <p className="text-lg sm:text-2xl font-bold">{products.length}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Products</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                  <div>
                    <p className="text-lg sm:text-2xl font-bold">0</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Orders Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                  <div>
                    <p className="text-lg sm:text-2xl font-bold">0</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Customers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center space-x-2">
                  <Euro className="h-6 w-6 sm:h-8 sm:w-8 text-gold-500" />
                  <div>
                    <p className="text-lg sm:text-2xl font-bold">€0</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Revenue Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <span>Admin dashboard accessed</span>
                  <span className="text-sm text-muted-foreground">Just now</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span>Products loaded</span>
                  <span className="text-sm text-muted-foreground">1 minute ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Manage Products</h2>
            <Button 
              onClick={() => setIsAddingProduct(true)}
              className="bg-gold-500 hover:bg-gold-600 text-leather-900 font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          {isAddingProduct && (
            <ProductForm 
              onSave={(data) => createProductMutation.mutate(data)}
              onCancel={() => setIsAddingProduct(false)}
            />
          )}

          {editingProduct && (
            <ProductForm 
              product={editingProduct}
              onSave={(data) => updateProductMutation.mutate({ id: editingProduct.id, data })}
              onCancel={() => setEditingProduct(null)}
            />
          )}

          {productsLoading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : (
            <div className="grid gap-6">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-foreground">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">{product.category.name}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProduct(product)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-gold-500">€{product.price}</span>
                          <Badge variant="default">
                            {product.variants?.length || 0} variants
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Stock: {product.variants?.reduce((total, v) => total + v.stock, 0) || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <CategoryManagement 
            categories={categories}
            onCategoryCreated={() => queryClient.invalidateQueries({ queryKey: ['categories'] })}
            onCategoryUpdated={() => queryClient.invalidateQueries({ queryKey: ['categories'] })}
            onCategoryDeleted={() => queryClient.invalidateQueries({ queryKey: ['categories'] })}
          />
        </TabsContent>

        {/* Bulk Upload Tab */}
        <TabsContent value="bulk-upload" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                  Bulk Upload Products
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="upload-file">Select CSV or ZIP File</Label>
                  <Input
                    id="upload-file"
                    type="file"
                    accept=".csv,.zip"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload a CSV file or ZIP file containing CSV and images
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="update-existing"
                    checked={updateExisting}
                    onCheckedChange={(checked) => setUpdateExisting(checked as boolean)}
                  />
                  <Label htmlFor="update-existing">Update existing products</Label>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleBulkUpload}
                    disabled={!uploadFile || isUploading}
                    className="bg-green-500 hover:bg-green-600 text-white flex-1 sm:flex-none"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Products
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleDownloadTemplate}
                    className="flex-1 sm:flex-none"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Download Template</span>
                    <span className="sm:hidden">Template</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Upload Format Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">ZIP File Upload (Recommended):</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Create a ZIP file containing:</li>
                    <li className="ml-4">- One CSV file with product data</li>
                    <li className="ml-4">- Image files (JPG, PNG, GIF, WebP)</li>
                    <li>• Use <strong>image_file_1</strong>, <strong>image_file_2</strong>, etc. columns in CSV</li>
                    <li>• Reference image files by name (e.g., "red-shirt-front.jpg")</li>
                    <li>• Images are automatically uploaded to Cloudinary</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">CSV Required Columns:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>name</strong> - Product name</li>
                    <li>• <strong>description</strong> - Product description</li>
                    <li>• <strong>price</strong> - Base price (decimal)</li>
                    <li>• <strong>category_name</strong> - Category name (must exist)</li>
                  </ul>
                  
                  <h4 className="font-medium mb-2 mt-4">Optional Variant Columns:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>sku</strong> - Stock keeping unit (unique)</li>
                    <li>• <strong>color</strong> - Product color</li>
                    <li>• <strong>size</strong> - Product size</li>
                    <li>• <strong>price_difference</strong> - Price adjustment from base (default: 0.00)</li>
                    <li>• <strong>stock</strong> - Quantity in stock (default: 0)</li>
                  </ul>
                  
                  <h4 className="font-medium mb-2 mt-4">Image Columns:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>image_file_1-5</strong> - Image file names (for ZIP upload)</li>
                    <li>• <strong>image_url_1-5</strong> - Direct image URLs (for CSV-only)</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Tips:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Download the template for correct formatting</li>
                    <li>• Categories must exist before uploading</li>
                    <li>• Same product can have multiple rows for different variants</li>
                    <li>• SKU must be unique across all variants</li>
                    <li>• For ZIP: Use image_file_* columns</li>
                    <li>• For CSV-only: Use image_url_* columns</li>
                    <li>• Up to 5 images per product supported</li>
                    <li>• Check "Update existing" to modify products/variants</li>
                    <li>• Maximum file size: 100MB for ZIP, 10MB for CSV</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Example ZIP Structure:</h4>
                  <div className="text-xs font-mono bg-white p-2 rounded border">
                    products.zip<br/>
                    ├── products.csv<br/>
                    ├── red-shirt-front.jpg<br/>
                    ├── red-shirt-back.jpg<br/>
                    ├── blue-shirt-front.jpg<br/>
                    └── blue-shirt-back.jpg
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Example CSV Format:</h4>
                  <div className="text-xs font-mono bg-white p-2 rounded border">
                    name,description,price,category_name,sku,color,size,stock,image_file_1,image_file_2<br/>
                    "Nordic Sweater","Wool sweater","89.99","Clothing","NS-RED-M","Red","M","50","https://example.com/image1.jpg","https://example.com/image2.jpg"<br/>
                    "Nordic Sweater","Wool sweater","89.99","Clothing","NS-RED-L","Red","L","30","https://example.com/image1.jpg",""
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <OrderManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Category Management Component
interface CategoryManagementProps {
  categories: Category[];
  onCategoryCreated: () => void;
  onCategoryUpdated: () => void;
  onCategoryDeleted: () => void;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  onCategoryCreated,
  onCategoryUpdated,
  onCategoryDeleted,
}) => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      createCategory(data, token || ''),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
      setIsCreateDialogOpen(false);
      setCategoryForm({ name: '', description: '' });
      onCategoryCreated();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; description?: string } }) =>
      updateCategory(id, data, token || ''),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Category updated successfully',
      });
      setEditingCategory(null);
      onCategoryUpdated();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId: number) =>
      deleteCategory(categoryId, token || ''),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
      onCategoryDeleted();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreateCategory = () => {
    if (!categoryForm.name.trim()) {
      toast({
        title: 'Error',
        description: 'Category name is required',
        variant: 'destructive',
      });
      return;
    }

    createCategoryMutation.mutate({
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim() || undefined,
    });
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !categoryForm.name.trim()) {
      return;
    }

    updateCategoryMutation.mutate({
      id: editingCategory.id,
      data: {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim() || undefined,
      },
    });
  };

  const handleDeleteCategory = (category: Category) => {
    if (window.confirm(`Are you sure you want to delete the "${category.name}" category? This action cannot be undone.`)) {
      deleteCategoryMutation.mutate(category.id);
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
    });
  };

  const closeEditDialog = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Category Management</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category-name">Name</Label>
                <Input
                  id="category-name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <Label htmlFor="category-description">Description (Optional)</Label>
                <Textarea
                  id="category-description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Enter category description"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateCategory}
                  disabled={createCategoryMutation.isPending}
                >
                  {createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(category)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteCategory(category)}
                    disabled={deleteCategoryMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No categories found. Create your first category to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-category-name">Name</Label>
              <Input
                id="edit-category-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Enter category name"
              />
            </div>
            <div>
              <Label htmlFor="edit-category-description">Description (Optional)</Label>
              <Textarea
                id="edit-category-description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Enter category description"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={closeEditDialog}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateCategory}
                disabled={updateCategoryMutation.isPending}
              >
                {updateCategoryMutation.isPending ? 'Updating...' : 'Update Category'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
