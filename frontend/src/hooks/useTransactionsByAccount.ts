import { useQuery } from '@tanstack/react-query';
import { fetchTransactionsByAccount } from '@/lib/api';
import type { UseTransactionsByAccountReturn } from '@/types/types';

export function useTransactionsByAccount(
  accountId: string | null | undefined,
  statementId?: string | null
): UseTransactionsByAccountReturn {
  const query = useQuery({
    queryKey: ['transactions-by-account', accountId, statementId],
    queryFn: () => fetchTransactionsByAccount(accountId!, statementId),
    enabled: !!accountId, // Only fetch when accountId exists
  });

  const transactions = query.data ?? [];

  return {
    transactions,
    isLoading: query.isLoading,
    error: query.error || null,
  };
}
