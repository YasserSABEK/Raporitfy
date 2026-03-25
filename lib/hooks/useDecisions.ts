import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as decisionService from '../services/decisions';

export function useDecisions(visitId: string) {
  return useQuery({
    queryKey: ['visits', visitId, 'decisions'],
    queryFn: () => decisionService.getDecisions(visitId),
    enabled: !!visitId,
  });
}

export function useDecision(id: string) {
  return useQuery({
    queryKey: ['decisions', id],
    queryFn: () => decisionService.getDecision(id),
    enabled: !!id,
  });
}

export function useCreateDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: decisionService.createDecision,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['visits', variables.visit_id, 'decisions'] });
    },
  });
}

export function useUpdateDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Parameters<typeof decisionService.updateDecision>[1]) =>
      decisionService.updateDecision(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
    },
  });
}

export function useDeleteDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: decisionService.deleteDecision,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
}
