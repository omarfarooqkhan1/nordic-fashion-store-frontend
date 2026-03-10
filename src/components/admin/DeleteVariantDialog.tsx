import React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"

interface DeleteVariantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  variant: {
    size: string
    color: string
    price: number
    stock?: number
    sku?: string
  } | null
  productName?: string
}

export const DeleteVariantDialog: React.FC<DeleteVariantDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  variant,
  productName,
}) => {
  if (!variant) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Variant</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this variant? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4 space-y-3 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border">
          {productName && (
            <div>
              <Label className="text-xs text-muted-foreground">Product</Label>
              <p className="font-medium text-foreground">{productName}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Size</Label>
              <p className="font-medium text-foreground">{variant.size}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Color</Label>
              <p className="font-medium text-foreground">{variant.color}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Price</Label>
              <p className="font-medium text-foreground">€{variant.price.toFixed(2)}</p>
            </div>
            {variant.stock !== undefined && (
              <div>
                <Label className="text-xs text-muted-foreground">Stock</Label>
                <p className="font-medium text-foreground">{variant.stock}</p>
              </div>
            )}
          </div>

          {variant.sku && (
            <div>
              <Label className="text-xs text-muted-foreground">SKU</Label>
              <p className="font-medium text-foreground text-sm">{variant.sku}</p>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Variant
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteVariantDialog
