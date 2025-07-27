import React, { useState } from 'react';

interface ProductImageProps {
  src?: string;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  showPlaceholder?: boolean;
}

const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt = 'Product image',
  className = 'w-full h-full object-cover',
  fallbackClassName = 'w-full h-full object-cover opacity-50',
  showPlaceholder = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // If no src provided or error occurred, show placeholder
  if (!src || hasError) {
    if (!showPlaceholder) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <span className="text-4xl text-muted-foreground">📷</span>
        </div>
      );
    }
    
    return (
      <img 
        src="/placeholder.svg" 
        alt="No image available" 
        className={fallbackClassName}
      />
    );
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <span className="text-2xl text-muted-foreground">⏳</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </>
  );
};

export default ProductImage;
