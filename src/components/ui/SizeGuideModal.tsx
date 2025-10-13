import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Ruler } from 'lucide-react';
import ProductImage from '@/components/ui/ProductImage';

interface SizeGuideModalProps {
  sizeGuideImage: string;
  productName: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  sizeGuideImage,
  productName,
  trigger,
  open,
  onOpenChange,
}) => {
  if (!sizeGuideImage) {
    return null;
  }

  // Prefix the image URL with the backend URL if it's not already a full URL
  // Handle both cases where sizeGuideImage might already include the domain
  let imageUrl = sizeGuideImage;
  try {
    if (!sizeGuideImage.startsWith('http://') && !sizeGuideImage.startsWith('https://')) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      // Ensure we don't double up on slashes
      if (sizeGuideImage.startsWith('/')) {
        imageUrl = `${backendUrl}${sizeGuideImage}`;
      } else {
        imageUrl = `${backendUrl}/${sizeGuideImage}`;
      }
    }
  } catch (error) {
    console.error('[SizeGuideModal] Error resolving size guide image URL:', error);
    imageUrl = sizeGuideImage; // Fallback to original
  }

  const defaultTrigger = (
    <Button 
      variant="outline" 
      className="flex items-center gap-2 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white hover:border-primary hover:text-primary transition-all duration-200"
    >
      <Ruler className="h-4 w-4" />
      Size Guide
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Ruler className="h-5 w-5" />
            Size Guide - {productName}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex justify-center">
          <div className="max-w-full">
            <ProductImage
              src={imageUrl}
              alt={`Size guide for ${productName}`}
              className="w-full h-auto rounded-lg shadow-lg"
              fallbackClassName="w-full h-auto rounded-lg shadow-lg opacity-50"
            />
          </div>
        </div>
        <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
          <h4 className="font-medium mb-2">Size Guide Tips:</h4>
          <ul className="text-sm text-gray-600 dark:text-slate-300 space-y-1">
            <li>• Measure yourself wearing minimal clothing for best accuracy</li>
            <li>• Use a flexible measuring tape and keep it parallel to the ground</li>
            <li>• For chest measurement, measure around the fullest part</li>
            <li>• If you're between sizes, we recommend sizing up for comfort</li>
            <li>• Contact us if you need help choosing the right size</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};