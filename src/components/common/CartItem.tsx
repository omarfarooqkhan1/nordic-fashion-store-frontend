import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import QuantitySelector from './QuantitySelector';
import PriceDisplay from './PriceDisplay';

interface CartItemProps {
  item: any; // Using any for now to handle the complex nested structure from the cart context
  onQuantityChange: (itemId: number, newQuantity: number) => void;
  onRemove: (itemId: number) => void;
  getItemPrice: (item: any) => number;
  disabled?: boolean;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onQuantityChange,
  onRemove,
  getItemPrice,
  disabled = false
}) => {
  const { t } = useLanguage();
  const { getCurrencySymbol } = useCurrency();

  const itemPrice = getItemPrice(item);
  const totalPrice = itemPrice * item.quantity;

  // Get product image - prioritize variant images, then fall back to product images
  const productImage = item.variant?.images?.[0]?.url || 
    item.variant?.product?.images?.[0]?.url ||
    `https://placehold.co/96x96/EFEFEF/AAAAAA?text=Product`;

  return (
    <Card className="bg-card border-border rounded-lg shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
          {/* Product Image */}
          <div className="w-24 h-24 bg-leather-200 dark:bg-leather-700 rounded-lg flex-shrink-0 overflow-hidden">
            {productImage && productImage !== 'https://placehold.co/96x96/EFEFEF/AAAAAA?text=Product' ? (
              <img 
                src={productImage}
                alt={item.variant?.product?.name || 'Product'} 
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => { 
                  e.currentTarget.src = 'https://placehold.co/96x96/EFEFEF/AAAAAA?text=No+Image'; 
                }}
                onLoad={() => {
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                <span className="text-2xl text-gray-400">📦</span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3 w-full">
            <div className="flex justify-between items-start w-full">
              <div className="flex-grow">
                {/* Product Name */}
                <h3 className="font-semibold text-lg text-foreground">
                  {item.variant?.product?.name || 'Product'}
                </h3>
                
                {/* Variant Information */}
                <div className="flex gap-2 mt-2">
                  {item.variant?.size && (
                    <Badge variant="outline" className="text-xs">
                      {t('product.size')}: {item.variant.size}
                    </Badge>
                  )}
                  {item.variant?.color && (
                    <Badge variant="outline" className="text-xs">
                      {t('product.color')}: {item.variant.color}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.id)}
                disabled={disabled}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 p-2 rounded-full"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex justify-between items-center w-full">
              {/* Quantity Selector */}
              <QuantitySelector
                value={item.quantity}
                onChange={(newQuantity) => onQuantityChange(item.id, newQuantity)}
                disabled={disabled}
                size="md"
              />

              {/* Price Information */}
              <div className="text-right">
                <PriceDisplay 
                  price={totalPrice}
                  size="lg"
                  className="mb-1"
                />
                <p className="text-sm text-muted-foreground">
                  {getCurrencySymbol()}{itemPrice.toFixed(2)} {t('common.each') || 'each'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartItem;
