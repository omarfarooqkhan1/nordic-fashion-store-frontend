import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Trash2, ChevronDown, ChevronUp } from "lucide-react"

interface ExistingVariantsListProps {
  variants: any[]
  onEdit: (variant: any) => void
  onDelete: (variantId: number) => void
}

export const ExistingVariantsList: React.FC<ExistingVariantsListProps> = ({
  variants,
  onEdit,
  onDelete,
}) => {
  const [collapsedVariants, setCollapsedVariants] = useState<Set<number>>(new Set())

  const toggleCollapse = (variantId: number) => {
    setCollapsedVariants(prev => {
      const next = new Set(prev)
      if (next.has(variantId)) {
        next.delete(variantId)
      } else {
        next.add(variantId)
      }
      return next
    })
  }

  if (variants.length === 0) {
    return (
      <p className="text-muted-foreground">
        No variants added yet. Add your first variant above.
      </p>
    )
  }

  return (
    <div className="grid gap-4">
      {variants.map((variant) => {
        const isCollapsed = collapsedVariants.has(variant.id)
        
        return (
          <Card 
            key={variant.id} 
            className="border-l-4 border-l-blue-500 dark:border-l-blue-600 bg-card"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCollapse(variant.id)}
                    className="p-1 h-8 w-8"
                  >
                    {isCollapsed ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="font-medium text-foreground">
                    {variant.size} - {variant.color}
                    <span className="text-sm text-muted-foreground ml-2">
                      €{variant.price !== undefined && variant.price !== null && !isNaN(Number(variant.price)) ?
                        Number(variant.price).toFixed(2) : 'Invalid'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(variant)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(variant.id)}
                    className="hover:bg-destructive/90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {!isCollapsed && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <Label className="text-sm text-muted-foreground">Size</Label>
                      <p className="font-medium text-foreground">{variant.size}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Color</Label>
                      <p className="font-medium text-foreground">{variant.color}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Price</Label>
                      <p className="font-medium text-foreground">
                        €{variant.price !== undefined && variant.price !== null && !isNaN(Number(variant.price)) ?
                          Number(variant.price).toFixed(2) : 'Invalid'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Show image counts */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">Main Images</Label>
                      <p className="font-medium">{variant.main_images?.length || 0}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Styling Images</Label>
                      <p className="font-medium">{variant.styling_images?.length || 0}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Detailed Images</Label>
                      <p className="font-medium">{variant.detailed_images?.length || 0}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Mobile Images</Label>
                      <p className="font-medium">{variant.mobile_detailed_images?.length || 0}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default ExistingVariantsList
