"use client"

import React, { useState, useEffect } from "react"
import MediaPreviewModal from "@/components/MediaPreviewModal"
import MediaThumbnail from "@/components/MediaThumbnail"
import { useNavigate, useLocation } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useToast } from "@/hooks/use-toast"
import api from "@/api/axios"
import { buildApiHeaders } from "@/api/api-headers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
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
  FileSpreadsheet,
  X,
} from "lucide-react"

import { fetchProducts } from "@/api/products"
import type { Product, Category } from "@/api/admin"
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
  createProductVariant,
  uploadProductImages,
  getAdminStats,
  getRecentRegistrations,
  getRecentOrders,
  markRegistrationAsNotified,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  resetUserPassword,
  type ProductFormData,
  type AdminStats,
  type AdminRegistration,
  type AdminOrder,
  type AdminUser,
  type UserFormData,
} from "@/api/admin"
import OrderManagement from "@/components/admin/OrderManagement"
import AdminFaqs from "@/components/admin/AdminFaqs"
import ContactForms from "@/components/admin/ContactForms"
import UserManagement from "@/components/admin/UserManagement"
import { ProductForm } from "@/components/admin/ProductForm"
import { AdminHeroImages } from "@/components/admin/AdminHeroImages"
import { getPendingReviews, approveReview, rejectReview, type ProductReview } from "@/api/reviews"
import { fetchProductById } from "@/api/products"
import { LoadingState } from "@/components/common"
const AdminDashboard: React.FC = () => {
  // State for which review modal is open (by review id)
  const [openReviewModalId, setOpenReviewModalId] = useState<number | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = useAuth()
  const { t } = useLanguage()
  
  // Check for duplicate variants based on size and color
  const hasDuplicateVariants = (variants: any[]) => {
    const variantKeys = new Set()
    for (const variant of variants) {
      const key = `${variant.size}-${variant.color}`.toLowerCase()
      if (variantKeys.has(key)) {
        return true
      }
      variantKeys.add(key)
    }
    return false
  }

  // Handle save product
  const handleSaveProduct = async (data: ProductFormData, images?: File[], variants: any[] = []) => {
    // Check for duplicate variants
    if (hasDuplicateVariants(variants)) {
      toast({
        title: "Error",
        description: "Duplicate variants found. Each variant must have a unique combination of size and color.",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingProduct) {
        await updateProductMutation.mutateAsync({
          id: editingProduct.id,
          data,
          variants: variants || []
        })
      } else if (images) {
        await createProductMutation.mutateAsync({ data, images, variants })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save product. Please try again.",
        variant: "destructive",
      })
    }
  }

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { isAuthenticated, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [updateExisting, setUpdateExisting] = useState(false)

  // Loading state for product creation
  const [isCreatingProduct, setIsCreatingProduct] = useState(false)
  const [creationProgress, setCreationProgress] = useState({
    step: "",
    progress: 0,
    total: 0,
  })

  // Pending Reviews State
  const [pendingReviews, setPendingReviews] = useState<ProductReview[]>([])
  const [pendingLoading, setPendingLoading] = useState(false)
  const [pendingError, setPendingError] = useState<string | null>(null)
  const [reviewProductNames, setReviewProductNames] = useState<Record<number, string>>({})

  // Determine active tab based on URL
  const getActiveTab = () => {
    const path = location.pathname
    if (path.includes("/admin/products")) return "products"
    if (path.includes("/admin/dashboard")) return "overview"
    return "overview" // default
  }

  const [activeTab, setActiveTab] = useState(getActiveTab())

  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(getActiveTab())
  }, [location.pathname])

  // Handle authentication state changes
  useEffect(() => {
    if (!authLoading) {
      setIsLoading(false);
      if (!isAuthenticated) {
        // If we're not on the login page and not authenticated, redirect to login
        if (!window.location.pathname.includes('/login')) {
          navigate("/admin/login");
        }
      } else if (window.location.pathname === '/admin/login') {
        // If we're logged in but on the login page, redirect to admin dashboard
        navigate("/admin");
      }
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch products
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const data = await fetchProducts()
      // Cast to admin Product type for compatibility
      return data as unknown as Product[]
    },
    enabled: isAuthenticated,
  })

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
    enabled: isAuthenticated,
  })

  // Fetch admin statistics
  const { data: adminStats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: () => getAdminStats(token!),
    enabled: isAuthenticated && !!token,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Fetch recent registrations
  const { data: recentRegistrations } = useQuery({
    queryKey: ["recent-registrations"],
    queryFn: () => getRecentRegistrations(token!, 5, 7),
    enabled: isAuthenticated && !!token,
    refetchInterval: 60000, // Refresh every minute
  })

  // Fetch recent orders
  const { data: recentOrders } = useQuery({
    queryKey: ["recent-orders"],
    queryFn: () => getRecentOrders(token!, 5, 7),
    enabled: isAuthenticated && !!token,
    refetchInterval: 60000, // Refresh every minute
  })

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async ({ data, images, variants }: { data: ProductFormData; images?: File[]; variants?: any[] }) => {
      setIsCreatingProduct(true)

      // Calculate total steps
      const totalSteps = 1 + (variants?.length || 0) + (images?.length || 0)
      let currentStep = 0

      // Step 1: Create product
      setCreationProgress({ step: "Creating product...", progress: currentStep, total: totalSteps })
      const newProduct = await createProduct(data, token!)
      currentStep++

      if (!newProduct || !newProduct.id) {
        throw new Error("Product creation failed - no product ID returned")
      }

      // Step 2: Create variants
      if (variants && variants.length > 0) {
        try {
          for (let i = 0; i < variants.length; i++) {
            const variant = variants[i]
            setCreationProgress({
              step: `Creating variant ${i + 1}/${variants.length}...`,
              progress: currentStep,
              total: totalSteps,
            })

            const variantData = {
              size: variant.size,
              color: variant.color,
              sku: "", // Let backend generate SKU
              price: variant.price,
              stock: variant.stock,
            }
            await createProductVariant(newProduct.id, variantData, token!)
            currentStep++
          }
        } catch (error: any) {
          throw new Error(`Product created but variant creation failed: ${error.message}`)
        }
      }

      // Step 3: Upload images (batch)
      const imageUploadResults = { success: 0, failed: 0, errors: [] as string[] }
      if (images && images.length > 0) {
        setCreationProgress({ step: `Uploading ${images.length} images...`, progress: currentStep, total: totalSteps })
        try {
          const result = await uploadProductImages(newProduct.id, images, token!)
          imageUploadResults.success = images.length
        } catch (error: any) {
          imageUploadResults.failed = images.length
          imageUploadResults.errors.push(error.message)
        }
        currentStep++
      }

      setCreationProgress({ step: "Finalizing...", progress: totalSteps, total: totalSteps })
      return { newProduct, imageUploadResults }
    },
    onSuccess: ({ newProduct, imageUploadResults }, { images, variants }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })

      let message = "Product created successfully"
      const parts = []

      if (variants && variants.length > 0) {
        parts.push(`${variants.length} variant(s)`)
      }
      if (images && images.length > 0) {
        if (imageUploadResults.success > 0) {
          parts.push(`${imageUploadResults.success} image(s)`)
        }
        if (imageUploadResults.failed > 0) {
          parts.push(`${imageUploadResults.failed} image(s) failed`)
        }
      }

      if (parts.length > 0) {
        message = `Product with ${parts.join(" and ")} created successfully`
      }

      let description = ""
      if (imageUploadResults.failed > 0) {
        description = `${imageUploadResults.failed} image(s) failed to upload. Check console for details.`
      }

      toast({
        title: message,
        description: description || undefined,
        variant: imageUploadResults.failed > 0 ? "default" : "default",
      })
      setIsAddingProduct(false)
      setIsCreatingProduct(false)
    },
    onError: (error: any) => {
      toast({
        title: "Error creating product",
        description: error.message,
        variant: "destructive",
      })
      setIsCreatingProduct(false)
    },
  })

  // Update product mutation with variant handling
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data, variants = [] }: { id: number; data: ProductFormData; variants: any[] }) => {
      // First update the basic product info
      const updatedProduct = await updateProduct(id, data, token!)
      
      // Then handle variants if any
      if (variants && variants.length > 0) {
        // Get existing variants to compare
        const response = await api.get(`/products/${id}/variants`, {
          headers: buildApiHeaders(undefined, token!)
        });
        
        // Handle different possible response structures
        let variantsData = [];
        if (Array.isArray(response.data)) {
          variantsData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          variantsData = response.data.data;
        } else if (response.data && response.data.variants) {
          variantsData = Array.isArray(response.data.variants) 
            ? response.data.variants 
            : [];
        }
        
        // Create a map of existing variants by size and color
        const existingVariantMap = new Map(
          variantsData.map((v: any) => [
            `${v.size || ''}-${v.color || ''}`, 
            v
          ])
        )
        
        // First, collect all variant keys from the new variants
        const newVariantKeys = new Set(
          variants
            .filter(v => v.size && v.color)
            .map(v => `${v.size}-${v.color}`)
        );
        
        // Find variants that exist in the database but not in the new variants
        const variantsToDelete = Array.from(existingVariantMap.entries())
          .filter(([key]) => !newVariantKeys.has(key))
          .map(([_, variant]) => variant);
        
        // Delete variants that were removed
        for (const variantToDelete of variantsToDelete) {
          try {
            const variantKey = `${variantToDelete.size}-${variantToDelete.color}`;
            
            // First try the standalone endpoint (as per routes/api.php)
            try {
              const response = await api.delete(
                `/variants/${variantToDelete.id}`,
                { 
                  headers: buildApiHeaders(undefined, token!),
                  validateStatus: (status) => status < 500
                }
              );
              continue; // If successful, move to next variant
            } catch (standaloneError) {
            }
            
            // If standalone endpoint fails, try the nested endpoint
            try {
              const response = await api.delete(
                `/products/${id}/variants/${variantToDelete.id}`,
                { 
                  headers: buildApiHeaders(undefined, token!),
                  validateStatus: (status) => status < 500
                }
              );
            } catch (nestedError) {              
              // Try a direct fetch as a last resort
              try {
                const response = await fetch(
                  `${window.location.origin}/api/variants/${variantToDelete.id}`,
                  {
                    method: 'DELETE',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Accept': 'application/json',
                      'Content-Type': 'application/json',
                      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    },
                    credentials: 'include'
                  }
                );
                
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Failed to delete variant');
              } catch (fetchError) {
              }
            }
          } catch (error) {
          }
        }
        
        // Process each new/updated variant
        for (const variant of variants) {
          try {
            if (!variant.size || !variant.color) {
              continue;
            }
            
            const variantKey = `${variant.size}-${variant.color}`;
            const existingVariant = existingVariantMap.get(variantKey);
            
            if (existingVariant?.id) {
              // Update existing variant
              await api.put(
                `/products/${id}/variants/${existingVariant.id}`,
                {
                  size: variant.size,
                  color: variant.color,
                  price: variant.price || 0,
                  stock: variant.stock || 0,
                  sku: variant.sku || `variant-${variant.size}-${variant.color}`,
                },
                { 
                  headers: buildApiHeaders(undefined, token!),
                  validateStatus: (status) => status < 500 // Don't throw on 4xx errors
                }
              ).catch(error => {
                throw error;
              });
            } else {
              // Create new variant
              await api.post(
                `/products/${id}/variants`,
                {
                  size: variant.size,
                  color: variant.color,
                  price: variant.price || 0,
                  stock: variant.stock || 0,
                  sku: variant.sku || `variant-${variant.size}-${variant.color}`,
                },
                { 
                  headers: buildApiHeaders(undefined, token!),
                  validateStatus: (status) => status < 500 // Don't throw on 4xx errors
                }
              ).catch(error => {
                throw error;
              });
            }
          } catch (error) {
            // Continue with next variant even if one fails
            continue;
          }
        }
      }
      
      return updatedProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
      toast({ title: "Product and variants updated successfully" })
      setEditingProduct(null)
    },
    onError: (error: any) => {
    },
  })

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
      toast({ title: "Product deleted successfully" })
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Approve review mutation
  const approveReviewMutation = useMutation({
    mutationFn: (reviewId: number) => approveReview(reviewId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
      toast({ title: "Review approved" })
    },
    onError: (error: any) => {
      toast({
        title: "Error approving review",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Reject review mutation
  const rejectReviewMutation = useMutation({
    mutationFn: (reviewId: number) => rejectReview(reviewId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
      toast({ title: "Review rejected" })
    },
    onError: (error: any) => {
      toast({
        title: "Error rejecting review",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Fetch pending reviews on mount
  useEffect(() => {
    if (!isAuthenticated) return
    setPendingLoading(true)
    getPendingReviews()
      .then(async (reviews) => {
        setPendingReviews(reviews)
        // Fetch product names for each review
        const names: Record<number, string> = {}
        await Promise.all(
          reviews.map(async (review) => {
            try {
              const product = await fetchProductById(review.product_id.toString())
              names[review.id] = product.name
            } catch {
              names[review.id] = "Product"
            }
          }),
        )
        setReviewProductNames(names)
      })
      .catch((e) => setPendingError(e.message || "Failed to load pending reviews"))
      .finally(() => setPendingLoading(false))
  }, [isAuthenticated])

  const handleDeleteProduct = (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProductMutation.mutate(product.id)
    }
  }

  const handleBulkUpload = async () => {
    if (!uploadFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const result = await bulkUploadProducts(uploadFile, updateExisting, token!)

      const uniqueProducts = result.unique_products || Math.ceil(result.successful / 2) // Fallback estimate

      toast({
        title: "Bulk upload completed",
        description: `${uniqueProducts} unique products with ${result.successful} variants uploaded successfully${result.failed > 0 ? `, ${result.failed} failed` : ""}`,
        className: result.failed > 0 ? "bg-yellow-500 text-white" : "bg-green-500 text-white",
      })

      if (result.failed > 0) {
      }

      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
      setUploadFile(null)
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const blob = await getBulkUploadTemplate(token!)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "product-upload-template.csv"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error: any) {
      toast({
        title: "Error downloading template",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (!isAuthenticated) {
    return <LoadingState message="Loading..." className="min-h-screen" />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Loading Overlay */}
      {isCreatingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
              <h3 className="text-lg font-semibold">Creating Product</h3>
              <p className="text-sm text-muted-foreground">{creationProgress.step}</p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(creationProgress.progress / creationProgress.total) * 100}%`,
                  }}
                ></div>
              </div>

              <p className="text-xs text-muted-foreground">
                Step {creationProgress.progress} of {creationProgress.total}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-foreground">Admin Dashboard</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full min-w-max grid-cols-10 gap-1 p-1">
            <TabsTrigger value="overview" onClick={() => navigate("/admin/dashboard")} className="text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger value="products" onClick={() => navigate("/admin/products")} className="text-xs sm:text-sm px-2 sm:px-3">
              Products
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm px-2 sm:px-3">
              Users
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Categories</span>
              <span className="sm:hidden">Cat.</span>
            </TabsTrigger>
            {/* <TabsTrigger value="bulk-upload" className="text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden lg:inline">Bulk Upload</span>
              <span className="lg:hidden hidden sm:inline">Upload</span>
              <span className="sm:hidden">CSV</span>
            </TabsTrigger> */}
            <TabsTrigger value="orders" className="text-xs sm:text-sm px-2 sm:px-3">
              Orders
            </TabsTrigger>
            <TabsTrigger value="pending-reviews" className="text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden lg:inline">Pending Reviews</span>
              <span className="lg:hidden hidden sm:inline">Reviews</span>
              <span className="sm:hidden">Rev.</span>
            </TabsTrigger>
            <TabsTrigger value="contact-forms" className="text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden lg:inline">Contact Forms</span>
              <span className="lg:hidden hidden sm:inline">Contacts</span>
              <span className="sm:hidden">Con.</span>
            </TabsTrigger>
            <TabsTrigger value="blogs" onClick={() => navigate("/admin/blogs")} className="text-xs sm:text-sm px-2 sm:px-3">
              Blogs
            </TabsTrigger>
            <TabsTrigger value="faqs" className="text-xs sm:text-sm px-2 sm:px-3">
              FAQs
            </TabsTrigger>
            <TabsTrigger value="hero-images" className="text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden lg:inline">Hero Images</span>
              <span className="lg:hidden hidden sm:inline">Hero</span>
              <span className="sm:hidden">Hero</span>
            </TabsTrigger>
          </TabsList>
        </div>

  {/* Overview Tab */}
        {/* FAQ Management Tab */}
        <TabsContent value="faqs" className="space-y-6">
          <AdminFaqs />
        </TabsContent>

        {/* Hero Images Management Tab */}
        <TabsContent value="hero-images" className="space-y-6">
          <AdminHeroImages />
        </TabsContent>
        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          {statsLoading ? (
            <LoadingState message="Loading dashboard statistics..." className="py-8" />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <Card className="transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{adminStats?.total_products || 0}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Total Products</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{adminStats?.new_orders || 0}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">New Orders (30 days)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{adminStats?.total_customers || 0}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Total Customers</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Euro className="h-6 w-6 sm:h-8 sm:w-8 text-gold-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">€{adminStats?.recent_revenue?.toFixed(2) || '0.00'}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Revenue (30 days)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional statistics row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <Card className="transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{adminStats?.new_registrations || 0}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">New Registrations</p>
                      </div>
                      {(adminStats?.new_registrations || 0) > 0 && (
                        <Badge className="bg-green-500 text-white ml-2 flex-shrink-0">New</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{adminStats?.new_contact_forms || 0}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">New Contact Forms</p>
                      </div>
                      {(adminStats?.unread_contact_forms || 0) > 0 && (
                        <Badge className="bg-red-500 text-white ml-2 flex-shrink-0">{adminStats.unread_contact_forms} Unread</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{adminStats?.pending_orders || 0}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Pending Orders</p>
                      </div>
                      {(adminStats?.pending_orders || 0) > 0 && (
                        <Badge className="bg-yellow-500 text-white ml-2 flex-shrink-0">Pending</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{adminStats?.low_stock_variants || 0}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Low Stock Items</p>
                      </div>
                      {(adminStats?.low_stock_variants || 0) > 0 && (
                        <Badge className="bg-orange-500 text-white ml-2 flex-shrink-0">Alert</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setActiveTab('users')} 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                  {(adminStats?.new_registrations || 0) > 0 && (
                    <Badge className="ml-auto bg-green-500 text-white">{adminStats.new_registrations}</Badge>
                  )}
                </Button>
                <Button 
                  onClick={() => setActiveTab('products')} 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Manage Products
                </Button>
                <Button 
                  onClick={() => setActiveTab('orders')} 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  View Orders
                  {(adminStats?.pending_orders || 0) > 0 && (
                    <Badge className="ml-auto bg-yellow-500 text-white">{adminStats.pending_orders}</Badge>
                  )}
                </Button>
                <Button 
                  onClick={() => setActiveTab('contact-forms')} 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Contact Forms
                  {(adminStats?.unread_contact_forms || 0) > 0 && (
                    <Badge className="ml-auto bg-red-500 text-white">{adminStats.unread_contact_forms}</Badge>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Orders
                  {(recentOrders?.total_count || 0) > 0 && (
                    <Badge className="bg-blue-500 text-white">{recentOrders?.total_count} New</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentOrders?.orders && recentOrders.orders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <div className="font-medium">Order #{order.order_number}</div>
                          <div className="text-sm text-muted-foreground">{order.customer_name}</div>
                          <div className="text-xs text-muted-foreground">
                            €{Number(order.total).toFixed(2)} • {order.time_ago}
                          </div>
                        </div>
                        <Badge 
                          className={
                            order.status === 'completed' ? 'bg-green-500 text-white' :
                            order.status === 'pending' ? 'bg-yellow-500 text-white' :
                            order.status === 'shipped' ? 'bg-blue-500 text-white' :
                            'bg-gray-500 text-white'
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    ))}
                    {(recentOrders.total_count || 0) > 5 && (
                      <div className="text-center pt-2">
                        <span className="text-sm text-muted-foreground">
                          +{recentOrders.total_count - 5} more orders
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No recent orders
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold">Manage Products</h2>
            <Button
              onClick={() => setIsAddingProduct(true)}
              className="bg-gold-500 hover:bg-gold-600 text-leather-900 font-semibold w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          {isAddingProduct && (
            <ProductForm
              onSave={handleSaveProduct}
              onCancel={() => setIsAddingProduct(false)}
              categories={categories}
              token={token}
              isCreatingProduct={isCreatingProduct}
            />
          )}

          {editingProduct && (
            <ProductForm
              key={`edit-product-${editingProduct.id}`}
              product={editingProduct}
              categories={categories}
              token={token}
              isCreatingProduct={isCreatingProduct}
              onSave={(data, images, variants = []) => {
                updateProductMutation.mutate({ 
                  id: editingProduct.id, 
                  data,
                  variants: variants || []
                })
              }}
              onCancel={() => setEditingProduct(null)}
            />
          )}

          {productsLoading ? (
            <LoadingState message="Loading products..." className="py-8" />
          ) : (
            <div className="grid gap-4 sm:gap-6">
              {products.map((product) => (
                <Card key={product.id} className="transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center mx-auto sm:mx-0">
                        <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{product.category.name}</p>
                          </div>
                          <div className="flex gap-2 justify-center sm:justify-end flex-shrink-0">
                            <Button variant="outline" size="sm" onClick={() => setEditingProduct(product)}>
                              <Edit className="h-4 w-4" />
                              <span className="hidden sm:inline ml-1">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProduct(product)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden sm:inline ml-1">Delete</span>
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <span className="font-semibold text-gold-500 text-lg">€{product.price}</span>
                          <div className="flex items-center gap-2 sm:gap-4 text-sm">
                            <Badge variant="default">{product.variants?.length || 0} variants</Badge>
                            <span className="text-muted-foreground">
                              Variants: {product.variants?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <CategoryManagement
            categories={categories}
            onCategoryCreated={() => queryClient.invalidateQueries({ queryKey: ["categories"] })}
            onCategoryUpdated={() => queryClient.invalidateQueries({ queryKey: ["categories"] })}
            onCategoryDeleted={() => queryClient.invalidateQueries({ queryKey: ["categories"] })}
          />
        </TabsContent>

        {/* Bulk Upload Tab - Temporarily commented out */}
        {/* <TabsContent value="bulk-upload" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
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
                    className="mt-1"
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
                  <Label htmlFor="update-existing" className="text-sm">Update existing products</Label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    onClick={handleBulkUpload}
                    disabled={!uploadFile || isUploading}
                    className="bg-green-500 hover:bg-green-600 text-white flex-1 sm:flex-none order-1 sm:order-none"
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
                    className="flex-1 sm:flex-none bg-transparent order-2 sm:order-none"
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
                    <li>
                      • Use <strong>image_file_1</strong>, <strong>image_file_2</strong>, etc. columns in CSV
                    </li>
                    <li>• Reference image files by name (e.g., "red-shirt-front.jpg")</li>
                    <li>• Images are automatically uploaded to Cloudinary</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">CSV Required Columns:</h4>
                  <ul className="text-sm space-y-1">
                    <li>
                      • <strong>name</strong> - Product name
                    </li>
                    <li>
                      • <strong>description</strong> - Product description
                    </li>
                    <li>
                      • <strong>price</strong> - Base price (decimal)
                    </li>
                    <li>
                      • <strong>category_name</strong> - Category name (must exist)
                    </li>
                  </ul>

                  <h4 className="font-medium mb-2 mt-4">Optional Variant Columns:</h4>
                  <ul className="text-sm space-y-1">
                    <li>
                      • <strong>sku</strong> - Stock keeping unit (unique)
                    </li>
                    <li>
                      • <strong>color</strong> - Product color
                    </li>
                    <li>
                      • <strong>size</strong> - Product size
                    </li>
                    <li>
                      • <strong>price</strong> - Price for this variant
                    </li>
                    <li>
                      • <strong>stock</strong> - Quantity in stock (default: 0)
                    </li>
                  </ul>

                  <h4 className="font-medium mb-2 mt-4">Image Columns:</h4>
                  <ul className="text-sm space-y-1">
                    <li>
                      • <strong>image_file_1</strong> - Image file names (for ZIP upload)
                    </li>
                    <li>
                      • <strong>image_url_1</strong> - Direct image URLs (for CSV-only)
                    </li>
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
                    products.zip
                    <br />
                    ├── products.csv
                    <br />
                    ├── red-shirt-front.jpg
                    <br />
                    ├── red-shirt-back.jpg
                    <br />
                    ├── blue-shirt-front.jpg
                    <br />
                    └── blue-shirt-back.jpg
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Example CSV Format:</h4>
                  <div className="text-xs font-mono bg-white p-2 rounded border">
                    name,description,price,category_name,sku,color,size,stock,image_file_1,image_file_2
                    <br />
                    "Nordic Sweater","Wool
                    sweater","89.99","Clothing","NS-RED-M","Red","M","50","https://example.com/image1.jpg","https://example.com/image2.jpg"
                    <br />
                    "Nordic Sweater","Wool
                    sweater","89.99","Clothing","NS-RED-L","Red","L","30","https://example.com/image1.jpg",""
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent> */}

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <OrderManagement />
        </TabsContent>
        {/* Pending Reviews Tab */}
        <TabsContent value="pending-reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingLoading ? (
                <div className="text-center py-4">Loading pending reviews...</div>
              ) : pendingError ? (
                <div className="text-red-500 text-center py-4">{pendingError}</div>
              ) : pendingReviews.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No pending reviews</div>
              ) : (
                <div className="space-y-4">
                  {pendingReviews.map((review) => {
                    // Use first image in media as thumbnail, fallback to icon
                    const mainMedia = review.media && review.media.length > 0 ? review.media[0] : null
                    const productName = reviewProductNames[review.id] || "Product"
                    const userName = (review as any).userName || (review as any).customer_name || "User"
                    const handleApprove = (id: number) => approveReviewMutation.mutate(id)
                    const handleReject = (id: number) => rejectReviewMutation.mutate(id)
                    const isModalOpen = openReviewModalId === review.id
                    return (
                      <div key={review.id} className="p-4 border rounded-lg bg-white shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          {/* Thumbnail */}
                          <MediaThumbnail
                            media={mainMedia ? { url: mainMedia.url, type: mainMedia.type as "image" | "video" } : null}
                            onClick={() => mainMedia && setOpenReviewModalId(review.id)}
                            className="mr-4"
                          />
                          {/* Media Preview Modal (reusable) */}
                          <MediaPreviewModal
                            open={isModalOpen}
                            onClose={() => setOpenReviewModalId(null)}
                            media={mainMedia ? { url: mainMedia.url, type: mainMedia.type as "image" | "video" } : null}
                          />
                          {/* Review Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-lg truncate">{productName}</span>
                              <a
                                href={review.product_id ? `/product/${review.product_id}` : "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-1 text-blue-500 hover:text-blue-700"
                                title="View product in new tab"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Lucide ExternalLink icon for robust UI */}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                  <polyline points="15 3 21 3 21 9" />
                                  <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                              </a>
                              <span className="text-xs text-muted-foreground">#{review.id}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-muted-foreground">By {userName}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(review.created_at).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={star <= review.rating ? "text-yellow-400" : "text-gray-300"}
                                >
                                  ★
                                </span>
                              ))}
                              <span className="ml-2 text-xs text-muted-foreground">{review.rating}/5</span>
                            </div>
                            {review.title && <div className="font-medium mb-1">{review.title}</div>}
                            {review.review_text && <div className="mb-2 text-sm">{review.review_text}</div>}
                          </div>
                          {/* Actions */}
                          <div className="flex flex-col gap-2 md:items-end md:justify-center">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApprove(review.id)}
                              disabled={approveReviewMutation.isPending}
                            >
                              {approveReviewMutation.isPending && approveReviewMutation.variables?.[0] === review.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                              ) : null}
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleReject(review.id)}
                              disabled={rejectReviewMutation.isPending}
                            >
                              {rejectReviewMutation.isPending && rejectReviewMutation.variables?.[0] === review.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                              ) : null}
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Forms Tab */}
        <TabsContent value="contact-forms" className="space-y-6">
          <ContactForms />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}

// Category Management Component
interface CategoryManagementProps {
  categories: Category[]
  onCategoryCreated: () => void
  onCategoryUpdated: () => void
  onCategoryDeleted: () => void
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  onCategoryCreated,
  onCategoryUpdated,
  onCategoryDeleted,
}) => {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  })

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) => createCategory(data, token || ""),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category created successfully",
      })
      setIsCreateDialogOpen(false)
      setCategoryForm({ name: "", description: "" })
      onCategoryCreated()
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; description?: string } }) =>
      updateCategory(id, data, token || ""),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category updated successfully",
      })
      setEditingCategory(null)
      onCategoryUpdated()
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId: number) => deleteCategory(categoryId, token || ""),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category deleted successfully",
      })
      onCategoryDeleted()
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleCreateCategory = () => {
    if (!categoryForm.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      })
      return
    }

    createCategoryMutation.mutate({
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim() || undefined,
    })
  }

  const handleUpdateCategory = () => {
    if (!editingCategory || !categoryForm.name.trim()) {
      return
    }

    updateCategoryMutation.mutate({
      id: editingCategory.id,
      data: {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim() || undefined,
      },
    })
  }

  const handleDeleteCategory = (category: Category) => {
    if (
      window.confirm(`Are you sure you want to delete the "${category.name}" category? This action cannot be undone.`)
    ) {
      deleteCategoryMutation.mutate(category.id)
    }
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      description: category.description || "",
    })
  }

  const closeEditDialog = () => {
    setEditingCategory(null)
    setCategoryForm({ name: "", description: "" })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Category Management</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
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
                <Button onClick={handleCreateCategory} disabled={createCategoryMutation.isPending}>
                  {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
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
          <div className="space-y-3 sm:space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{category.name}</h3>
                  {category.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{category.description}</p>}
                </div>
                <div className="flex space-x-2 justify-end sm:justify-start flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(category)}>
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCategory(category)}
                    disabled={deleteCategoryMutation.isPending}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Delete</span>
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
              <Button onClick={handleUpdateCategory} disabled={updateCategoryMutation.isPending}>
                {updateCategoryMutation.isPending ? "Updating..." : "Update Category"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminDashboard;

// Hero Image Management Component
interface HeroImage {
  id: number;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const HeroImageManagement: React.FC = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<HeroImage | null>(null);
  const [heroImageForm, setHeroImageForm] = useState({
    image_url: "",
    alt_text: "",
    sort_order: 0,
    is_active: true,
  });

  // Fetch hero images
  const { data: heroImages = [], isLoading } = useQuery({
    queryKey: ["admin-hero-images"],
    queryFn: async () => {
      const response = await api.get("/admin/hero-images", {
        headers: buildApiHeaders(undefined, token!)
      });
      return response.data as HeroImage[];
    },
    enabled: !!token,
  });

  // Create hero image mutation
  const createHeroImageMutation = useMutation({
    mutationFn: async (data: typeof heroImageForm) => {
      const response = await api.post("/admin/hero-images", data, {
        headers: buildApiHeaders(undefined, token!)
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Hero image created successfully",
      });
      setIsCreateDialogOpen(false);
      setHeroImageForm({ image_url: "", alt_text: "", sort_order: 0, is_active: true });
      queryClient.invalidateQueries({ queryKey: ["admin-hero-images"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create hero image",
        variant: "destructive",
      });
    },
  });

  // Update hero image mutation
  const updateHeroImageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof heroImageForm> }) => {
      const response = await api.put(`/admin/hero-images/${id}`, data, {
        headers: buildApiHeaders(undefined, token!)
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Hero image updated successfully",
      });
      setEditingImage(null);
      queryClient.invalidateQueries({ queryKey: ["admin-hero-images"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update hero image",
        variant: "destructive",
      });
    },
  });

  // Delete hero image mutation
  const deleteHeroImageMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/hero-images/${id}`, {
        headers: buildApiHeaders(undefined, token!)
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Hero image deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-hero-images"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete hero image",
        variant: "destructive",
      });
    },
  });

  // Reorder hero images mutation
  const reorderHeroImagesMutation = useMutation({
    mutationFn: async (images: { id: number; sort_order: number }[]) => {
      const response = await api.post("/admin/hero-images/reorder", { images }, {
        headers: buildApiHeaders(undefined, token!)
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Hero images reordered successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-hero-images"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reorder hero images",
        variant: "destructive",
      });
    },
  });

  const handleCreateHeroImage = () => {
    if (!heroImageForm.image_url.trim()) {
      toast({
        title: "Error",
        description: "Image URL is required",
        variant: "destructive",
      });
      return;
    }

    createHeroImageMutation.mutate(heroImageForm);
  };

  const handleUpdateHeroImage = () => {
    if (!editingImage) return;

    updateHeroImageMutation.mutate({
      id: editingImage.id,
      data: heroImageForm,
    });
  };

  const handleDeleteHeroImage = (image: HeroImage) => {
    if (window.confirm(`Are you sure you want to delete this hero image?`)) {
      deleteHeroImageMutation.mutate(image.id);
    }
  };

  const openEditDialog = (image: HeroImage) => {
    setEditingImage(image);
    setHeroImageForm({
      image_url: image.image_url,
      alt_text: image.alt_text || "",
      sort_order: image.sort_order,
      is_active: image.is_active,
    });
  };

  const closeEditDialog = () => {
    setEditingImage(null);
    setHeroImageForm({ image_url: "", alt_text: "", sort_order: 0, is_active: true });
  };

  const handleReorder = (dragIndex: number, hoverIndex: number) => {
    const draggedImage = heroImages[dragIndex];
    const newImages = [...heroImages];

    // Remove dragged item
    newImages.splice(dragIndex, 1);
    // Insert at new position
    newImages.splice(hoverIndex, 0, draggedImage);

    // Update sort orders
    const reorderedImages = newImages.map((image, index) => ({
      id: image.id,
      sort_order: index,
    }));

    reorderHeroImagesMutation.mutate(reorderedImages);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Hero Image Management</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Hero Image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Hero Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="hero-image-url">Image URL</Label>
                <Input
                  id="hero-image-url"
                  value={heroImageForm.image_url}
                  onChange={(e) => setHeroImageForm({ ...heroImageForm, image_url: e.target.value })}
                  placeholder="Enter image URL"
                />
              </div>
              <div>
                <Label htmlFor="hero-alt-text">Alt Text (Optional)</Label>
                <Input
                  id="hero-alt-text"
                  value={heroImageForm.alt_text}
                  onChange={(e) => setHeroImageForm({ ...heroImageForm, alt_text: e.target.value })}
                  placeholder="Enter alt text for accessibility"
                />
              </div>
              <div>
                <Label htmlFor="hero-sort-order">Sort Order</Label>
                <Input
                  id="hero-sort-order"
                  type="number"
                  value={heroImageForm.sort_order}
                  onChange={(e) => setHeroImageForm({ ...heroImageForm, sort_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hero-is-active"
                  checked={heroImageForm.is_active}
                  onCheckedChange={(checked) => setHeroImageForm({ ...heroImageForm, is_active: checked as boolean })}
                />
                <Label htmlFor="hero-is-active">Active</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateHeroImage} disabled={createHeroImageMutation.isPending}>
                  {createHeroImageMutation.isPending ? "Creating..." : "Create Hero Image"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hero Images ({heroImages.length})</CardTitle>
          <p className="text-sm text-muted-foreground">
            Drag and drop to reorder images. Only active images will be displayed on the homepage.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading hero images...</div>
          ) : heroImages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hero images found. Create your first hero image to get started.
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {heroImages.map((image, index) => (
                <div
                  key={image.id}
                  className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-white shadow-sm"
                >
                  <div className="w-full sm:w-32 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={image ? `${import.meta.env.VITE_BACKEND_URL}${image.image_url}` : null}
                      alt={image.alt_text || "Hero image"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">Hero Image #{image.id}</h3>
                      <Badge variant={image.is_active ? "default" : "secondary"}>
                        {image.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {image.alt_text && (
                      <p className="text-sm text-muted-foreground">
                        Alt: {image.alt_text}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Sort Order: {image.sort_order}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:items-end sm:justify-center">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(image)}>
                        <Edit className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteHeroImage(image)}
                        disabled={deleteHeroImageMutation.isPending}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Hero Image Dialog */}
      <Dialog open={!!editingImage} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hero Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-hero-image-url">Image URL</Label>
              <Input
                id="edit-hero-image-url"
                value={heroImageForm.image_url}
                onChange={(e) => setHeroImageForm({ ...heroImageForm, image_url: e.target.value })}
                placeholder="Enter image URL"
              />
            </div>
            <div>
              <Label htmlFor="edit-hero-alt-text">Alt Text (Optional)</Label>
              <Input
                id="edit-hero-alt-text"
                value={heroImageForm.alt_text}
                onChange={(e) => setHeroImageForm({ ...heroImageForm, alt_text: e.target.value })}
                placeholder="Enter alt text for accessibility"
              />
            </div>
            <div>
              <Label htmlFor="edit-hero-sort-order">Sort Order</Label>
              <Input
                id="edit-hero-sort-order"
                type="number"
                value={heroImageForm.sort_order}
                onChange={(e) => setHeroImageForm({ ...heroImageForm, sort_order: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-hero-is-active"
                checked={heroImageForm.is_active}
                onCheckedChange={(checked) => setHeroImageForm({ ...heroImageForm, is_active: checked as boolean })}
              />
              <Label htmlFor="edit-hero-is-active">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={closeEditDialog}>
                Cancel
              </Button>
              <Button onClick={handleUpdateHeroImage} disabled={updateHeroImageMutation.isPending}>
                {updateHeroImageMutation.isPending ? "Updating..." : "Update Hero Image"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

