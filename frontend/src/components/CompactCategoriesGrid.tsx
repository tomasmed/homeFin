import React from 'react';
import { formatCurrency, formatWholeNumber } from '@/lib/transaction-aggregates';
import { getCategoryPillStyles } from '@/lib/category-colors';

export interface GridCategoryItem {
  category_id: string;
  category_name: string;
  color_hex: string;
  total: number;
  count: number;
  average: number;
}

interface CompactCategoriesGridProps {
  items: GridCategoryItem[];
}

export const CompactCategoriesGrid: React.FC<CompactCategoriesGridProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
      {items.map((item) => {
        const style = getCategoryPillStyles(item.category_name);
        return (
          <div
            key={item.category_id}
            className="flex flex-col justify-between rounded-xl shadow-xs border border-gray-150 p-3 hover:shadow-md transition-all duration-200"
            style={{ 
              background: style.textGradient,
              borderColor: style.border,
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color_hex }}
              />
              <span className="text-xs font-bold text-gray-800 truncate max-w-[100px]" title={item.category_name}>
                {item.category_name}
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-gray-900 leading-none">
                {formatCurrency(item.total)}
              </span>
              <div className="flex items-center justify-between mt-1 text-[9px] text-gray-500 font-medium">
                <span>{formatWholeNumber(item.count)} txs</span>
                <span className="italic">avg: {formatCurrency(item.average)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
