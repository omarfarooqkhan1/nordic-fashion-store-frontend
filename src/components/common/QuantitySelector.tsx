import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  value: number;
  onChange: (newQuantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 999,
  disabled = false,
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: {
      button: 'h-6 w-6 p-0',
      text: 'text-sm w-6',
      icon: 'h-3 w-3'
    },
    md: {
      button: 'h-8 w-8 p-0',
      text: 'text-base w-8',
      icon: 'h-4 w-4'
    },
    lg: {
      button: 'h-10 w-10 p-0',
      text: 'text-lg w-10',
      icon: 'h-5 w-5'
    }
  };

  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDecrease}
        disabled={disabled || value <= min}
        className={cn('rounded-md', sizeClasses[size].button)}
      >
        <Minus className={sizeClasses[size].icon} />
      </Button>
      
      <span className={cn(
        'font-medium text-center text-foreground',
        sizeClasses[size].text
      )}>
        {value}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleIncrease}
        disabled={disabled || value >= max}
        className={cn('rounded-md', sizeClasses[size].button)}
      >
        <Plus className={sizeClasses[size].icon} />
      </Button>
    </div>
  );
};

export default QuantitySelector;
