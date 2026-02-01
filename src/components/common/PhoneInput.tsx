import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { COUNTRIES, getPhoneCodeByCountryCode } from '@/utils/countries';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  defaultCountry?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "Phone number",
  disabled = false,
  className = "",
  defaultCountry = "FI"
}) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(
    getPhoneCodeByCountryCode(defaultCountry)
  );
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  // Update country code when defaultCountry changes (one-way: country -> phone code)
  // Only update if the user hasn't manually selected a different country code
  useEffect(() => {
    const newCountryCode = getPhoneCodeByCountryCode(defaultCountry);
    // Only update if this is the initial load or if the country actually changed
    if (newCountryCode !== selectedCountryCode) {
      setSelectedCountryCode(newCountryCode);
    }
  }, [defaultCountry]); // Remove selectedCountryCode from dependencies to avoid conflicts

  // Parse existing value on mount and when value changes externally
  useEffect(() => {
    if (value) {
      // Try to extract country code and phone number
      const phoneRegex = /^(\+\d{1,4})\s*(.*)$/;
      const match = value.match(phoneRegex);
      
      if (match) {
        setSelectedCountryCode(match[1]);
        setPhoneNumber(match[2]);
      } else {
        setPhoneNumber(value);
      }
    } else {
      // If value is empty, reset phone number but keep country code
      setPhoneNumber('');
    }
  }, [value]);

  // Update parent when country code or phone number changes (but not during country change handling)
  useEffect(() => {
    const fullPhoneNumber = phoneNumber ? `${selectedCountryCode} ${phoneNumber}` : '';
    onChange(fullPhoneNumber);
  }, [selectedCountryCode, phoneNumber, onChange]);

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRIES.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountryCode(country.phoneCode);
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Remove any non-digit characters except spaces and dashes
    const cleanedValue = inputValue.replace(/[^\d\s-]/g, '');
    setPhoneNumber(cleanedValue);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Select
        value={COUNTRIES.find(c => c.phoneCode === selectedCountryCode)?.code || 'FI'}
        onValueChange={handleCountryChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[120px] min-w-[120px] h-[40px] px-3">
          <SelectValue>
            <div className="flex items-center gap-2 w-full">
              <span className="text-sm font-mono">
                {selectedCountryCode}
              </span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-w-[280px] max-h-[200px]">
          {COUNTRIES.map((country) => (
            <SelectItem key={country.code} value={country.code} className="cursor-pointer">
              <div className="flex items-center gap-2 min-w-0 w-full">
                <span className="text-xs flex-shrink-0 font-mono">{country.code}</span>
                <span className="text-sm flex-shrink-0 font-mono">{country.phoneCode}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
      />
    </div>
  );
};