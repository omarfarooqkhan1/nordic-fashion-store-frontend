import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionButton?: {
    text: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📦',
  title,
  description,
  actionButton,
  className
}) => {
  return (
    <div className={cn('text-center space-y-6', className)}>
      <div className="max-w-md mx-auto space-y-4">
        <div className="aspect-square bg-leather-200 dark:bg-leather-700 rounded-lg flex items-center justify-center max-w-32 mx-auto">
          <span className="text-6xl">{icon}</span>
        </div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
        {actionButton && (
          <Button 
            onClick={actionButton.onClick}
            variant={actionButton.variant || 'default'}
            className="bg-gold-500 hover:bg-gold-600 text-leather-900 font-semibold border border-gold-400 hover:border-gold-500"
          >
            {actionButton.text}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
