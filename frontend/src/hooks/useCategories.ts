import { useQuery } from '@tanstack/react-query'
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

  // Helper function for form submission
  const handleSubmit = async (formData: CategoryFormData): Promise<Category> => {
    const result = await createCategoryMutation.mutateAsync(formData);
    return result.category;
  };

  return {
    ...categoriesQuery,
    createMutation: createCategoryMutation.mutate,
    isCreating: createCategoryMutation.isPending,
    handleSubmit,
  };
}
