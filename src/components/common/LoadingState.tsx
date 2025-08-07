import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message, 
  className = "p-8 text-center text-lg" 
}) => {
  const { t } = useLanguage();
  
  return (
    <div className={className}>
      {message || t('common.loading')}
    </div>
  );
};

export default LoadingState;
