import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Container: React.FC<ContainerProps> = ({ 
  children, 
  className,
  size = 'lg',
  padding = 'lg'
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl', 
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-8',
    md: 'px-4 py-12',
    lg: 'px-4 py-16',
    xl: 'px-6 py-20'
  };

  return (
    <div className={cn(
      'container mx-auto',
      sizeClasses[size],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};

export default Container;
