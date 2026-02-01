import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { getFullImageUrl, handleImageError } from '@/utils/imageUtils';
import { 
  Package, 
  Edit, 
  AlertCircle,
  Truck,
  Eye
} from 'lucide-react';
import MediaPreviewModal from '@/components/MediaPreviewModal';

import { 
  fetchAllOrders, 
  updateOrderStatus, 
  type Order as OrderType, 
  type OrderUpdateData 
} from '@/api/orders';

const OrderManagement: React.FC = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState<OrderUpdateData>({});
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [showConfirmation, setShowConfirmation] = useState(false);



  // Fetch orders query
  const { data: ordersData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => fetchAllOrders(token!),
    enabled: !!token,
  });

  // Ensure orders is always an array
  const orders = Array.isArray(ordersData) ? ordersData : [];

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, updateData }: { orderId: number; updateData: OrderUpdateData }) =>
      updateOrderStatus(orderId, updateData, token!),
    onSuccess: (response: any) => {
      toast({
        title: 'Order Updated',
        description: response.message || 'Order updated successfully',
      });
      refetch();
      setIsUpdateDialogOpen(false);
      setSelectedOrder(null);
      setUpdateForm({});
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update order',
        variant: 'destructive',
      });
    },
  });

  const handleOrderUpdate = (order: OrderType) => {
    setSelectedOrder(order);
    setUpdateForm({
      status: order.status,
      tracking_number: order.tracking_number || '',
      shipping_service: order.shipping_service as 'DHL' | 'FedEx' | 'UPS' | undefined,
      notes: order.notes || '',
    });
    setValidationErrors({});
    setIsUpdateDialogOpen(true);
  };

  const toggleOrderExpansion = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleImagePreview = (imageUrl: string) => {
    setImagePreview({ url: imageUrl, type: 'image' });
  };

  // Pagination logic
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    setExpandedOrderId(null); // Close any expanded orders when changing pages
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    // Always validate if status is being set to shipped
    if (updateForm.status === 'shipped') {
      if (!updateForm.tracking_number || updateForm.tracking_number.trim() === '') {
        errors.tracking_number = 'Tracking number is required for shipped orders';
      }
      if (!updateForm.shipping_service) {
        errors.shipping_service = 'Shipping service is required for shipped orders';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateField = (field: string, value: any) => {
    const errors = { ...validationErrors };
    
    if (field === 'tracking_number' && updateForm.status === 'shipped') {
      if (!value || value.trim() === '') {
        errors.tracking_number = 'Tracking number is required for shipped orders';
      } else {
        delete errors.tracking_number;
      }
    }
    
    if (field === 'shipping_service' && updateForm.status === 'shipped') {
      if (!value) {
        errors.shipping_service = 'Shipping service is required for shipped orders';
      } else {
        delete errors.shipping_service;
      }
    }
    
    setValidationErrors(errors);
  };

  const handleSubmitUpdate = () => {
    // Validate form before showing confirmation
    if (!validateForm()) {
      return;
    }
    
    if (selectedOrder) {
      let updateData = { ...updateForm };
      
      // Additional check: if trying to set status to shipped, ensure required fields are present
      if (updateData.status === 'shipped') {
        if (!updateData.tracking_number || updateData.tracking_number.trim() === '') {
          setValidationErrors(prev => ({ ...prev, tracking_number: 'Tracking number is required for shipped orders' }));
          toast({
            title: 'Validation Error',
            description: 'Tracking number is required when setting order status to shipped',
            variant: 'destructive',
          });
          return;
        }
        if (!updateData.shipping_service) {
          setValidationErrors(prev => ({ ...prev, shipping_service: 'Shipping service is required for shipped orders' }));
          toast({
            title: 'Validation Error',
            description: 'Shipping service is required when setting order status to shipped',
            variant: 'destructive',
          });
          return;
        }
      }
      
      // Only force status to 'shipped' if tracking number is set AND status is not already 'shipped' or 'delivered'
      if (updateData.tracking_number && updateData.tracking_number.trim() !== '' && 
          updateData.status !== 'shipped' && updateData.status !== 'delivered') {
        updateData.status = 'shipped';
      }
      
      // Show confirmation dialog
      setShowConfirmation(true);
    }
  };

  const handleConfirmedUpdate = () => {
    if (selectedOrder) {
      let updateData = { ...updateForm };
      
      // Only force status to 'shipped' if tracking number is set AND status is not already 'shipped' or 'delivered'
      if (updateData.tracking_number && updateData.tracking_number.trim() !== '' && 
          updateData.status !== 'shipped' && updateData.status !== 'delivered') {
        updateData.status = 'shipped';
      }
      
      updateOrderMutation.mutate({
        orderId: selectedOrder.id,
        updateData,
      });
      
      setShowConfirmation(false);
    }
  };

  const getConfirmationMessage = () => {
    if (!selectedOrder || !updateForm.status) return '';
    
    const orderNumber = selectedOrder.order_number;
    const customerName = selectedOrder.shipping_name;
    const newStatus = updateForm.status;
    const currentStatus = selectedOrder.status;
    
    let message = `Are you sure you want to update order #${orderNumber} for ${customerName}?\n\n`;
    message += `Status will change from "${currentStatus}" to "${newStatus}".`;
    
    if (newStatus === 'shipped' && updateForm.tracking_number) {
      message += `\n\nTracking number: ${updateForm.tracking_number}`;
      if (updateForm.shipping_service) {
        message += `\nShipping service: ${updateForm.shipping_service}`;
      }
    }
    
    if (newStatus === 'cancelled') {
      message += '\n\n⚠️ This will notify the customer that their order has been cancelled and inform them about the refund process.';
    } else if (newStatus === 'shipped') {
      message += '\n\n📦 This will send a shipping confirmation email with tracking information to the customer.';
    } else if (newStatus === 'delivered') {
      message += '\n\n🎉 This will send a delivery confirmation email to the customer.';
    } else {
      message += '\n\n📧 This will send a status update email to the customer.';
    }
    
    return message;
  };

  const getStatusColor = (status: OrderType['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getPaymentMethodDisplay = (paymentMethod: string) => {
    switch (paymentMethod) {
      case 'credit_card':
        return 'Credit Card';
      case 'paypal':
        return 'PayPal';
      case 'stripe':
        return 'Stripe';
      default:
        return paymentMethod || 'Unknown';
    }
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'PLN': 'zł',
      'CZK': 'Kč',
      'HUF': 'Ft',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'INR': '₹',
      'KRW': '₩',
      'BRL': 'R$',
      'MXN': '$',
      'ZAR': 'R',
      'TRY': '₺',
      'RUB': '₽',
      'AED': 'د.إ',
      'SAR': '﷼',
      'THB': '฿',
      'SGD': 'S$',
      'HKD': 'HK$',
      'NZD': 'NZ$',
      'TWD': 'NT$',
      'MYR': 'RM',
      'PHP': '₱',
      'IDR': 'Rp',
      'VND': '₫',
    };
    return symbols[currency?.toUpperCase()] || currency || '€';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Order Management</h2>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading orders...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Order Management</h2>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">Failed to load orders</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Order Management</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{orders.length} Total Orders</Badge>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b bg-muted/25">
              <p className="text-sm text-muted-foreground">
                💡 Click on any order row to view detailed items and variants
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Order #</th>
                    <th className="text-left p-4 font-medium">Customer</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Total</th>
                    <th className="text-left p-4 font-medium">Payment</th>
                    <th className="text-left p-4 font-medium">Currency</th>
                    <th className="text-left p-4 font-medium">Tracking</th>
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr 
                        className={`border-b hover:bg-muted/25 cursor-pointer transition-colors ${
                          expandedOrderId === order.id ? 'bg-muted/50' : ''
                        }`}
                        onClick={() => toggleOrderExpansion(order.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleOrderExpansion(order.id);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-expanded={expandedOrderId === order.id}
                        aria-label={`Toggle order details for ${order.order_number}`}
                      >
                        <td className="p-4 font-mono text-sm">
                          <div className="flex items-center gap-2">
                            <span>{order.order_number}</span>
                            <span className="text-xs text-muted-foreground">
                              {expandedOrderId === order.id ? '▼' : '▶'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{order.shipping_name}</p>
                            <p className="text-sm text-muted-foreground">{order.shipping_email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4 font-medium">{getCurrencySymbol(order.currency)}{Number(order.total).toFixed(2)}</td>
                        <td className="p-4">
                          <Badge variant="outline" className="text-xs">
                            {getPaymentMethodDisplay(order.payment_method)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                            {order.currency || 'EUR'}
                          </span>
                        </td>
                        <td className="p-4">
                          {order.tracking_number ? (
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-green-600" />
                              <code className="text-sm bg-muted px-2 py-1 rounded">{order.tracking_number}</code>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Not set</span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOrderUpdate(order);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Update
                          </Button>
                        </td>
                      </tr>
                      
                      {/* Expandable Order Details */}
                      {expandedOrderId === order.id && (
                        <tr>
                          <td colSpan={7} className="p-0">
                            <div className="bg-muted/25 p-6 border-t">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-lg">Order Items</h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedOrderId(null);
                                    }}
                                    className="text-muted-foreground hover:text-foreground"
                                  >
                                    ✕ Close
                                  </Button>
                                </div>
                                <div className="grid gap-4">
                                  {order.items.map((item) => (
                                    <div key={item.id} className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
                                      {/* Product Image */}
                                      <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        {/* Check if this is a custom jacket order */}
                                        {item.product_snapshot?.custom_jacket ? (
                                          // Custom jacket - show both front and back images
                                          <div className="flex gap-1 w-full h-full">
                                            {/* Front Image */}
                                            <div className="relative flex-1 group">
                                              <img
                                                src={getFullImageUrl(item.product_snapshot.custom_jacket.front_image_url)}
                                                alt={`Custom ${item.product_name} - Front View`}
                                                className="w-full h-full object-cover cursor-pointer rounded-l"
                                                onClick={() => handleImagePreview(getFullImageUrl(item.product_snapshot.custom_jacket.front_image_url))}
                                                onError={(e) => handleImageError(e, 'Front View')}
                                              />
                                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center pointer-events-none">
                                                <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                              </div>
                                              <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                                                Front
                                              </div>
                                            </div>
                                            
                                            {/* Back Image (if exists) */}
                                            {item.product_snapshot.custom_jacket.back_image_url ? (
                                              <div className="relative flex-1 group">
                                                <img
                                                  src={getFullImageUrl(item.product_snapshot.custom_jacket.back_image_url)}
                                                  alt={`Custom ${item.product_name} - Back View`}
                                                  className="w-full h-full object-cover cursor-pointer rounded-r"
                                                  onClick={() => handleImagePreview(getFullImageUrl(item.product_snapshot.custom_jacket.back_image_url))}
                                                  onError={(e) => handleImageError(e, 'Back View')}
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center pointer-events-none">
                                                  <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                                </div>
                                                <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                                                  Back
                                                </div>
                                              </div>
                                            ) : (
                                              // Placeholder for back image if not available
                                              <div className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-r flex items-center justify-center">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">No back view</span>
                                              </div>
                                            )}
                                          </div>
                                        ) : item.variant?.product?.images?.[0]?.url ? (
                                          // Product image with backend URL
                                          <div className="relative w-full h-full group">
                                            <img
                                              src={`${import.meta.env.VITE_BACKEND_URL}${item.variant.product.images[0].url}`}
                                              alt={item.variant.product.images[0].alt_text || item.product_name}
                                              className="w-full h-full object-cover cursor-pointer"
                                              onClick={() => handleImagePreview(`${import.meta.env.VITE_BACKEND_URL}${item.variant.product.images[0].url}`)}
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center pointer-events-none">
                                              <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                            </div>
                                          </div>
                                        ) : (
                                          // No image available
                                          <div className="w-full h-full flex items-center justify-center">
                                            <Package className="h-8 w-8 text-gray-400" />
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Product Details */}
                                      <div className="flex-1 space-y-2">
                                        <div>
                                          <h5 className="font-medium">{item.product_name}</h5>
                                          <p className="text-sm text-muted-foreground">
                                            Variant: {item.variant_name}
                                            {item.variant && (
                                              <>
                                                {' '}({item.variant.color}, {item.variant.size})
                                              </>
                                            )}
                                          </p>
                                          {/* Only show "No image available" if there are no images at all */}
                                          {!item.variant?.images?.[0]?.url && !item.variant?.product?.images?.[0]?.url && !item.product_snapshot?.custom_jacket && (
                                            <p className="text-xs text-muted-foreground italic">No image available</p>
                                          )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-4 text-sm">
                                            <span className="text-muted-foreground">Quantity: {item.quantity}</span>
                                            <span className="text-muted-foreground">Price: {getCurrencySymbol(order.currency)}{Number(item.converted_price || item.price).toFixed(2)}</span>
                                          </div>
                                          <span className="font-semibold">{getCurrencySymbol(order.currency)}{Number(item.converted_subtotal || item.subtotal).toFixed(2)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Order Summary */}
                                <div className="border-t pt-4">
                                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                    <div>
                                      <p className="text-muted-foreground">Subtotal</p>
                                      <p className="font-medium">{getCurrencySymbol(order.currency)}{Number(order.subtotal).toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Shipping</p>
                                      <p className="font-medium">{getCurrencySymbol(order.currency)}{Number(order.shipping).toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Tax</p>
                                      <p className="font-medium">{getCurrencySymbol(order.currency)}{Number(order.tax).toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Total</p>
                                      <p className="font-medium text-lg">{getCurrencySymbol(order.currency)}{Number(order.total).toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Payment Method</p>
                                      <p className="font-medium">{getPaymentMethodDisplay(order.payment_method)}</p>
                                      <p className="text-xs text-muted-foreground">Currency: {order.currency || 'EUR'}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t bg-muted/25">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      Showing {startIndex + 1} to {Math.min(endIndex, orders.length)} of {orders.length} orders
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      ← Previous
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current page
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={page === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => goToPage(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span key={page} className="px-2 text-muted-foreground">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                    >
                      Next →
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Orders per page:</span>
                    <Select
                      value={ordersPerPage.toString()}
                      onValueChange={(value) => {
                        setCurrentPage(1); // Reset to first page when changing page size
                        // Note: ordersPerPage is currently fixed, but this could be made dynamic
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update Order Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Order #{selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Validation Summary */}
            {Object.keys(validationErrors).length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium mb-2">Please fix the following errors:</p>
                <ul className="text-sm text-red-600 space-y-1">
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <li key={field}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
            

            
            {/* Order Status */}
            <div className="space-y-2">
              <Label htmlFor="status">
                Order Status
                {updateForm.status === 'shipped' && (
                  <span className="text-sm text-muted-foreground ml-2">(Tracking & Service required)</span>
                )}
              </Label>
              <Select
                value={updateForm.status}
                onValueChange={(value: OrderType['status']) => {
                  setUpdateForm(prev => ({ ...prev, status: value }));
                  setValidationErrors({});
                  // Validate existing fields when status changes to shipped
                  if (value === 'shipped') {
                    validateField('tracking_number', updateForm.tracking_number);
                    validateField('shipping_service', updateForm.shipping_service);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tracking Number */}
            <div className="space-y-2">
              <Label htmlFor="tracking_number">
                Tracking Number
                {updateForm.status === 'shipped' && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                id="tracking_number"
                placeholder="Enter tracking number (e.g., TRK123456789)"
                value={updateForm.tracking_number || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setUpdateForm(prev => ({ ...prev, tracking_number: value }));
                  validateField('tracking_number', value);
                }}
                className={validationErrors.tracking_number ? 'border-red-500' : ''}
              />
              <p className="text-sm text-muted-foreground">
                📦 This tracking number will be visible to customers for package tracking
                {updateForm.status === 'shipped' && (
                  <span className="text-red-500 font-medium"> Required when status is "Shipped"</span>
                )}
              </p>
              {validationErrors.tracking_number && (
                <p className="text-sm text-red-500">{validationErrors.tracking_number}</p>
              )}
            </div>

            {/* Shipping Service */}
            <div className="space-y-2">
              <Label htmlFor="shipping_service">
                Shipping Service
                {updateForm.status === 'shipped' && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <div className="space-y-3">
                <div className="flex gap-3">
                  {['DHL', 'FedEx', 'UPS'].map((service) => (
                    <Button
                      key={service}
                      type="button"
                      variant={updateForm.shipping_service === service ? 'default' : 'outline'}
                      onClick={() => {
                        setUpdateForm(prev => ({ ...prev, shipping_service: service }));
                        validateField('shipping_service', service);
                      }}
                    >
                      {service}
                    </Button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom_shipping_service" className="text-sm text-muted-foreground">
                    Or enter custom shipping service:
                  </Label>
                  <Input
                    id="custom_shipping_service"
                    placeholder="Enter custom shipping service (e.g., PostNord, Posti, etc.)"
                    value={!['DHL', 'FedEx', 'UPS'].includes(updateForm.shipping_service || '') ? updateForm.shipping_service || '' : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setUpdateForm(prev => ({ ...prev, shipping_service: value }));
                      validateField('shipping_service', value);
                    }}
                    className={validationErrors.shipping_service ? 'border-red-500' : ''}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Select a common shipping service or enter a custom one.
                {updateForm.status === 'shipped' && (
                  <span className="text-red-500 font-medium"> Required when status is "Shipped"</span>
                )}
              </p>
              {validationErrors.shipping_service && (
                <p className="text-sm text-red-500">{validationErrors.shipping_service}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add internal notes about this order..."
                value={updateForm.notes || ''}
                onChange={(e) => 
                  setUpdateForm(prev => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
              />
            </div>

            {/* Order Details Summary */}
            {selectedOrder && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Order Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p>{selectedOrder.shipping_name}</p>
                    <p className="text-muted-foreground">{selectedOrder.shipping_email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-medium">{getCurrencySymbol(selectedOrder.currency)}{Number(selectedOrder.total).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment</p>
                    <p>{getPaymentMethodDisplay(selectedOrder.payment_method)}</p>
                    <p className="text-xs text-muted-foreground">{selectedOrder.currency || 'EUR'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Items</p>
                    <p>{selectedOrder.items.length} item(s)</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p>{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Shipping Address</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.shipping_address}, {selectedOrder.shipping_city}, {selectedOrder.shipping_postal_code}, {selectedOrder.shipping_country}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
            >
              Cancel
            </Button>
            <ConfirmationDialog
              trigger={
                <Button
                  disabled={
                    updateOrderMutation.isPending || 
                    (updateForm.status === 'shipped' && (!updateForm.tracking_number || !updateForm.shipping_service))
                  }
                  className={
                    updateForm.status === 'shipped' && (!updateForm.tracking_number || !updateForm.shipping_service)
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }
                >
                  {updateOrderMutation.isPending ? 'Updating...' : 'Update Order'}
                  {updateForm.status === 'shipped' && (!updateForm.tracking_number || !updateForm.shipping_service) && (
                    <span className="ml-2 text-xs">(Required fields missing)</span>
                  )}
                </Button>
              }
              title="Confirm Order Update"
              description={getConfirmationMessage()}
              confirmText="Yes, Update Order"
              cancelText="Cancel"
              onConfirm={handleConfirmedUpdate}
              variant={updateForm.status === 'cancelled' ? 'destructive' : 'default'}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      <MediaPreviewModal
        open={!!imagePreview}
        onClose={() => setImagePreview(null)}
        media={imagePreview}
      />
    </div>
  );
};

export default OrderManagement;
