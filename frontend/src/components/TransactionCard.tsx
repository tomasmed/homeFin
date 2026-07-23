import React, { useMemo } from 'react'
import { groupTransactionsByCategory, formatCurrency } from '@/lib/transaction-aggregates'
import { getCategoryPillStyles } from '@/lib/category-colors'
import type { Transaction } from '@/types/types'

const TransactionCard: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  
  // Aggregate transactions by category (always called, not inside conditionals)
  const groupedTransactions = useMemo(
    () => groupTransactionsByCategory(transactions),
    [transactions]
  )

    if (transactions.length === 0) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-4 py-4 bg-gray-50">
            <div className="font-semibold">Your transactions</div>
            <div className="text-xs text-gray-500">{transactions.length} Transactions</div>
          </div>
          <div className="py-12 px-8">
            <div className="text-3xl mb-2">💳</div>
            <div className="text-gray-700 font-medium">No transactions yet</div>
            <div className="text-gray-500 text-sm">Add your first transaction</div>
          </div>
          <div className="border-t border-gray-200 p-3 text-center text-sm text-gray-500">
            Click to see details
          </div>
        </div>
      )
    }
    
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-4 py-4">
          <div className="font-semibold text-sm mb-1">Your transactions</div>
          <div className="text-xs text-gray-500">{transactions.length} Transactions</div>
        </div>

      <div className="divide-y divide-gray-100">
        {transactions.map((t) => {
          const numAmount = typeof t.amount === 'number' ? t.amount : parseFloat(String(t.amount)) || 0;
          return (
            <div key={t.id} className="group flex justify-between items-center px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
              <div className="flex flex-col">
                <div className="font-medium text-gray-900 text-sm">{t.description}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {t.merchant_name && <span className="ml-1.5 text-xs text-gray-400">• {t.merchant_name}</span>}
                </div>
              </div>
              <div className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                {numAmount > 0 ? '+' : ''}{numAmount.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Summary Footer */}
      <div className="border-t border-gray-200 py-4 px-4">
        <div className="font-semibold text-xs text-gray-500 mb-3 uppercase tracking-wide">Category Summary</div>
        
        {groupedTransactions.length === 0 ? (
          <div className="text-gray-400 text-xs italic">No categories found</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {/* Row 1: Main categories - show up to 4 */}
            <div className="flex flex-wrap gap-2">
              {groupedTransactions.slice(0, 4).map((category, index) => (
                <div key={index} style={{ background: getCategoryPillStyles(category.category_name).textGradient }} className="rounded-full px-2 py-1 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color_hex }} />
                    <span className="text-xs font-medium ">{category.category_name}</span>
                  </div>
                  <div className="pl-2">
                    <div className="text-xs font-semibold ">{formatCurrency(category.total)}</div>
                    <div className="text-[10px] ">Avg: {formatCurrency(category.average)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionCard
