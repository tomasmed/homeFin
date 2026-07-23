import React, { useState } from 'react';
import { AlertCircle, CheckCircle, FileText, Loader2, Upload, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAccounts } from '@/hooks/useAccounts';
import { useStatements } from '@/hooks/useStatements';
import apiClient from '@/lib/api';

interface StatementUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAccountId?: string;
  onUploadSuccess?: (accountId: string, statementId: string) => void;
}

export const StatementUploadModal: React.FC<StatementUploadModalProps> = ({
  isOpen,
  onClose,
  defaultAccountId = '',
  onUploadSuccess,
}) => {
  const queryClient = useQueryClient();
  const { data: accountsData } = useAccounts();
  const { uploadStatement, isUploading } = useStatements();

  const [selectedAccountId, setSelectedAccountId] = useState<string>(defaultAccountId);
  const [newAccountName, setNewAccountName] = useState('Main Checking Account');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ filename: string; count: number } | null>(null);

  if (!isOpen) return null;

  const accounts = accountsData?.accounts ?? [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMsg('Please select a valid PDF file.');
        setSelectedFile(null);
        return;
      }
      setErrorMsg(null);
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMsg('Only PDF files are supported.');
        return;
      }
      setErrorMsg(null);
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    let accountIdToUse = selectedAccountId || (accounts.length > 0 ? accounts[0].id : '');

    if (!accountIdToUse) {
      try {
        const createRes = await apiClient.post('/v1/api/accounts', {
          name: newAccountName.trim() || 'Main Checking Account',
          institution: 'Bank',
          account_type: 'checking',
          currency: 'USD',
        });
        accountIdToUse = createRes.data.account.id;
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { detail?: string } }; message?: string };
        setErrorMsg(errorObj.response?.data?.detail || 'Failed to create target account.');
        return;
      }
    }

    if (!selectedFile) {
      setErrorMsg('Please select a PDF statement file to upload.');
      return;
    }

    try {
      const res = await uploadStatement({
        accountId: accountIdToUse,
        file: selectedFile,
      });

      setSuccessInfo({
        filename: selectedFile.name,
        count: res.created_transactions_count,
      });
      setSelectedFile(null);
      onUploadSuccess?.(accountIdToUse, res.statement.id);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: string } }; message?: string };
      const msg = errorObj.response?.data?.detail || errorObj.message || 'Failed to upload and parse statement.';
      setErrorMsg(msg);
    }
  };

  const handleResetAndClose = () => {
    setSelectedFile(null);
    setErrorMsg(null);
    setSuccessInfo(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all border border-gray-100">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Upload Bank Statement</h2>
              <p className="text-xs text-gray-500">Import transactions automatically from PDF</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {successInfo ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Statement Imported Successfully!</h3>
            <p className="mt-1 text-sm text-gray-600">
              Parsed <span className="font-semibold text-green-700">{successInfo.count}</span> transactions from{' '}
              <span className="font-medium">{successInfo.filename}</span>.
            </p>
            <button
              onClick={handleResetAndClose}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Selection or Account Creation */}
            {accounts.length > 0 ? (
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Target Account
                </label>
                <select
                  value={selectedAccountId || accounts[0].id}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-sm font-medium text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.institution} - {acc.account_type})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Target Account Name (Will be created)
                </label>
                <input
                  type="text"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="e.g. Main Checking Account"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-sm font-medium text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition"
                />
              </div>
            )}

            {/* Drag & Drop PDF Zone */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Statement File (PDF)
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition text-center cursor-pointer ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50/50'
                    : selectedFile
                    ? 'border-green-400 bg-green-50/30'
                    : 'border-gray-300 bg-gray-50/50 hover:bg-gray-100/80'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {selectedFile ? (
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[240px]">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-700">
                      Drag & drop your PDF statement here, or{' '}
                      <span className="text-blue-600 underline">browse</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Supports PDF format</p>
                  </>
                )}
              </div>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 border border-red-100">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleResetAndClose}
                disabled={isUploading}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing PDF...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Import Statement</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
