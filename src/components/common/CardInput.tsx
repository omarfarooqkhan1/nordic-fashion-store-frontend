import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Calendar, Shield } from 'lucide-react';
import { 
  formatCardNumber, 
  formatExpiryDate, 
  formatCVV, 
  validateCardNumber, 
  validateExpiryDate, 
  validateCVV,
  getCardType 
} from '@/utils/cardFormatting';

interface CardInputProps {
  label: string;
  id: string;
  type: 'cardNumber' | 'expiry' | 'cvv' | 'text';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export const CardInput: React.FC<CardInputProps> = ({
  label,
  id,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = "space-y-2"
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    let formattedValue = inputValue;

    switch (type) {
      case 'cardNumber':
        formattedValue = formatCardNumber(inputValue);
        break;
      case 'expiry':
        formattedValue = formatExpiryDate(inputValue);
        break;
      case 'cvv':
        formattedValue = formatCVV(inputValue);
        break;
      default:
        formattedValue = inputValue;
    }

    onChange(formattedValue);
  };

  const getIcon = () => {
    switch (type) {
      case 'cardNumber':
        const cardType = getCardType(value);
        return <CreditCard className={`h-4 w-4 ${cardType === 'visa' ? 'text-blue-600' : cardType === 'mastercard' ? 'text-red-500' : 'text-gray-400'}`} />;
      case 'expiry':
        return <Calendar className="h-4 w-4 text-gray-400" />;
      case 'cvv':
        return <Shield className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getValidationState = () => {
    if (!value) return null;
    
    switch (type) {
      case 'cardNumber':
        return validateCardNumber(value) ? 'valid' : 'invalid';
      case 'expiry':
        return validateExpiryDate(value) ? 'valid' : 'invalid';
      case 'cvv':
        return validateCVV(value) ? 'valid' : 'invalid';
      default:
        return null;
    }
  };

  const validationState = getValidationState();
  const icon = getIcon();

  return (
    <div className={className}>
      <Label htmlFor={id} className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
        {label}
      </Label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-3 z-10">
            {icon}
          </div>
        )}
        <Input
          id={id}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          className={`
            ${icon ? 'pl-10' : ''} 
            ${error || validationState === 'invalid' ? 'border-red-500' : ''} 
            ${validationState === 'valid' ? 'border-green-500' : ''}
          `}
          autoComplete={
            type === 'cardNumber' ? 'cc-number' :
            type === 'expiry' ? 'cc-exp' :
            type === 'cvv' ? 'cc-csc' : 'off'
          }
        />
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {type === 'cardNumber' && value && (
        <p className="text-xs text-gray-500">
          {getCardType(value) !== 'unknown' && `${getCardType(value).toUpperCase()} detected`}
        </p>
      )}
    </div>
  );
};

export default CardInput;
