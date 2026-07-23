import axios from 'axios';
import type { Account, Transaction } from '@/types/types';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface StatementItem {
  id: string;
  account_id: string;
  filename: string;
  upload_date: string;
  period_start_date?: string | null;
  period_end_date?: string | null;
  transaction_count: number;
}

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

export async function fetchTransactionsByAccount(
  accountId: string | null,
  statementId?: string | null
): Promise<Transaction[]> {
  const params: Record<string, string> = {};
  if (accountId) params.account_id = accountId;
  if (statementId) params.statement_id = statementId;

  const response = await apiClient.get<{ transactions: ApiTransaction[] }>('/v1/api/transactions', {
    params,
  });
  return (response.data.transactions || []).map(t => ({
    ...t,
    amount: parseFloat(t.amount),
  }));
}

export async function fetchStatements(accountId?: string): Promise<{ statements: StatementItem[] }> {
  const response = await apiClient.get<{ statements: StatementItem[] }>('/v1/api/statements', {
    params: accountId ? { account_id: accountId } : {},
  });
  return response.data;
}

export async function uploadStatement({
  accountId,
  file,
}: {
  accountId: string;
  file: File;
}): Promise<{ statement: StatementItem; created_transactions_count: number }> {
  const formData = new FormData();
  formData.append('account_id', accountId);
  formData.append('file', file);

  const response = await apiClient.post<{
    statement: StatementItem;
    created_transactions_count: number;
  }>('/v1/api/statements/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function deleteStatement(statementId: string): Promise<void> {
  await apiClient.delete(`/v1/api/statements/${statementId}`);
}

export default apiClient;
