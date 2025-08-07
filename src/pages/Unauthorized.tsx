"use client"

import type React from "react"
import { Link } from "react-router-dom"
import { Shield, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
              <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Access Denied</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">You don't have permission to access this page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This page requires specific permissions that your account doesn't have. Please contact an administrator if
            you believe this is an error.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link to="/" className="flex items-center justify-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/login">Login with Different Account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Unauthorized
