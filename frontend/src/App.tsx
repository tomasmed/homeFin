import { AccountsGrid } from '@/components/AccountsGrid';
import CategoriesCard from '@/components/CategoriesCard';

import { useTransactionsAll } from '@/hooks/useTransactionsAll';

function App() {
  const { transactions } = useTransactionsAll();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Home Finances</h1>
          <p className="text-gray-600 dark:text-gray-600">Finance Dashboard</p>
        </header>
        <main className="grid grid-cols-5 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-4">
            <div className="mb-4">
              <CategoriesCard transactions={transactions} />
            </div>
            <div className="mt-4">
              <AccountsGrid />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;