import { useQuery } from '@tanstack/react-query';
import { fetchAccounts } from '@/lib/api';
import type { UseAccountsResult } from '@/types/types';

export function useAccounts(): UseAccountsResult {
  const query = useQuery({
    queryKey: ['accounts'] as const,
    queryFn: fetchAccounts,
    staleTime: 1000 * 60,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error || null,
  };
}
