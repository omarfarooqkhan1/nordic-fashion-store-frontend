import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

interface AuthFormProps {
  title: string;
  description: string;
  submitText: string;
  isLoading: boolean;
  error?: string;
  onSubmit: (data: AuthFormData) => void;
  children?: React.ReactNode;
  showPasswordToggle?: boolean;
}


export const AuthForm: React.FC<AuthFormProps> = ({
  title,
  description,
  submitText,
  isLoading,
  error,
  onSubmit,
  children,
  showPasswordToggle = true
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  // Allow children to be a function for custom field injection
  const renderChildren = typeof children === 'function' ? children({ register, errors }) : children;

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Custom fields before email/password */}
          {renderChildren && Array.isArray(renderChildren) && renderChildren[0]}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pl-10 pr-10"
                {...register("password")}
              />
              {showPasswordToggle && (
                <button
                  type="button"
                  className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              )}
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          {/* Custom fields after password */}
          {renderChildren && Array.isArray(renderChildren) && renderChildren[1]}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : submitText}
          </Button>
        </form>
        {/* Custom content below form */}
        {renderChildren && !Array.isArray(renderChildren) && renderChildren}
        {renderChildren && Array.isArray(renderChildren) && renderChildren[2]}
      </CardContent>
    </Card>
  );
};

export default AuthForm;
