import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteStatement, fetchStatements, uploadStatement } from '@/lib/api';
import type { Statement } from '@/types/types';

export function useStatements(accountId?: string | null) {
  const queryClient = useQueryClient();

  const statementsQuery = useQuery<Statement[]>({
    queryKey: ['statements', accountId],
    queryFn: () => fetchStatements(accountId),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ accountId, file }: { accountId: string; file: File }) =>
      uploadStatement(accountId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statements'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-by-account'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (statementId: string) => deleteStatement(statementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statements'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-by-account'] });
    },
  });

  return {
    statements: statementsQuery.data ?? [],
    isLoading: statementsQuery.isLoading,
    error: statementsQuery.error || null,
    uploadStatement: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error,
    deleteStatement: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
