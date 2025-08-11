"use client"

import type React from "react"

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState as useReactState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AuthForm } from "@/components/common/AuthForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import api from "@/api/axios";


const CustomerSignup: React.FC = () => {
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const { registerCustomer, loading } = useAuth();
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  // AuthForm will provide email and password
  const onSubmit = async (data: { email: string; password: string }) => {
    setError("");
    if (!name || name.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (data.password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    try {
      const response = await api.post("/customer/register", {
        name,
        email: data.email,
        password: data.password,
        password_confirmation: confirmPassword
      });
      const result = response.data;
      // Redirect to verify email page
      navigate("/verify-email", { state: { userId: result.user_id, email: data.email } });
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  const handleGoogleSignup = () => {
    loginWithRedirect({
      authorizationParams: {
        connection: "google-oauth2",
        screen_hint: "signup",
      },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        {/* Google Signup Button */}
        <Button onClick={handleGoogleSignup} variant="outline" className="w-full mb-4" type="button">
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign up with Google
        </Button>
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or sign up with email</span>
          </div>
        </div>
        <AuthForm
          title="Create Account"
          description="Join Nordic Fashion Store today"
          submitText="Sign Up"
          isLoading={loading}
          error={error}
          onSubmit={onSubmit}
        >
          {/* Full Name field (custom, above password) */}
          <div className="space-y-2 mb-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className="pl-10"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          </div>
          {/* Confirm Password field (custom, below password) */}
          <div className="space-y-2 mb-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="pl-10 pr-10"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-0 top-0 flex items-center justify-center h-full px-3 text-muted-foreground focus:outline-none"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                style={{ background: "none", border: "none" }}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="text-center text-sm mt-4">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </div>
        </AuthForm>
      </div>
    </div>
  );
}

export default CustomerSignup