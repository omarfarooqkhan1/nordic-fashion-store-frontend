import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Header } from "@/components/Layout/Header"
import { Footer } from "@/components/Layout/Footer"
import AppProviders from "./providers/AppProviders"
import ErrorBoundary from "./components/ErrorBoundary"
import TestComponent from "./TestComponent"
import ProtectedRoute from "./components/Auth/ProtectedRoute"

// Critical Pages (loaded immediately)
import Index from "./pages/Index"
import About from "./pages/About"
import Contact from "./pages/Contact"
import TermsAndConditions from "./pages/TermsAndConditions"
import PrivacyPolicy from "./pages/PrivacyPolicy"
import FAQ from "./pages/FAQ"
import Products from "./pages/Products"
import ProductDetail from "./pages/ProductDetail"
import Cart from "./pages/Cart"
import AdminLogin from "./pages/AdminLogin"
import NotFound from "./pages/NotFound"

// Auth Pages
import CustomerLogin from "./pages/auth/CustomerLogin"
import CustomerSignup from "./pages/auth/CustomerSignup"
import VerifyEmail from "./pages/auth/VerifyEmail"
import Auth0Callback from "./pages/auth/Auth0Callback"
import ForgotPassword from "./pages/auth/ForgotPassword"
import ResetPassword from "./pages/auth/ResetPassword"

// Success Pages
import CheckoutSuccess from "./pages/CheckoutSuccess"

// Lazy loaded heavy components
import {
  LazyCustomJacketConfigurator,
  LazyAdminDashboard,
  LazyAdminProductEdit,
  LazyAdminBlogManagement,
  LazyCheckoutFixed,
  LazyProfile,
  LazyOrders,
  LazyBlog,
  LazyBlogDetail
} from "./components/common/LazyWrapper"

const App: React.FC = () => {
  return (
    <AppProviders>
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
                              <Route path="/terms" element={<TermsAndConditions />} />
                              <Route path="/privacy" element={<PrivacyPolicy />} />
                              <Route path="/faqs" element={<FAQ />} />
                              <Route path="/products" element={<Products />} />
                              <Route path="/product/:id" element={<ProductDetail />} />
                              
                              {/* Blog Routes */}
                              <Route path="/blogs" element={<LazyBlog />} />
                              <Route path="/blogs/:slug" element={<LazyBlogDetail />} />

                              {/* New Auth Routes */}
                              <Route path="/login" element={<CustomerLogin />} />
                              <Route path="/custom-jacket" element={<LazyCustomJacketConfigurator />} />
                              <Route path="/signup" element={<CustomerSignup />} />
                              <Route path="/verify-email" element={<VerifyEmail />} />
                              <Route path="/admin/login" element={<AdminLogin />} />
                              <Route path="/forgot-password" element={<ForgotPassword />} />
                              <Route path="/reset-password/:token" element={<ResetPassword />} />
                              <Route path="/auth/callback" element={<Auth0Callback />} />

                              {/* Cart Route - Can be accessed by customers or guests */}
                              <Route path="/cart" element={<Cart />} />

                              {/* Checkout Route - Can be accessed by customers or guests */}
                              <Route path="/checkout" element={<LazyCheckoutFixed />} />
                              <Route path="/checkout/success" element={<CheckoutSuccess />} />

                              {/* Customer Protected Routes */}
                              <Route
                                path="/profile"
                                element={
                                  <ProtectedRoute requireCustomer>
                                    <LazyProfile />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/orders"
                                element={
                                  <ProtectedRoute requireCustomer>
                                    <LazyOrders />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/orders/:id"
                                element={<LazyOrders />}
                              />

                              {/* Admin Routes */}
                              <Route
                                path="/admin"
                                element={
                                  <ProtectedRoute requireAdmin>
                                    <LazyAdminDashboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/admin/dashboard"
                                element={
                                  <ProtectedRoute requireAdmin>
                                    <LazyAdminDashboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/admin/products"
                                element={
                                  <ProtectedRoute requireAdmin>
                                    <LazyAdminDashboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/admin/products/:id/edit"
                                element={
                                  <ProtectedRoute requireAdmin>
                                    <LazyAdminProductEdit />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/admin/blogs"
                                element={
                                  <ProtectedRoute requireAdmin>
                                    <LazyAdminBlogManagement />
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
    </AppProviders>
  )
}

export default App