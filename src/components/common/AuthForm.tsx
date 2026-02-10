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
  password: z.string().min(8, "Password must be at least 8 characters"),
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
    <Card className="w-full shadow-lg dark:shadow-2xl dark:shadow-black/20 dark:border-slate-700 dark:bg-slate-800/50 backdrop-blur-sm">
      <CardHeader className="text-center space-y-1 px-4 sm:px-6 pt-6 pb-4">
        <CardTitle className="text-xl sm:text-2xl font-bold text-foreground dark:text-white">{title}</CardTitle>
        <CardDescription className="text-sm sm:text-base text-muted-foreground dark:text-slate-300">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 sm:px-6 pb-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Custom fields before email/password */}
          {renderChildren && Array.isArray(renderChildren) && renderChildren[0]}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm sm:text-base font-medium text-foreground dark:text-slate-200">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className={`pl-10 h-10 sm:h-11 text-sm sm:text-base dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 ${
                  errors.email ? 'border-red-500 dark:border-red-400 focus-visible:ring-red-500 dark:focus-visible:ring-red-400' : ''
                }`}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs sm:text-sm text-red-500 dark:text-red-400">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm sm:text-base font-medium text-foreground dark:text-slate-200">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`pl-10 pr-10 h-10 sm:h-11 text-sm sm:text-base dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 ${
                  errors.password ? 'border-red-500 dark:border-red-400 focus-visible:ring-red-500 dark:focus-visible:ring-red-400' : ''
                }`}
                {...register("password")}
              />
              {showPasswordToggle && (
                <button
                  type="button"
                  className="absolute right-0 top-0 flex items-center justify-center h-full px-3 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-300"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}
            </div>
            {errors.password && (
              <p className="text-xs sm:text-sm text-red-500 dark:text-red-400">{errors.password.message}</p>
            )}
          </div>
          {/* Custom fields after password */}
          {renderChildren && Array.isArray(renderChildren) && renderChildren[1]}
          <Button 
            type="submit" 
            className="w-full h-10 sm:h-11 text-sm sm:text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 dark:text-primary-foreground" 
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : submitText}
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
