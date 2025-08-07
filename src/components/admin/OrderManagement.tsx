import React, { useState } from 'react';
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
import { 
  Package, 
  Edit, 
  AlertCircle,
  Truck
} from 'lucide-react';

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

  // Fetch orders query
  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => fetchAllOrders(token!),
    enabled: !!token,
  });

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
      notes: order.notes || '',
    });
    setIsUpdateDialogOpen(true);
  };

  const handleSubmitUpdate = () => {
    if (selectedOrder) {
      updateOrderMutation.mutate({
        orderId: selectedOrder.id,
        updateData: updateForm,
      });
    }
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Order #</th>
                    <th className="text-left p-4 font-medium">Customer</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Total</th>
                    <th className="text-left p-4 font-medium">Tracking</th>
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/25">
                      <td className="p-4 font-mono text-sm">{order.order_number}</td>
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
                      <td className="p-4 font-medium">€{order.total.toFixed(2)}</td>
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
                          onClick={() => handleOrderUpdate(order)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Update
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update Order Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Order #{selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Order Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Order Status</Label>
              <Select
                value={updateForm.status}
                onValueChange={(value: OrderType['status']) => 
                  setUpdateForm(prev => ({ ...prev, status: value }))
                }
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
              <Label htmlFor="tracking_number">Tracking Number</Label>
              <Input
                id="tracking_number"
                placeholder="Enter tracking number (e.g., TRK123456789)"
                value={updateForm.tracking_number || ''}
                onChange={(e) => 
                  setUpdateForm(prev => ({ ...prev, tracking_number: e.target.value }))
                }
              />
              <p className="text-sm text-muted-foreground">
                📦 This tracking number will be visible to customers for package tracking
              </p>
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
                    <p className="font-medium">€{selectedOrder.total.toFixed(2)}</p>
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
            <Button
              onClick={handleSubmitUpdate}
              disabled={updateOrderMutation.isPending}
            >
              {updateOrderMutation.isPending ? 'Updating...' : 'Update Order'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;
