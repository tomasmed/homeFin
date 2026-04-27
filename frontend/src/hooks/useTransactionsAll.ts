import { useQuery } from '@tanstack/react-query';
import { fetchAllTransactions } from '@/lib/api';
import type {Transaction} from '@/types/types';

export function useTransactionsAll() {
  const { data, isLoading, error } = useQuery<Transaction[]>({
    queryKey: ['all-transactions'],
    queryFn: fetchAllTransactions,
  });

  return {
    transactions: data || [],
    isLoading,
    error,
  };
}
