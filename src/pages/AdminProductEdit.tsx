import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProductById } from '../api/products';
import { 
  createProductVariant, 
  deleteProductVariant, 
  updateProductBasicInfo,
  deleteProductImage,
  type VariantFormData,
  type ProductVariant 
} from '../api/admin';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Trash2, Upload, Eye } from 'lucide-react';
import { Product } from '@/types/Product';
import { useToast } from '@/hooks/use-toast';
import ProductImage from '@/components/ui/ProductImage';
import { LoadingState, ErrorState, AccessDenied, PageHeader, FormField, ConfirmationDialog, ProductVariantManager } from '@/components/common';
import { useCreateMutation, useUpdateMutation, useDeleteMutation } from '@/hooks/useMutationWithToast';

const AdminProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);

  // Basic product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    category_id: ''
  });

  // Variants state
  const [variants, setVariants] = useState<any[]>([]);
  const [newVariant, setNewVariant] = useState<Omit<VariantFormData, 'actual_price' | 'stock'> & { actual_price: string; stock: string }>({
    size: '',
    color: '',
    actual_price: '',
    stock: ''
  });

  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
  });

  // Initialize form when product loads
  React.useEffect(() => {
    if (product) {
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price,
        discount: product.discount?.toString() || '0',
        category_id: product.category.id.toString()
      });
      setVariants(product.variants || []);
    }
  }, [product]);

  // Update product basic info mutation
  const updateProductMutation = useUpdateMutation({
    mutationFn: (updatedData: any) => updateProductBasicInfo(Number(id), updatedData, token!),
    queryKey: ['product', id],
    entityName: "Product"
  });

  // Create variant mutation
  const createVariantMutation = useCreateMutation({
    mutationFn: (variantData: any) => createProductVariant(Number(id), variantData, token!),
    queryKey: ['product', id],
    entityName: "Variant",
    onSuccess: () => {
      setNewVariant({ size: '', color: '', actual_price: '', stock: '' });
    }
  });

  // Delete variant mutation
  const deleteVariantMutation = useDeleteMutation({
    mutationFn: (variantId: number) => deleteProductVariant(variantId, token!),
    queryKey: ['product', id],
    entityName: "Variant"
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) =>
      deleteProductImage(productId, imageId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      toast({ title: 'Image deleted successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting image',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  const handleProductFormChange = (field: string, value: string) => {
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveBasicInfo = () => {
    const updatedData = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      discount: productForm.discount ? parseInt(productForm.discount) : 0,
      category_id: parseInt(productForm.category_id)
    };
    
    updateProductMutation.mutate(updatedData);
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!product) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this image?');
    if (confirmed) {
      deleteImageMutation.mutate({ productId: product.id, imageId });
    }
  };

  const handleAddVariant = () => {
    if (!newVariant.size || !newVariant.color || !newVariant.actual_price || !newVariant.stock) {
      toast({
        title: "Error",
        description: "Please fill all variant fields",
        variant: "destructive"
      });
      return;
    }

    const variantData: any = {
      size: newVariant.size,
      color: newVariant.color,
      sku: '', // Send empty string, let backend generate it
      actual_price: parseFloat(newVariant.actual_price),
      stock: parseInt(newVariant.stock)
    };

    createVariantMutation.mutate(variantData);
  };

  const handlePreview = () => {
    window.open(`/products/${id}`, '_blank');
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !product) {
    return (
      <ErrorState 
        title="Product not found"
        backButton={{
          text: "Back to Dashboard",
          path: "/admin/dashboard"
        }}
      />
    );
  }

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <AccessDenied 
        description="You don't have permission to edit products."
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <PageHeader
        title="Edit Product"
        subtitle={product.name}
        backButton={{
          path: "/admin/dashboard",
          label: "Back to Dashboard"
        }}
        actions={[
          {
            label: "Preview",
            onClick: handlePreview,
            variant: "outline",
            icon: <Eye className="h-4 w-4" />
          }
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Product Name"
                  id="name"
                  value={productForm.name}
                  onChange={(value) => handleProductFormChange('name', value)}
                  placeholder="Enter product name"
                  required
                />

                <FormField
                  label="Category"
                  id="category"
                  type="select"
                  value={productForm.category_id}
                  onChange={(value) => handleProductFormChange('category_id', value)}
                  placeholder="Select category"
                  options={[
                    { value: "1", label: "Clothing" },
                    { value: "2", label: "Footwear" },
                    { value: "3", label: "Accessories" },
                    { value: "4", label: "Outerwear" },
                    { value: "5", label: "Bags" },
                    { value: "6", label: "Jewelry" },
                    { value: "7", label: "Home & Decor" }
                  ]}
                  required
                />

                <FormField
                  label="Base Price (€)"
                  id="price"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(value) => handleProductFormChange('price', value)}
                  placeholder="0.00"
                  required
                />

                <FormField
                  label="Discount (%)"
                  id="discount"
                  type="number"
                  value={productForm.discount}
                  onChange={(value) => handleProductFormChange('discount', value)}
                  placeholder="0"
                />
              </div>

              <FormField
                label="Description"
                id="description"
                type="textarea"
                value={productForm.description}
                onChange={(value) => handleProductFormChange('description', value)}
                placeholder="Enter product description"
                required
              />

              <Button 
                onClick={handleSaveBasicInfo}
                disabled={updateProductMutation.isPending}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateProductMutation.isPending ? 'Saving...' : 'Save Basic Info'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variants Tab */}
        <TabsContent value="variants" className="space-y-6">
          <ProductVariantManager
            variants={variants}
            newVariant={newVariant}
            onNewVariantChange={(field, value) => setNewVariant(prev => ({ ...prev, [field]: value }))}
            onAddVariant={handleAddVariant}
            onDeleteVariant={(variantId) => deleteVariantMutation.mutate(variantId)}
            isAdding={createVariantMutation.isPending}
            isDeleting={deleteVariantMutation.isPending}
          />
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Main Product Images */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Main Product Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {product.images?.map((image, index) => (
                      <div key={image.id || index} className="space-y-2 relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border relative">
                          <ProductImage
                            src={image.url}
                            alt={image.alt_text || 'Product image'}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteImage(image.id)}
                            disabled={deleteImageMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{image.alt_text}</p>
                      </div>
                    )) || (
                      <p className="text-muted-foreground col-span-full">No images available</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Variant Images */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Variant Images</h3>
                  {variants.map((variant) => (
                    <div key={variant.id} className="mb-6">
                      <h4 className="font-medium mb-2">{variant.size} - {variant.color}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {variant.images?.map((image: any, index: number) => (
                          <div key={image.id || index} className="space-y-2 relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border relative">
                              <ProductImage
                                src={image.url}
                                alt={image.alt_text || 'Variant image'}
                                className="w-full h-full object-cover"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteImage(image.id)}
                                disabled={deleteImageMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{image.alt_text}</p>
                          </div>
                        )) || (
                          <p className="text-muted-foreground col-span-full">No variant images available</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Image Upload Section */}
                <Card className="bg-gray-50 dark:bg-gray-800 border-dashed border-2">
                  <CardContent className="p-6 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Upload Images</h3>
                    <p className="text-muted-foreground mb-4">
                      Image upload functionality will be implemented here
                    </p>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Select Images
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminProductEdit;
