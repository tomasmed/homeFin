import React from 'react';
import { formatCurrency, formatWholeNumber } from '@/lib/transaction-aggregates';

export interface ProgressBarItem {
  category_id: string;
  category_name: string;
  color_hex: string;
  total: number;
  count: number;
  average: number;
}

interface ProgressBarListProps {
  items: ProgressBarItem[];
  totalExpenses: number;
}

export const ProgressBarList: React.FC<ProgressBarListProps> = ({ items, totalExpenses }) => {
  // Sort items by total descending
  const sortedItems = [...items].sort((a, b) => Math.abs(b.total) - Math.abs(a.total));

  return (
    <div className="flex flex-col gap-4 w-full">
      {sortedItems.map((item) => {
        const percentage = totalExpenses > 0 ? (Math.abs(item.total) / totalExpenses) * 100 : 0;
        
        return (
          <div key={item.category_id} className="flex flex-col w-full group">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
              <div className="flex items-center gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color_hex }}
                />
                <span className="font-semibold text-gray-800">{item.category_name}</span>
                <span className="text-[10px] text-gray-400 group-hover:text-gray-600 transition-colors">
                  ({formatWholeNumber(item.count)} txs)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{formatCurrency(item.total)}</span>
                <span className="text-[10px] sm:text-xs font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            </div>
            
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ 
                  backgroundColor: item.color_hex,
                  width: `${Math.min(percentage, 100)}%` 
                }}
              />
            </div>
            <div className="hidden group-hover:flex items-center justify-between text-[10px] text-gray-500 mt-1 pl-4">
              <span>Avg. transaction: {formatCurrency(item.average)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
