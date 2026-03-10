import React, { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { VariantForm } from "./VariantForm"
import { useToast } from "@/hooks/use-toast"

interface MultiVariantFormProps {
  variants: any[]
  onVariantsChange: (variants: any[]) => void
  product?: any
  token?: string | null
  isNewProduct?: boolean
}

export const MultiVariantForm: React.FC<MultiVariantFormProps> = ({
  variants,
  onVariantsChange,
  product,
  token,
  isNewProduct = false,
}) => {
  const { toast } = useToast()
  const [variantForms, setVariantForms] = useState<any[]>(
    isNewProduct ? [{ id: Date.now() }] : []
  )
  const [collapsedForms, setCollapsedForms] = useState<Set<number>>(new Set())

  const handleAddVariant = useCallback(() => {
    const newFormId = Date.now() + Math.random()
    setVariantForms(prev => [...prev, { id: newFormId }])
    // Keep new forms expanded by default
  }, [])

  const handleRemoveVariant = useCallback((formId: number) => {
    setVariantForms(prev => prev.filter(f => f.id !== formId))
    onVariantsChange(variants.filter(v => v.id !== formId))
    setCollapsedForms(prev => {
      const next = new Set(prev)
      next.delete(formId)
      return next
    })
  }, [variants, onVariantsChange])

  const toggleCollapse = useCallback((formId: number) => {
    setCollapsedForms(prev => {
      const next = new Set(prev)
      if (next.has(formId)) {
        next.delete(formId)
      } else {
        next.add(formId)
      }
      return next
    })
  }, [])

  const handleVariantSave = useCallback((formId: number, variantData: any) => {
    // Check for duplicate variants
    const isDuplicate = variants.some(
      (v) =>
        v.id !== formId &&
        v.size?.toLowerCase() === variantData.size?.toLowerCase() &&
        v.color?.toLowerCase() === variantData.color?.toLowerCase()
    )

    if (isDuplicate) {
      toast({
        title: "Duplicate Variant",
        description: `A variant with size "${variantData.size}" and color "${variantData.color}" already exists.`,
        variant: "destructive",
      })
      return
    }

    const existing = variants.findIndex(v => v.id === formId)
    if (existing >= 0) {
      const updated = [...variants]
      updated[existing] = { ...variantData, id: formId }
      onVariantsChange(updated)
    } else {
      onVariantsChange([...variants, { ...variantData, id: formId }])
    }
  }, [variants, onVariantsChange, toast])

  if (!isNewProduct && variantForms.length === 0) {
    return null
  }

  return (
    <div className="space-y-4 mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
      <h3 className="font-semibold text-lg">
        {isNewProduct ? "Add Product Variants" : "Manage Variants"}
      </h3>

      {variantForms.map((form, index) => {
        const isCollapsed = collapsedForms.has(form.id)
        const variantData = variants.find(v => v.id === form.id)
        
        return (
          <div
            key={form.id}
            className="space-y-4 p-4 bg-white dark:bg-slate-900 rounded-lg border"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 flex-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCollapse(form.id)}
                  className="p-1 h-8 w-8"
                >
                  {isCollapsed ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </Button>
                <h4 className="font-medium">
                  Variant {index + 1}
                  {variantData?.size && variantData?.color && (
                    <span className="text-sm text-muted-foreground ml-2">
                      ({variantData.size} - {variantData.color})
                    </span>
                  )}
                </h4>
              </div>
              {variantForms.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveVariant(form.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>

            {!isCollapsed && (
              <VariantForm
                variant={variantData}
                onSave={(variantData) => handleVariantSave(form.id, variantData)}
                onCancel={() => {
                  // Don't cancel, just keep the form open
                }}
                isEditing={false}
                token={token}
                productId={product?.id}
                isNewProduct={isNewProduct}
              />
            )}
          </div>
        )
      })}

      {/* Add New Variant Button */}
      {isNewProduct && (
        <Button
          type="button"
          onClick={handleAddVariant}
          className="bg-green-600 hover:bg-green-700 text-white w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Variant
        </Button>
      )}
    </div>
  )
}

export default MultiVariantForm
