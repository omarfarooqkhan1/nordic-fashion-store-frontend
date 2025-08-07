// Card formatting utilities
export const formatCardNumber = (value: string): string => {
  // Remove all non-digits
  const digitsOnly = value.replace(/\D/g, '');
  
  // Add spaces every 4 digits
  const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
  
  // Limit to 19 characters (16 digits + 3 spaces)
  return formatted.substring(0, 19);
};

export const formatExpiryDate = (value: string): string => {
  // Remove all non-digits
  const digitsOnly = value.replace(/\D/g, '');
  
  // Add slash after first 2 digits
  if (digitsOnly.length >= 2) {
    return `${digitsOnly.substring(0, 2)}/${digitsOnly.substring(2, 4)}`;
  }
  
  return digitsOnly;
};

export const formatCVV = (value: string): string => {
  // Remove all non-digits and limit to 4 characters
  return value.replace(/\D/g, '').substring(0, 4);
};

// Validation utilities
export const validateCardNumber = (cardNumber: string): boolean => {
  // Remove spaces and check if it's 16 digits
  const digitsOnly = cardNumber.replace(/\s/g, '');
  return digitsOnly.length === 16 && /^\d{16}$/.test(digitsOnly);
};

export const validateExpiryDate = (expiryDate: string): boolean => {
  const match = expiryDate.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000; // Convert YY to YYYY
  
  if (month < 1 || month > 12) return false;
  
  const now = new Date();
  const expiry = new Date(year, month - 1); // month is 0-indexed
  
  return expiry > now;
};

export const validateCVV = (cvv: string): boolean => {
  return cvv.length >= 3 && cvv.length <= 4 && /^\d+$/.test(cvv);
};

// Get card type from card number
export const getCardType = (cardNumber: string): string => {
  const number = cardNumber.replace(/\s/g, '');
  
  if (number.startsWith('4')) return 'visa';
  if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
  if (number.startsWith('3')) return 'amex';
  if (number.startsWith('6')) return 'discover';
  
  return 'unknown';
};
