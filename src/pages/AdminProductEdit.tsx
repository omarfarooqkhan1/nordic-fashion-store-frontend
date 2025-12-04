import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProductById } from '../api/products';
import { fetchCategories, updateProductBasicInfo, type ProductFormData } from '../api/admin';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Product } from '@/types/Product';
import { LoadingState, ErrorState, AccessDenied, PageHeader } from '@/components/common';
import { ProductForm } from '@/components/admin/ProductForm';

const AdminProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
  });


  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(),
    enabled: !!user && user.role === 'admin',
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ data }: { data: ProductFormData }) => updateProductBasicInfo(Number(id), data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      toast({ title: 'Product updated successfully' });
      navigate('/admin/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating product',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

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

      <ProductForm
        product={product}
        categories={categories}
        token={token}
        isCreatingProduct={updateProductMutation.isPending}
        onSave={(data) => updateProductMutation.mutate({ data })}
        onCancel={() => navigate('/admin/dashboard')}
      />
    </div>
  );
};

export default AdminProductEdit;
