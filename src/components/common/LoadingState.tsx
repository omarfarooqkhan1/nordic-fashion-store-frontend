import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message, 
  className = "p-8 text-center",
  size = 'md'
}) => {
  const { t } = useLanguage();
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
  
  return (
    <div className={`${className} flex flex-col items-center justify-center`}>
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-b-2 border-primary mx-auto mb-4`}></div>
      <p className="text-sm text-muted-foreground">
        {message || t('common.loading')}
      </p>
    </div>
  );
};

export default LoadingState;
