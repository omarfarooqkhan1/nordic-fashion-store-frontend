import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface UseMutationWithToastOptions<TData = any, TError = any, TVariables = any> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey?: string | string[];
  onSuccessMessage?: string;
  onErrorMessage?: string;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
}

export function useMutationWithToast<TData = any, TError = any, TVariables = any>({
  mutationFn,
  queryKey,
  onSuccessMessage = "Operation completed successfully",
  onErrorMessage = "Operation failed",
  onSuccess,
  onError
}: UseMutationWithToastOptions<TData, TError, TVariables>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      if (queryKey) {
        if (Array.isArray(queryKey)) {
          queryClient.invalidateQueries({ queryKey });
        } else {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        }
      }
      
      toast({
        title: "Success",
        description: onSuccessMessage,
        className: "bg-green-500 text-white"
      });
      
      onSuccess?.(data, variables);
    },
    onError: (error: any, variables) => {
      toast({
        title: "Error",
        description: error?.message || onErrorMessage,
        variant: "destructive"
      });
      
      onError?.(error, variables);
    }
  });
}

// Specialized hooks for common operations
export function useCreateMutation<TData = any, TVariables = any>(options: Omit<UseMutationWithToastOptions<TData, any, TVariables>, 'onSuccessMessage'> & { entityName: string }) {
  return useMutationWithToast({
    ...options,
    onSuccessMessage: `${options.entityName} created successfully`
  });
}

export function useUpdateMutation<TData = any, TVariables = any>(options: Omit<UseMutationWithToastOptions<TData, any, TVariables>, 'onSuccessMessage'> & { entityName: string }) {
  return useMutationWithToast({
    ...options,
    onSuccessMessage: `${options.entityName} updated successfully`
  });
}

export function useDeleteMutation<TData = any, TVariables = any>(options: Omit<UseMutationWithToastOptions<TData, any, TVariables>, 'onSuccessMessage'> & { entityName: string }) {
  return useMutationWithToast({
    ...options,
    onSuccessMessage: `${options.entityName} deleted successfully`
  });
}
