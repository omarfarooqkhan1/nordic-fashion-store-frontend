"use client"

import type React from "react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"

const Auth0Callback: React.FC = () => {
  const navigate = useNavigate()
  const { isLoading, error, isAuthenticated, user } = useAuth0()

  useEffect(() => {
    if (!isLoading) {
      if (error) {
        console.error("Auth0 error:", error)
        navigate("/login?error=auth_failed")
        return
      }

      if (isAuthenticated && user) {
        // Auth0 React SDK handles the callback automatically
        // Just redirect to home or intended page
        const returnTo = localStorage.getItem('auth_return_to') || '/'
        localStorage.removeItem('auth_return_to')
        navigate(returnTo)
      } else {
        // If not authenticated after callback, redirect to login
        navigate("/login")
      }
    }
  }, [isLoading, error, isAuthenticated, user, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Completing sign in...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <button 
            onClick={() => navigate("/login")} 
            className="bg-primary text-primary-foreground px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg">Redirecting...</p>
      </div>
    </div>
  )
}

export default Auth0Callback
