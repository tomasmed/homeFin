import React, { useMemo } from 'react';
import { groupTransactionsByCategory, formatCurrency, formatWholeNumber } from '@/lib/transaction-aggregates';
import { getCategoryPillStyles } from '@/lib/category-colors';

// Define component types
interface CategoriesCardProps {
  transactions?: Array<{
    id: string;
    date: string;
    amount: number;
    description: string;
    merchant_name?: string;
    category_name?: string;
    category_id?: string;
    account_id?: string;
  }>;
}

// Define Row components outside of render
interface CategoryPillProps {
  category: {
    category_name: string;
    category_id: string;
    color_hex: string;
    total: number;
    count: number;
    average: number;
  };
}

const CategoryPill: React.FC<CategoryPillProps> = ({ category }) => {
  return (
    <div
      className="flex flex-col justify-between h-22 bg-gradient-to-br rounded-lg shadow-sm p-3"
      style={{ background: getCategoryPillStyles(category.category_name).textGradient }}
      role="article"
      aria-label={`${category.category_name}: ${formatCurrency(category.total)} total, ${formatWholeNumber(category.count)} transactions`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: category.color_hex }}
          />
          <span className="text-xs font-semibold">{category.category_name}</span>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-sm font-semibold">{formatCurrency(category.total)}</div>
        <div className="text-[10px]">{formatWholeNumber(category.count)}</div>
      </div>
      <div className="text-sm font-semibold">Avg: {formatCurrency(category.average)}</div>
    </div>
  );
};

const CategoriesCard: React.FC<CategoriesCardProps> = ({ transactions }) => {
  const groupedTransactions = useMemo(
    () => groupTransactionsByCategory(transactions || []),
    [transactions]
  );
  if (transactions?.length === 0 || groupedTransactions.length === 0) {
    return (
      <div className="CategoriesCard bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="card-header">
          <div className="card-title">Your Transaction Breakdown</div>
          <div className="card-subtitle">Across ALL accounts</div>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-text">No categories found</div>
        </div>
      </div>
    );
  }

  const hasRow2 = groupedTransactions.length > 5;
  const row1Categories = groupedTransactions.slice(0, 5);
  const row2Categories = hasRow2 ? groupedTransactions.slice(5) : [];

  return (
    <div className="CategoriesCard bg-white border border-gray-400 rounded-xl shadow-sm overflow-hidden">
      <div className="card-header">
        <div className="card-title ml-4">Your Transaction Breakdown</div>
        <div className="card-subtitle ml-4">Across ALL accounts</div>
      </div>

      {groupedTransactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-text">No categories found</div>
          <div className="empty-state-description">Add your first transaction</div>
        </div>
      ) : (
        <>
          <div className="categories-grid categories-row categories-row-1 mx-4">
            {row1Categories.map((category, index) => (
              <CategoryPill
                key={`row1-${index}`}
                category={category}
              />
            ))}
          </div>
          {hasRow2 && (
            <div className="categories-grid categories-row categories-row-2 mx-4">
              {row2Categories.map((category, index) => (
                <CategoryPill
                  key={`row2-${index}`}
                  category={category}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CategoriesCard;
