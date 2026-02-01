/**
 * Utility functions for handling image URLs
 */

/**
 * Get the backend base URL from environment variables
 */
const getBackendBaseUrl = (): string => {
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
};

/**
 * Convert a relative or absolute image URL to a full URL
 * @param imageUrl - The image URL (can be relative or absolute)
 * @returns Full image URL
 */
export const getFullImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) {
    return '';
  }

  const backendUrl = getBackendBaseUrl();

  // If it's already an absolute URL with the current backend URL, return as is
  if (imageUrl.startsWith(backendUrl)) {
    return imageUrl;
  }

  // If it's an absolute URL with a different domain (like old backend.nordflex.store),
  // extract the path and use current backend URL
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    try {
      const url = new URL(imageUrl);
      return `${backendUrl}${url.pathname}`;
    } catch (error) {
      return '';
    }
  }

  // If it's a relative URL, prepend the backend base URL
  const normalizedUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  return `${backendUrl}${normalizedUrl}`;
};

/**
 * Get a placeholder image URL for fallback
 * @param text - Text to display in placeholder
 * @param width - Image width (default: 200)
 * @param height - Image height (default: 200)
 * @returns Placeholder image URL
 */
export const getPlaceholderImageUrl = (
  text: string = 'No Image', 
  width: number = 200, 
  height: number = 200
): string => {
  return `https://placehold.co/${width}x${height}/EFEFEF/AAAAAA?text=${encodeURIComponent(text)}`;
};

/**
 * Handle image error by setting a placeholder
 * @param event - Image error event
 * @param fallbackText - Text for placeholder
 */
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement>, 
  fallbackText: string = 'Image Not Found'
): void => {
  const img = event.currentTarget;
  img.src = getPlaceholderImageUrl(fallbackText, 200, 200);
};