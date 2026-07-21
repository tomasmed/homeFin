import axios from 'axios';
import type { Account, Transaction } from '@/types/types';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function fetchAccounts(): Promise<{ accounts: Account[] }> {
  const response = await apiClient.get<{ accounts: Account[] }>('/v1/api/accounts');
  return response.data;
}

interface ApiTransaction extends Omit<Transaction, 'amount'> {
  amount: string;
}

export async function fetchAllTransactions(): Promise<Transaction[]> {
  const response = await apiClient.get<{ transactions: ApiTransaction[] }>('/v1/api/transactions');
  return (response.data.transactions || []).map(t => ({
    ...t,
    amount: parseFloat(t.amount),
  }));
}

export async function fetchTransactionsByAccount(accountId: string): Promise<Transaction[]> {
  const response = await apiClient.get<{ transactions: ApiTransaction[] }>(`/v1/api/transactions`, {
    params: { account_id: accountId }
  });
  return (response.data.transactions || []).map(t => ({
    ...t,
    amount: parseFloat(t.amount),
  }));
}

export default apiClient;
