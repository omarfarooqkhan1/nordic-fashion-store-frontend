import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Action {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  icon?: React.ReactNode;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backButton?: {
    path: string;
    label?: string;
  };
  actions?: Action[];
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  backButton,
  actions,
  className = "flex items-center justify-between mb-8"
}) => {
  const navigate = useNavigate();

  return (
    <div className={className}>
      <div className="flex items-center gap-4">
        {backButton && (
          <Button 
            variant="ghost" 
            onClick={() => navigate(backButton.path)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {backButton.label || 'Back'}
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      
      {actions && actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              onClick={action.onClick}
              className="flex items-center gap-2"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
