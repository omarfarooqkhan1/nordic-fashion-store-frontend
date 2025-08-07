import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusType = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed' | 'failed';

interface StatusBadgeProps {
  status: StatusType;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showIcon = true,
  size = 'md',
  className
}) => {
  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          variant: 'secondary' as const,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock
        };
      case 'processing':
        return {
          label: 'Processing',
          variant: 'secondary' as const,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Package
        };
      case 'shipped':
        return {
          label: 'Shipped',
          variant: 'secondary' as const,
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Truck
        };
      case 'delivered':
      case 'completed':
        return {
          label: 'Delivered',
          variant: 'secondary' as const,
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        };
      case 'cancelled':
      case 'failed':
        return {
          label: 'Cancelled',
          variant: 'secondary' as const,
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle
        };
      default:
        return {
          label: 'Unknown',
          variant: 'secondary' as const,
          color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700',
          icon: AlertCircle
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5',
    lg: 'text-base px-3 py-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <Badge
      variant={config.variant}
      className={cn(
        config.color,
        sizeClasses[size],
        'border font-medium uppercase tracking-wide flex items-center gap-1.5',
        className
      )}
    >
      {showIcon && <IconComponent className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
