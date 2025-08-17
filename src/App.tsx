"use client"

import type React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Auth0Provider } from "@auth0/auth0-react"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Header } from "@/components/Layout/Header"
import { Footer } from "@/components/Layout/Footer"
import ErrorBoundary from "./components/ErrorBoundary"

// Context Providers
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { LanguageProvider } from "./contexts/LanguageContext"
import { CartProvider } from "./contexts/CartContext"
import ProtectedRoute from "./components/Auth/ProtectedRoute"

// Existing Pages
import Index from "./pages/Index"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Products from "./pages/Products"
import ProductDetail from "./pages/ProductDetail"
import Cart from "./pages/Cart"
import AdminDashboard from "./pages/AdminDashboard"
import AdminProductEdit from "./pages/AdminProductEdit"
import AdminLogin from "./pages/AdminLogin"
import NotFound from "./pages/NotFound"

// New Auth Pages
import CustomerLogin from "./pages/auth/CustomerLogin"
import CustomJacketConfigurator from "./pages/CustomJacketConfigurator"
import CustomerSignup from "./pages/auth/CustomerSignup"
import VerifyEmail from "./pages/auth/VerifyEmail"
import Auth0Callback from "./pages/auth/Auth0Callback"
import ForgotPassword from "./pages/auth/ForgotPassword"
import ResetPassword from "./pages/auth/ResetPassword"

// Customer Pages
import Profile from "./pages/Profile"
import Orders from "./pages/Orders"
import CheckoutFixed from "./pages/CheckoutFixed"

// Create a client
const queryClient = new QueryClient()

// Auth0 configuration
const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />                <Auth0Provider
                  domain={auth0Domain}
                  clientId={auth0ClientId}
                  authorizationParams={{
                    redirect_uri: `${window.location.origin}/auth/callback`,
                    audience: auth0Audience,
                  }}
                  cacheLocation="localstorage"
                  useRefreshTokens={true}
                  onRedirectCallback={(appState) => {
                    // Handle the callback and redirect to intended page
                    const returnTo = appState?.returnTo || window.location.pathname;
                    window.location.replace(returnTo);
                  }}
                >
                <AuthProvider>
                  <CartProvider>
                    <Router>
                      <div className="min-h-screen flex flex-col">
                        <Header />
                        <main className="flex-1">
                          <ErrorBoundary>
                            <Routes>
                              {/* Existing Public Routes */}
                              <Route path="/" element={<Index />} />
                              <Route path="/about" element={<About />} />
                              <Route path="/contact" element={<Contact />} />
                              <Route path="/products" element={<Products />} />
                              <Route path="/product/:id" element={<ProductDetail />} />

                              {/* New Auth Routes */}
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/custom-jacket" element={<CustomJacketConfigurator />} />
                              <Route path="/signup" element={<CustomerSignup />} />
                              <Route path="/verify-email" element={<VerifyEmail />} />
                              <Route path="/admin/login" element={<AdminLogin />} />
                              <Route path="/forgot-password" element={<ForgotPassword />} />
                              <Route path="/reset-password/:token" element={<ResetPassword />} />
                              <Route path="/auth/callback" element={<Auth0Callback />} />

                              {/* Cart Route - Can be accessed by customers or guests */}
                              <Route path="/cart" element={<Cart />} />

                              {/* Checkout Route - Can be accessed by customers or guests */}
                              <Route path="/checkout" element={<CheckoutFixed />} />

                              {/* Customer Protected Routes */}
                              <Route
                                path="/profile"
                                element={
                                  <ProtectedRoute requireCustomer>
                                    <Profile />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/orders"
                                element={
                                  <ProtectedRoute requireCustomer>
                                    <Orders />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/orders/:id"
                                element={<Orders />}
                              />

                              {/* Admin Routes */}
                              <Route
                                path="/admin"
                                element={
                                  <ProtectedRoute requireAdmin>
                                    <AdminDashboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/admin/dashboard"
                                element={
                                  <ProtectedRoute requireAdmin>
                                    <AdminDashboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/admin/products"
                                element={
                                  <ProtectedRoute requireAdmin>
                                    <AdminDashboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/admin/products/:id/edit"
                                element={
                                  <ProtectedRoute requireAdmin>
                                    <AdminProductEdit />
                                  </ProtectedRoute>
                                }
                              />

                              {/* Fallback Routes */}
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </ErrorBoundary>
                        </main>
                        <Footer />
                      </div>
                    </Router>
                  </CartProvider>
                </AuthProvider>
              </Auth0Provider>
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App