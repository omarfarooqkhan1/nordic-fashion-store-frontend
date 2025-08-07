"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useLocation } from "react-router-dom"
import { Package, Calendar, Truck, CheckCircle, Clock, XCircle, Eye, ArrowLeft, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { useAuth } from "../contexts/AuthContext"
import { fetchOrders, fetchOrder, Order as ApiOrder, OrderItem as ApiOrderItem } from "@/api/orders"
import { useToast } from "@/hooks/use-toast"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface Order {
  id: string
  orderNumber: string
  date: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total: number
  items: OrderItem[]
  shippingAddress: {
    name: string
    address: string
    city: string
    postalCode: string
    country: string
  }
  trackingNumber?: string
}

const Orders: React.FC = () => {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const location = useLocation()
  const params = useParams()
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null)
  const [singleOrder, setSingleOrder] = useState<ApiOrder | null>(null)

  // Check if this is a single order view
  const isOrderDetail = params.id && location.pathname.includes('/orders/')
  const fromCheckout = location.state?.fromCheckout

  useEffect(() => {
    const loadOrders = async () => {
      try {
        if (isOrderDetail && params.id) {
          // Load single order
          const order = await fetchOrder(params.id, token);
          setSingleOrder(order);
          
          if (fromCheckout) {
            toast({
              title: "Order Confirmation",
              description: `Your order #${order.order_number} has been successfully placed!`,
              className: "bg-green-500 text-white"
            });
          }
        } else {
          // Load all orders
          const fetchedOrders = await fetchOrders(token);
          setOrders(fetchedOrders);
        }
      } catch (error: any) {
        console.error("Failed to fetch orders:", error);
        toast({
          title: "Error",
          description: "Failed to load orders. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [token, isOrderDetail, params.id, fromCheckout, toast]);

  const getStatusIcon = (status: ApiOrder["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: ApiOrder["status"]) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "processing":
        return "default"
      case "shipped":
        return "default"
      case "delivered":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your orders...</p>
          </div>
        </div>
      </div>
    )
  }

  // Single order detail view
  if (isOrderDetail && singleOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = '/orders'}
            className="mb-6 hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>

          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Order Confirmation</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Order #{singleOrder.order_number}</p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Order Details</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(singleOrder.created_at)}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(singleOrder.status)}>
                    {getStatusIcon(singleOrder.status)}
                    <span className="ml-1 capitalize">{singleOrder.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-3">Items Ordered</h4>
                  <div className="space-y-3">
                    {singleOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">{item.variant_name}</p>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">€{Number(item.subtotal || 0).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">€{Number(item.price || 0).toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Order Summary */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>€{Number(singleOrder.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>€{Number(singleOrder.shipping || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>€{Number(singleOrder.tax || 0).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>€{Number(singleOrder.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Tracking Information */}
                {singleOrder.tracking_number && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Package Tracking
                    </h4>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Tracking Number</p>
                          <code className="font-mono text-lg font-semibold text-blue-900 dark:text-blue-100">
                            {singleOrder.tracking_number}
                          </code>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a 
                            href={`https://www.google.com/search?q=track+package+${singleOrder.tracking_number}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Track Package
                          </a>
                        </Button>
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                        📦 Your package is on its way! Use this tracking number to monitor delivery progress.
                      </p>
                    </div>
                  </div>
                )}

                {/* Shipping Address */}
                <div>
                  <h4 className="font-medium mb-3">Shipping Address</h4>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{singleOrder.shipping_name}</p>
                    <p className="text-sm text-muted-foreground">{singleOrder.shipping_address}</p>
                    <p className="text-sm text-muted-foreground">
                      {singleOrder.shipping_city}, {singleOrder.shipping_postal_code}
                    </p>
                    <p className="text-sm text-muted-foreground">{singleOrder.shipping_country}</p>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h4 className="font-medium mb-3">Payment Information</h4>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">Status: <span className="font-medium capitalize">{singleOrder.payment_status}</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Orders</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Track and manage your order history</p>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No orders yet</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You haven't placed any orders yet. Start shopping to see your orders here!
                </p>
                <Button asChild>
                  <a href="/products">Browse Products</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Order {order.order_number}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.created_at)}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusColor(order.status)} className="mb-2">
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </Badge>
                        <p className="text-lg font-semibold">€{Number(order.total || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Order Items Preview */}
                      <div>
                        <h4 className="font-medium mb-2">Items ({order.items.length})</h4>
                        <div className="flex gap-2 overflow-x-auto">
                          {order.items.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="flex-shrink-0 flex items-center gap-2 p-2 bg-muted rounded-lg"
                            >
                              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{item.product_name}</p>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="flex-shrink-0 flex items-center justify-center p-2 bg-muted rounded-lg text-sm text-muted-foreground">
                              +{order.items.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Order Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Status: {order.payment_status}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.location.href = `/orders/${order.id}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          {(order.status === "shipped" || order.status === "delivered") && order.tracking_number && (
                            <Button size="sm" variant="outline" asChild>
                              <a 
                                href={`https://www.google.com/search?q=track+package+${order.tracking_number}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                              >
                                <Truck className="h-4 w-4" />
                                Track Package
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                          {(order.status === "shipped" || order.status === "delivered") && !order.tracking_number && (
                            <Button size="sm" variant="outline" disabled>
                              <Truck className="h-4 w-4 mr-1" />
                              Tracking Pending
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Orders
