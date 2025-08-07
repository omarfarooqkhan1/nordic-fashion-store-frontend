"use client"

import type React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  requireCustomer?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false, requireCustomer = false }) => {
  const { isAuthenticated, isAdmin, isCustomer, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-sm">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated) {
    // If it's an admin route, redirect to admin login
    if (requireAdmin) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />
    }
    // Otherwise redirect to customer login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" replace />
  }

  if (requireCustomer && !isCustomer) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute