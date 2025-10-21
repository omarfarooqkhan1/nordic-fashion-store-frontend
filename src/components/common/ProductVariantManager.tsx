import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { FormField, ConfirmationDialog } from '@/components/common';

interface Variant {
  id: number;
  size: string;
  color: string;
  price: string | number;
}

interface NewVariant {
  size: string;
  color: string;
  price: string;
}

interface ProductVariantManagerProps {
  variants: Variant[];
  newVariant: NewVariant;
  onNewVariantChange: (field: keyof NewVariant, value: string) => void;
  onAddVariant: () => void;
  onDeleteVariant: (variantId: number) => void;
  isAdding?: boolean;
  isDeleting?: boolean;
}

export const ProductVariantManager: React.FC<ProductVariantManagerProps> = ({
  variants,
  newVariant,
  onNewVariantChange,
  onAddVariant,
  onDeleteVariant,
  isAdding = false,
  isDeleting = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Variants</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Variant */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Add New Variant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Size"
                id="size"
                value={newVariant.size}
                onChange={(value) => onNewVariantChange('size', value)}
                placeholder="XS, S, M, L, XL"
              />

              <FormField
                label="Color"
                id="color"
                value={newVariant.color}
                onChange={(value) => onNewVariantChange('color', value)}
                placeholder="Red, Blue, etc."
              />

              <FormField
                label="Price (€)"
                id="price"
                type="number"
                step="0.01"
                value={newVariant.price}
                onChange={(value) => onNewVariantChange('price', value)}
                placeholder="0.00"
              />
            </div>
            <Button 
              onClick={onAddVariant}
              disabled={isAdding}
              className="mt-4 bg-green-500 hover:bg-green-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isAdding ? 'Adding...' : 'Add Variant'}
            </Button>
          </CardContent>
        </Card>

        {/* Existing Variants */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Existing Variants ({variants.length})</h3>
          {variants.length === 0 ? (
            <p className="text-muted-foreground">No variants available. Add your first variant above.</p>
          ) : (
            <div className="grid gap-4">
              {variants.map((variant) => (
                <Card key={variant.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                        <div>
                          <Label className="text-sm text-muted-foreground">Size</Label>
                          <p className="font-medium">{variant.size}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Color</Label>
                          <p className="font-medium">{variant.color}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Price</Label>
                          <p className="font-medium">€{variant.price}</p>
                        </div>
                      </div>
                      <ConfirmationDialog
                        trigger={
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                        title="Delete Variant"
                        description={`Are you sure you want to delete this variant (${variant.size} - ${variant.color})? This action cannot be undone.`}
                        confirmText="Delete"
                        onConfirm={() => onDeleteVariant(variant.id)}
                        variant="destructive"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductVariantManager;
