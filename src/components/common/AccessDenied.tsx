import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield } from 'lucide-react';

interface AccessDeniedProps {
  title?: string;
  description?: string;
  redirectPath?: string;
  redirectText?: string;
  className?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ 
  title = "Access Denied",
  description = "You don't have permission to access this page.",
  redirectPath = "/",
  redirectText = "Go Home",
  className = "p-8 text-center" 
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  return (
    <div className={className}>
      <div className="flex justify-center mb-4">
        <Shield className="h-16 w-16 text-red-500" />
      </div>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <p className="mb-4 text-muted-foreground">{description}</p>
      <Button onClick={() => navigate(redirectPath)}>
        {redirectText}
      </Button>
    </div>
  );
};

export default AccessDenied;
