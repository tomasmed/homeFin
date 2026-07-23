import React from 'react';
import { FileText, Trash2, Filter } from 'lucide-react';
import { useStatements } from '@/hooks/useStatements';

interface StatementFilterProps {
  accountId?: string | null;
  selectedStatementId: string | null;
  onSelectStatement: (statementId: string | null) => void;
}

export const StatementFilter: React.FC<StatementFilterProps> = ({
  accountId,
  selectedStatementId,
  onSelectStatement,
}) => {
  const { statements, isLoading, deleteStatement } = useStatements(accountId);

  if (isLoading) {
    return <div className="text-xs text-gray-400 py-1">Loading statements...</div>;
  }

  if (statements.length === 0) {
    return null;
  }

  const handleDelete = async (e: React.MouseEvent, statementId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this statement record? (Associated transactions will be preserved).')) {
      await deleteStatement(statementId);
      if (selectedStatementId === statementId) {
        onSelectStatement(null);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2">
      <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0 mr-1">
        <Filter className="h-3.5 w-3.5 text-gray-400" />
        <span>Statement:</span>
      </div>

      <button
        onClick={() => onSelectStatement(null)}
        className={`rounded-full px-3 py-1 text-xs font-medium transition shrink-0 border ${
          selectedStatementId === null
            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
        }`}
      >
        All Transactions
      </button>

      {statements.map((stmt) => (
        <div
          key={stmt.id}
          onClick={() => onSelectStatement(stmt.id)}
          className={`group flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition shrink-0 border ${
            selectedStatementId === stmt.id
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <FileText className="h-3.5 w-3.5 opacity-70" />
          <span className="truncate max-w-[140px]">{stmt.filename}</span>
          <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${
            selectedStatementId === stmt.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
          }`}>
            {stmt.transaction_count}
          </span>
          <button
            onClick={(e) => handleDelete(e, stmt.id)}
            className={`opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:text-red-500 transition ${
              selectedStatementId === stmt.id ? 'hover:bg-blue-700 text-white/80' : 'text-gray-400'
            }`}
            title="Delete statement"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
};
