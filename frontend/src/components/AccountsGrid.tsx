import { useState } from 'react'
import { Upload } from 'lucide-react'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactionsByAccount } from '@/hooks/useTransactionsByAccount'
import { AccountCard } from './AccountCard'
import TransactionCard from './TransactionCard'
import { StatementUploadModal } from './StatementUploadModal'
import { StatementFilter } from './StatementFilter'
import type { Account } from '@/types/types'

export function AccountsGrid() {
  const { data: accountsData, isLoading: isLoadingAccounts, error: accountsError } = useAccounts()
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [selectedStatementId, setSelectedStatementId] = useState<string | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  const {
    transactions,
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = useTransactionsByAccount(selectedAccountId, selectedStatementId)

  const handleAccountSelect = (accountId: string) => {
    if (selectedAccountId === accountId) {
      // Toggle off selection if clicked again
      setSelectedAccountId(null)
      setSelectedStatementId(null)
    } else {
      setSelectedAccountId(accountId)
      setSelectedStatementId(null)
    }
  }

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
      <div className="bg-white border border-gray-400 rounded-xl shadow-lg overflow-hidden p-6 mb-4">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Your Accounts
          </h2>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Statement</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {accounts.map((account: Account) => (
            <AccountCard
              key={account.id}
              account={account}
              isSelected={selectedAccountId === account.id}
              onClick={() => handleAccountSelect(account.id)}
            />
          ))}
        </div>
      </div>

      {selectedAccountId && (
        <div className="mb-4">
          <StatementFilter
            accountId={selectedAccountId}
            selectedStatementId={selectedStatementId}
            onSelectStatement={setSelectedStatementId}
          />
        </div>
      )}

      {selectedAccountId && transactionsError && (
        <div className="bg-white border border-red-200 rounded-xl shadow-sm p-6 mb-4">
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

      <StatementUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        defaultAccountId={selectedAccountId || undefined}
      />
    </>
  )
}
