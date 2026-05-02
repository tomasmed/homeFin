import { useQuery, useQueryClient, useMutation} from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { Category, CategoryFormData } from '@/types/types'

interface CategoriesResponse {
  categories: Category[]
}

export function useCategories() {
  const queryClient = useQueryClient();

  // FETCH query - existing functionality
  const categoriesQuery = useQuery<CategoriesResponse>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get<CategoriesResponse>('/v1/api/categories')
      return response.data
    },
  });

  // CREATE mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (formData: CategoryFormData) => {
      const response = await apiClient.post('/v1/api/categories', formData);
      return response.data as { category: Category };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: Error) => {
      console.error('Category creation failed:', error);
    },
  });

  // DELETE mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await apiClient.delete(`/v1/api/categories/${categoryId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: Error, categoryId: string) => {
      console.error(`Failed to delete category ${categoryId}:`, error);
    },
  });

  // Helper function for form submission
  const handleSubmit = async (formData: CategoryFormData): Promise<Category> => {
    const result = await createCategoryMutation.mutateAsync(formData);
    return result.category;
  };
  

  return {
    ...categoriesQuery,
    createMutation: createCategoryMutation,
    deleteMutation: deleteCategoryMutation.mutateAsync,
    isCreating: createCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
    handleSubmit,
  };
}
