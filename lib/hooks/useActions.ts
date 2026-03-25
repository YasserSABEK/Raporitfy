import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as actionService from '../services/actions';

export function useActions(visitId: string) {
  return useQuery({
    queryKey: ['visits', visitId, 'actions'],
    queryFn: () => actionService.getActions(visitId),
    enabled: !!visitId,
  });
}

export function useAction(id: string) {
  return useQuery({
    queryKey: ['actions', id],
    queryFn: () => actionService.getAction(id),
    enabled: !!id,
  });
}

export function useOpenActionsForProject(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'open-actions'],
    queryFn: () => actionService.getOpenActionsForProject(projectId),
    enabled: !!projectId,
  });
}

export function useAllOpenActions() {
  return useQuery({
    queryKey: ['all-open-actions'],
    queryFn: actionService.getAllOpenActions,
  });
}

export function useCreateAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: actionService.createAction,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['visits', variables.visit_id, 'actions'] });
      queryClient.invalidateQueries({ queryKey: ['all-open-actions'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Parameters<typeof actionService.updateAction>[1]) =>
      actionService.updateAction(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      queryClient.invalidateQueries({ queryKey: ['all-open-actions'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: actionService.deleteAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      queryClient.invalidateQueries({ queryKey: ['all-open-actions'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
