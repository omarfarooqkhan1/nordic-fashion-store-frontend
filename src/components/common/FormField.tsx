import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FormFieldProps {
  label: string;
  id: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  step?: string;
  min?: string;
  max?: string;
  options?: Array<{ value: string; label: string }>;
  className?: string;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  step,
  min,
  max,
  options,
  className = "space-y-2",
  error
}) => {
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className={error ? 'border-red-500' : ''}
          />
        );
      
      case 'select':
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return (
          <Input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            step={step}
            min={min}
            max={max}
            className={error ? 'border-red-500' : ''}
          />
        );
    }
  };

  return (
    <div className={className}>
      <Label htmlFor={id} className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
        {label}
      </Label>
      {renderInput()}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default FormField;
