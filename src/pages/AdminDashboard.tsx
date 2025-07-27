import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FileSpreadsheet
} from 'lucide-react';

import { fetchProducts } from '@/api/products';
import { 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  bulkUploadProducts, 
  getBulkUploadTemplate,
  fetchCategories,
  createCategory,
  type ProductFormData,
  type Product,
  type Category
} from '@/api/admin';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [updateExisting, setUpdateExisting] = useState(false);

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
    queryFn: () => fetchProducts(),
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

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/admin/login');
  };

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
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="bulk-upload">Bulk Upload</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Package className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{products.length}</p>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Orders Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Total Customers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Euro className="h-8 w-8 text-gold-500" />
                  <div>
                    <p className="text-2xl font-bold">€0</p>
                    <p className="text-sm text-muted-foreground">Revenue Today</p>
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

        {/* Bulk Upload Tab */}
        <TabsContent value="bulk-upload" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Bulk Upload Products
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="csv-file">Select CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="update-existing"
                    checked={updateExisting}
                    onCheckedChange={(checked) => setUpdateExisting(checked as boolean)}
                  />
                  <Label htmlFor="update-existing">Update existing products</Label>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleBulkUpload}
                    disabled={!uploadFile || isUploading}
                    className="bg-green-500 hover:bg-green-600 text-white"
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
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  CSV Format Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Required Columns:</h4>
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
                  
                  <h4 className="font-medium mb-2 mt-4">Optional Image Columns:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>image_url_1</strong> - First product image URL</li>
                    <li>• <strong>image_url_2</strong> - Second product image URL</li>
                    <li>• <strong>image_url_3</strong> - Third product image URL</li>
                    <li>• <strong>image_url_4</strong> - Fourth product image URL</li>
                    <li>• <strong>image_url_5</strong> - Fifth product image URL</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Tips:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Download the template for correct formatting</li>
                    <li>• Categories must exist before uploading</li>
                    <li>• Same product can have multiple rows for different variants</li>
                    <li>• SKU must be unique across all variants</li>
                    <li>• Image URLs must be valid and accessible</li>
                    <li>• Up to 5 images per product supported</li>
                    <li>• Check "Update existing" to modify products/variants</li>
                    <li>• Maximum file size: 10MB</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Example Format:</h4>
                  <div className="text-xs font-mono bg-white p-2 rounded border">
                    name,description,price,category_name,sku,color,size,stock,image_url_1,image_url_2<br/>
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
          <h2 className="text-2xl font-semibold">Order Management</h2>
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Order management functionality would be implemented here.</p>
              <p className="text-sm text-muted-foreground mt-2">
                This would include order status updates, customer details, and fulfillment tracking.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
