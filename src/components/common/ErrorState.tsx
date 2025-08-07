import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface ErrorStateProps {
  title?: string;
  description?: string;
  backButton?: {
    text: string;
    path: string;
  };
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title, 
  description,
  backButton,
  className = "p-8 text-center" 
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  return (
    <div className={className}>
      <h2 className="text-xl font-bold mb-4">
        {title || t('error.notFound')}
      </h2>
      {description && (
        <p className="mb-4">{description}</p>
      )}
      {backButton && (
        <Button onClick={() => navigate(backButton.path)}>
          {backButton.text}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
