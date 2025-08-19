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
import { useLanguage } from "../contexts/LanguageContext"
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
  const { t } = useLanguage()
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
  const orderDataFromCheckout = location.state?.orderData;

  useEffect(() => {
    const loadOrders = async () => {
      try {
        if (isOrderDetail && params.id) {
          // If order data is available from checkout (guest), use it directly
          if (orderDataFromCheckout) {
            setSingleOrder(orderDataFromCheckout);
            if (fromCheckout) {
              toast({
                title: t('orders.orderConfirmation'),
                description: t('orders.orderSuccess').replace('{orderNumber}', orderDataFromCheckout.order_number),
                className: "bg-green-500 text-white"
              });
            }
          } else {
            // Otherwise, fetch from backend (requires auth)
            const order = await fetchOrder(params.id, token);
            setSingleOrder(order);
            if (fromCheckout) {
              toast({
                title: t('orders.orderConfirmation'),
                description: t('orders.orderSuccess').replace('{orderNumber}', order.order_number),
                className: "bg-green-500 text-white"
              });
            }
          }
        } else {
          // Load all orders
          const fetchedOrders = await fetchOrders(token);
          setOrders(fetchedOrders);
        }
      } catch (error: any) {
        console.error("Failed to fetch orders:", error);
        toast({
          title: t('orders.error'),
          description: t('orders.loadError'),
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [token, isOrderDetail, params.id, fromCheckout, toast, orderDataFromCheckout]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-6 sm:py-8">
        <div className="container mx-auto px-2 sm:px-4 max-w-4xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm sm:text-base">{t('orders.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  // Single order detail view
  if (isOrderDetail && singleOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-6 sm:py-8">
        <div className="container mx-auto px-2 sm:px-4 max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = '/orders'}
            className="mb-4 sm:mb-6 hover:bg-accent text-base sm:text-lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('orders.backToOrders')}
          </Button>

          <div className="space-y-5 sm:space-y-6">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">{t('orders.orderConfirmation')}</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">Order #{singleOrder.order_number}</p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">{t('orders.orderDetails')}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1 text-xs sm:text-sm">
                      <Calendar className="h-4 w-4" />
                      {formatDate(singleOrder.created_at)}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(singleOrder.status)} className="mt-2 sm:mt-0">
                    {getStatusIcon(singleOrder.status)}
                    <span className="ml-1 capitalize">{singleOrder.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 sm:space-y-6">
                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-2 sm:mb-3">{t('orders.itemsOrdered')}</h4>
                  <div className="space-y-2 sm:space-y-3">
                    {singleOrder.items.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 border rounded-lg">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          <Package className="h-7 w-7 sm:h-8 sm:w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm sm:text-base">{item.product_name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{item.variant_name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{t('orders.quantity')}: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm sm:text-base">€{Number(item.subtotal || 0).toFixed(2)}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">€{Number(item.price || 0).toFixed(2)} {t('orders.each')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Order Summary */}
                <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
                  <h4 className="font-medium mb-2 sm:mb-3">{t('orders.orderSummary')}</h4>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span>{t('orders.subtotal')}</span>
                      <span>€{Number(singleOrder.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('orders.shipping')}</span>
                      <span>€{Number(singleOrder.shipping || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('orders.tax')}</span>
                      <span>€{Number(singleOrder.tax || 0).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-base sm:text-lg">
                      <span>{t('orders.total')}</span>
                      <span>€{Number(singleOrder.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Tracking Information */}
                {singleOrder.tracking_number && (
                  <div>
                    <h4 className="font-medium mb-2 sm:mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      {t('orders.packageTracking')}
                    </h4>
                    <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                        <div>
                          <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mb-1">{t('orders.trackingNumber')}</p>
                          <code className="font-mono text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100">
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
                            {t('orders.trackPackage')}
                          </a>
                        </Button>
                      </div>
                      <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mt-2">
                        {t('orders.trackingInfo')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Shipping Address */}
                <div>
                  <h4 className="font-medium mb-2 sm:mb-3">{t('orders.shippingAddress')}</h4>
                  <div className="p-2 sm:p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm sm:text-base">{singleOrder.shipping_name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{singleOrder.shipping_address}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {singleOrder.shipping_city}, {singleOrder.shipping_postal_code}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{singleOrder.shipping_country}</p>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h4 className="font-medium mb-2 sm:mb-3">{t('orders.paymentInformation')}</h4>
                  <div className="p-2 sm:p-3 bg-muted rounded-lg">
                    <p className="text-xs sm:text-sm">{t('orders.status')}: <span className="font-medium capitalize">{singleOrder.payment_status}</span></p>
                  </div>
                </div>

                {/* Estimated Shipping Time - Only show if order is not delivered */}
                {singleOrder.status !== 'delivered' && (
                  <div>
                    <h4 className="font-medium mb-2 sm:mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      {t('orders.estimatedShipping')}
                    </h4>
                    <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{t('orders.shippingTime')}</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">{t('orders.shippingTimeDesc')}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-6 sm:py-8">
      <div className="container mx-auto px-2 sm:px-4 max-w-4xl">
        <div className="space-y-5 sm:space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">{t('orders.title')}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">{t('orders.subtitle')}</p>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 sm:py-12">
                <Package className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('orders.noOrders')}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">
                  {t('orders.noOrdersDesc')}
                </p>
                <Button asChild>
                  <a href="/products">{t('orders.browseProducts')}</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <div>
                        <CardTitle className="text-base sm:text-lg">Order {order.order_number}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1 text-xs sm:text-sm">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.created_at)}
                        </CardDescription>
                      </div>
                      <div className="text-right mt-2 sm:mt-0">
                        <Badge variant={getStatusColor(order.status)} className="mb-1 sm:mb-2">
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </Badge>
                        {/* Only show shipping time if order is not delivered */}
                        {order.status !== 'delivered' && (
                          <div className="flex items-center justify-end gap-1 mb-1">
                            <Truck className="h-3 w-3 text-blue-600" />
                            <span className="text-xs text-blue-600">{t('orders.shippingTime')}</span>
                          </div>
                        )}
                        <p className="text-base sm:text-lg font-semibold">€{Number(order.total || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {/* Order Items Preview */}
                      <div>
                        <h4 className="font-medium mb-1 sm:mb-2">{t('orders.items')} ({order.items.length})</h4>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {order.items.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="flex-shrink-0 flex items-center gap-2 p-2 bg-muted rounded-lg min-w-[120px]"
                            >
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 dark:text-gray-500" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-medium truncate">{item.product_name}</p>
                                <p className="text-xs text-muted-foreground">{t('orders.quantity')}: {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="flex-shrink-0 flex items-center justify-center p-2 bg-muted rounded-lg text-xs sm:text-sm text-muted-foreground min-w-[60px]">
                              +{order.items.length - 3} {t('orders.more')}
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Order Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                        <div className="flex gap-2">
                          {(order.status === "shipped" || order.status === "delivered") && order.tracking_number && (
                            <Button size="sm" variant="outline" asChild>
                              <a 
                                href={`https://www.google.com/search?q=track+package+${order.tracking_number}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                              >
                                <Truck className="h-4 w-4" />
                                {t('orders.trackPackage')}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                          {(order.status === "shipped" || order.status === "delivered") && !order.tracking_number && (
                            <Button size="sm" variant="outline" disabled>
                              <Truck className="h-4 w-4 mr-1" />
                              {t('orders.trackingPending')}
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
