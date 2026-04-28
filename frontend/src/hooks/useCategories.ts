import { useState, useEffect } from 'react'
import apiClient from '@/lib/api'
import type { Category } from '@/types/types'

interface CategoriesResponse {
  categories: Category[]
}

interface UseCategoriesReturn {
  data: CategoriesResponse | undefined
  isLoading: boolean
  error: Error | null
}

export function useCategories() {
  const [data, setData] = useState<CategoriesResponse | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get<CategoriesResponse>('/v1/api/categories')
        setData(response.data)
        setError(null)
      } catch (err) {
        if (err instanceof Error) {
          setError(err)
        } else {
          setError(new Error('Failed to fetch categories'))
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { data, isLoading, error } as UseCategoriesReturn
}
