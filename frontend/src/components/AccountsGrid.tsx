import { useState } from 'react'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactionsByAccount } from '@/hooks/useTransactionsByAccount'
import { AccountCard } from './AccountCard'
import TransactionCard from './TransactionCard'
import type { Account } from '@/types/types'

export function AccountsGrid() {
  const { data: accountsData, isLoading: isLoadingAccounts, error: accountsError } = useAccounts()
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  
  const {
    transactions,
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = useTransactionsByAccount(selectedAccountId)

  if (isLoadingAccounts) {
    return (
      <div className="bg-white border border-gray-400 rounded-xl shadow-m p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 px-4">
          Your Accounts
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-slate-500">Loading accounts...</div>
        </div>
      </div>
    )
  }

  if (accountsError) {
    return (
      <div className="bg-white border border-red-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 px-4">
          Your Accounts
        </h2>
        <div className="px-4 text-red-600">
          Error loading accounts. Please check the backend service.
        </div>
      </div>
    )
  }

  const accounts = accountsData?.accounts || []

  if (!accounts.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 px-4">
          Your Accounts
        </h2>
        <div className="text-center py-8 text-slate-500">
          No accounts yet
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white border border-gray-400 rounded-xl shadow-lg overflow-hidden p-6">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Your Accounts
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {accounts.map((account: Account) => (
            <AccountCard
              key={account.id}
              account={account}
              isSelected={selectedAccountId === account.id}
              onClick={() => setSelectedAccountId(account.id)}
            />
          ))}
        </div>
      </div>

      {selectedAccountId && transactionsError && (
        <div className="bg-white border border-red-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 px-4">
            Transactions
          </h2>
          <div className="px-4 text-red-600">
            Error loading transactions. Please check the backend service.
          </div>
        </div>
      )}

      {selectedAccountId && !isLoadingTransactions && (
        <div className="mb-4">
          <TransactionCard transactions={transactions} />
        </div>
      )}
    </>
  )
}
