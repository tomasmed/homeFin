import React, { useMemo, useState } from 'react';
import { groupTransactionsByCategory, formatCurrency } from '@/lib/transaction-aggregates';
import type { Transaction } from '@/types/types';
import { DonutChart } from './DonutChart';
import type { DonutSegment } from './DonutChart';
import { ProgressBarList } from './ProgressBarList';
import { CompactCategoriesGrid } from './CompactCategoriesGrid';

interface CategoriesCardProps {
  transactions?: Transaction[];
}

const CategoriesCard: React.FC<CategoriesCardProps> = ({ transactions }) => {
  const [viewMode, setViewMode] = useState<'chart' | 'grid'>('chart');

  // Group all transactions
  const groupedTransactions = useMemo(
    () => groupTransactionsByCategory(transactions || []),
    [transactions]
  );

  // Compute total income (amount > 0) and total spend (amount < 0)
  const { totalIncome, totalSpend } = useMemo(() => {
    let income = 0;
    let spend = 0;
    for (const t of transactions || []) {
      const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount;
      if (amount > 0) {
        income += amount;
      } else {
        spend += Math.abs(amount);
      }
    }
    return { totalIncome: income, totalSpend: spend };
  }, [transactions]);

  // Net Balance
  const netBalance = totalIncome - totalSpend;

  // Filter only spending categories (net total < 0) and convert to absolute values
  const expenseItems = useMemo(() => {
    return groupedTransactions
      .filter((item) => item.total < 0)
      .map((item) => ({
        ...item,
        total: Math.abs(item.total), // Show absolute value in list/grid
        average: Math.abs(item.average),
      }));
  }, [groupedTransactions]);

  // Donut chart segments: spending categories as parts of the income whole
  const donutSegments: DonutSegment[] = useMemo(() => {
    const segments: DonutSegment[] = expenseItems.map((item) => ({
      id: item.category_id,
      name: item.category_name,
      value: item.total,
      color: item.color_hex,
    }));

    // If income exceeds spend, add a "Savings / Leftover" segment to complete the whole
    if (totalIncome > totalSpend) {
      segments.push({
        id: 'savings',
        name: 'Savings / Leftover',
        value: totalIncome - totalSpend,
        color: '#10b981', // Emerald green
      });
    }

    return segments;
  }, [expenseItems, totalIncome, totalSpend]);

  // Donut chart total (the whole against which segments are compared)
  const donutTotal = Math.max(totalIncome, totalSpend);

  if (transactions?.length === 0 || groupedTransactions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="card-header border-b border-gray-100 px-6 py-4 bg-gray-50 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Transaction Breakdown</h2>
            <p className="text-xs text-gray-500 mt-0.5">Across all accounts</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <span className="text-4xl mb-3">📊</span>
          <h3 className="font-semibold text-gray-700">No categories found</h3>
          <p className="text-xs text-gray-400 mt-1">Add some transactions to see your financial breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden transition-all duration-200 flex flex-col justify-between">
      {/* Header with toggle options */}
      <div className="border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50/50">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">Transaction Breakdown</h2>
          <p className="text-xs text-gray-500 mt-0.5">Across all accounts</p>
        </div>
        
        {/* Toggle tabs switch */}
        <div className="flex bg-gray-100 p-0.5 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 flex items-center gap-1.5 ${
              viewMode === 'chart'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>🍩</span> Chart
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 flex items-center gap-1.5 ${
              viewMode === 'grid'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>📋</span> Grid
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {viewMode === 'chart' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Donut Chart */}
            <div className="md:col-span-5 flex justify-center border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6">
              <DonutChart data={donutSegments} total={donutTotal} />
            </div>
            
            {/* Progress Bars */}
            <div className="md:col-span-7 w-full animate-fade-in">
              <ProgressBarList items={expenseItems} totalExpenses={totalIncome} />
            </div>
          </div>
        ) : (
          <div className="w-full">
            <CompactCategoriesGrid items={expenseItems} />
          </div>
        )}
      </div>

      {/* Bottom Summary Footer */}
      <div className="border-t border-gray-150 bg-gray-50/50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Income Column */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Total Income</span>
          <span className="text-sm sm:text-base font-extrabold text-emerald-600 mt-0.5">
            +{formatCurrency(totalIncome)}
          </span>
        </div>

        {/* Separator for desktop */}
        <div className="hidden sm:block w-px h-8 bg-gray-200" />

        {/* Spend Column */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Total Spend</span>
          <span className="text-sm sm:text-base font-extrabold text-rose-600 mt-0.5">
            -{formatCurrency(totalSpend)}
          </span>
        </div>

        {/* Separator for desktop */}
        <div className="hidden sm:block w-px h-8 bg-gray-200" />

        {/* Net Balance Column */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Net Balance</span>
            <div className={`mt-1 px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              netBalance >= 0 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              <span className="text-[10px]">{netBalance >= 0 ? '▲' : '▼'}</span>
              <span>{netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesCard;
