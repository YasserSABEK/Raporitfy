import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as visitService from '../services/visits';

// ============ VISITS ============

export function useVisits(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'visits'],
    queryFn: () => visitService.getVisits(projectId),
    enabled: !!projectId,
  });
}

export function useVisit(id: string) {
  return useQuery({
    queryKey: ['visits', id],
    queryFn: () => visitService.getVisit(id),
    enabled: !!id,
  });
}

export function useCreateVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: visitService.createVisit,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.project_id, 'visits'] });
    },
  });
}

export function useUpdateVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Parameters<typeof visitService.updateVisit>[1]) =>
      visitService.updateVisit(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects', data.project_id, 'visits'] });
      queryClient.invalidateQueries({ queryKey: ['visits', data.id] });
    },
  });
}

export function useDeleteVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: visitService.deleteVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// ============ OBSERVATIONS ============

export function useObservations(visitId: string) {
  return useQuery({
    queryKey: ['visits', visitId, 'observations'],
    queryFn: () => visitService.getObservations(visitId),
    enabled: !!visitId,
  });
}

export function useObservation(id: string) {
  return useQuery({
    queryKey: ['observations', id],
    queryFn: () => visitService.getObservation(id),
    enabled: !!id,
  });
}

export function useCreateObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: visitService.createObservation,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['visits', variables.visit_id, 'observations'] });
    },
  });
}

export function useUpdateObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Parameters<typeof visitService.updateObservation>[1]) =>
      visitService.updateObservation(id, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      queryClient.invalidateQueries({ queryKey: ['observations', variables.id] });
    },
  });
}

export function useDeleteObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: visitService.deleteObservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
}

// ============ EVIDENCE ============

export function useEvidence(observationId: string) {
  return useQuery({
    queryKey: ['observations', observationId, 'evidence'],
    queryFn: () => visitService.getEvidence(observationId),
    enabled: !!observationId,
  });
}

export function useAddEvidence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: visitService.addEvidence,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['observations', variables.observation_id, 'evidence'] });
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
}

export function useRemoveEvidence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: visitService.removeEvidence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
}
