import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as documentService from '../services/documents';

export function useDocuments(visitId: string) {
  return useQuery({
    queryKey: ['visits', visitId, 'documents'],
    queryFn: () => documentService.getDocuments(visitId),
    enabled: !!visitId,
  });
}

export function useLatestDocument(visitId: string) {
  return useQuery({
    queryKey: ['visits', visitId, 'latest-document'],
    queryFn: () => documentService.getLatestDocument(visitId),
    enabled: !!visitId,
  });
}

export function useGeneratePdf() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: documentService.generatePdf,
    onSuccess: (_data, visitId) => {
      queryClient.invalidateQueries({ queryKey: ['visits', visitId, 'documents'] });
      queryClient.invalidateQueries({ queryKey: ['visits', visitId, 'latest-document'] });
    },
  });
}

export function useSendReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ visitId, documentId, recipients }: { visitId: string; documentId: string; recipients: string[] }) =>
      documentService.sendReport(visitId, documentId, recipients),
    onSuccess: (_data, { visitId }) => {
      queryClient.invalidateQueries({ queryKey: ['visits', visitId, 'documents'] });
      queryClient.invalidateQueries({ queryKey: ['visits', visitId, 'latest-document'] });
      queryClient.invalidateQueries({ queryKey: ['visits', visitId] });
    },
  });
}
