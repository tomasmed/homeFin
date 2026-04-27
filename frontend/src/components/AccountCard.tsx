import React from 'react';
import { Building2, Save, CreditCard, TrendingUp } from 'lucide-react';
import type { Account } from '@/types/types';

const accountTypeLabels: Record<string, string> = {
  checking: 'Checking',
  savings: 'Savings',
  credit: 'Credit',
  investment: 'Investment',
};

const icons: Record<string, React.ReactNode> = {
  checking: <Building2 className="h-6 w-6 text-slate-400" />,
  savings: <Save className="h-6 w-6 text-slate-400" />,
  credit: <CreditCard className="h-6 w-6 text-slate-400" />,
  investment: <TrendingUp className="h-6 w-6 text-slate-400" />,
};

export function AccountCard({ 
  account, 
  isSelected = false, 
  onClick 
}: { 
  account: Account; 
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const Icon = icons[account.account_type] || icons.checking;

  return (
    <div onClick={onClick} className={`bg-white border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-md hover:bg-gray-50 transition-all flex items-center gap-4 cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200' : ''}`}>
      <div className="flex-shrink-0 p-2">
        {Icon}
      </div>
      <div className="flex-grow p-2">
        <h4 className="font-semibold text-slate-900">{account.name}</h4>
        <p className="text-sm text-slate-500">{account.institution}</p>
        <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-xs font-medium rounded-full text-slate-600">
          {accountTypeLabels[account.account_type] || account.account_type}
        </span>
      </div>
    </div>
  );
}
