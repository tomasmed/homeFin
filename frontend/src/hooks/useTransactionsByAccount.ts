import { useQuery } from '@tanstack/react-query';
import { fetchTransactionsByAccount } from '@/lib/api';
import type { UseTransactionsByAccountReturn } from '@/types/types';

export function useTransactionsByAccount(accountId: string | null | undefined): UseTransactionsByAccountReturn {
  console.log('[HOOK] useTransactionsByAccount called with accountId:', accountId);
  
  // Don't fetch if no account is selected
  const query = useQuery({
    queryKey: ['transactions-by-account', accountId],
    queryFn: () => fetchTransactionsByAccount(accountId!),
    enabled: !!accountId, // Only fetch when accountId exists
  });

  console.log('[HOOK] Query result:', {
    isLoading: query.isLoading,
    data: query.data,
    error: query.error
  });

  const transactions = query.data ?? [];

  return {
    transactions,
    isLoading: query.isLoading,
    error: query.error || null,
  };
}
