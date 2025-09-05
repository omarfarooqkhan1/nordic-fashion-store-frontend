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
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse z-10">
          <div className="w-8 h-8 border-2 border-muted-foreground/20 border-t-muted-foreground/60 rounded-full animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        style={{ 
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
        loading="lazy"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
      />
    </div>
  );
};

export default ProductImage;
