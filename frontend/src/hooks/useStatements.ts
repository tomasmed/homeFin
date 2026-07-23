import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteStatement, fetchStatements, uploadStatement, type StatementItem } from '@/lib/api';

export function useStatements(accountId?: string | null) {
  const queryClient = useQueryClient();

  const statementsQuery = useQuery<StatementItem[]>({
    queryKey: ['statements', accountId],
    queryFn: async () => {
      const res = await fetchStatements(accountId || undefined);
      return res.statements;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ({ accountId, file }: { accountId: string; file: File }) =>
      uploadStatement({ accountId, file }),
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
