import { useState } from 'react';
import { Upload } from 'lucide-react';
import { AccountsGrid } from '@/components/AccountsGrid';
import CategoriesCard from '@/components/CategoriesCard';
import CategoriesListView from '@/components/CategoriesListView/CategoriesListView';
import { StatementUploadModal } from '@/components/StatementUploadModal';

import { useTransactionsAll } from '@/hooks/useTransactionsAll';
import { useCategories } from '@/hooks/useCategories';

function App() {
  const { transactions } = useTransactionsAll();
  const { data } = useCategories();
  const [isHeaderUploadOpen, setIsHeaderUploadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Home Finances</h1>
            <p className="text-sm text-gray-600">Personal Finance Dashboard & Statement Import</p>
          </div>
          <button
            onClick={() => setIsHeaderUploadOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 transition cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span>Upload PDF Statement</span>
          </button>
        </header>

        <main className="grid grid-cols-12 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <div className="mb-4">
              <CategoriesCard transactions={transactions} />
            </div>
            <div className="mt-4">
              <AccountsGrid />
            </div>
          </div>
          <div className="lg:col-span-4">
            <CategoriesListView categories={data ? data.categories : undefined} />
          </div>
        </main>
      </div>

      <StatementUploadModal
        isOpen={isHeaderUploadOpen}
        onClose={() => setIsHeaderUploadOpen(false)}
      />
    </div>
  );
}

export default App;