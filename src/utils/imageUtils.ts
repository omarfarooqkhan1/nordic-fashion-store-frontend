// Utility functions for image URL handling

/**
 * Get the backend base URL for images
 */
export const getBackendBaseUrl = (): string => {
  return import.meta.env.VITE_BACKEND_URL;
};

/**
 * Convert a relative image path to a full URL
 * @param imagePath - The relative path (e.g., '/storage/images/blogs/1.jpeg')
 * @returns Full URL (e.g., '/storage/images/blogs/1.jpeg')
 */
export const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;
  return getBackendBaseUrl() + imagePath;
};

/**
 * Get a placeholder image URL
 */
export const getPlaceholderImageUrl = (text: string = 'No Image'): string => {
  return `https://placehold.co/400x400/EFEFEF/AAAAAA?text=${encodeURIComponent(text)}`;
};
