import type { Transaction } from '@/types/types';

export function groupTransactionsByCategory(transactions: Transaction[]) {
  const groups: { [key: string]: {
    category_id: string;
    category_name: string;
    color_hex: string;
    total: number;
    count: number;
    average: number;
  } } = {};

  for (const t of transactions) {
    const categoryId = t.category_id || 'uncategorized';
    const categoryName = t.category_name || 'Uncategorized';
    
    // Default color fallback - can be custom or gray
    const colorHex = '#6b7280'; 

    if (!groups[categoryId]) {
      groups[categoryId] = {
        category_id: categoryId,
        category_name: categoryName,
        color_hex: colorHex,
        total: 0,
        count: 0,
        average: 0,
      };
    }

    const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount;
    groups[categoryId].total += amount;
    groups[categoryId].count += 1;
  }

  return Object.values(groups).map(g => {
    g.average = g.count > 0 ? g.total / g.count : 0;
    return g;
  }).sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function formatWholeNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value);
}
