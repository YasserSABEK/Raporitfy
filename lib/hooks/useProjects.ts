// ============================================================
// Raporitfy — React Query Hooks for Projects
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as projectService from '../services/projects';
import { useAuth } from './useAuth';

// ---- Project Queries ----

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectService.getProject(id),
    enabled: !!id,
  });
}

// ---- Project Mutations ----

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();

  return useMutation({
    mutationFn: async (data: { name: string; address?: string; description?: string; phase?: string }) => {
      let orgId = profile?.organization_id;

      // Fallback: fetch org_id directly if profile isn't in Zustand yet
      if (!orgId && user) {
        const { supabase } = await import('../supabase');
        const { data: p } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();
        orgId = p?.organization_id;
      }

      if (!orgId) {
        throw new Error("Profil introuvable. Veuillez vous reconnecter.");
      }

      return projectService.createProject({ ...data, organization_id: orgId });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; name?: string; address?: string; description?: string; phase?: string }) =>
      projectService.updateProject(id, updates),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
    },
  });
}

export function useArchiveProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, archive }: { id: string; archive: boolean }) =>
      projectService.archiveProject(id, archive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}

// ---- Recipients ----

export function useProjectRecipients(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'recipients'],
    queryFn: () => projectService.getProjectRecipients(projectId),
    enabled: !!projectId,
  });
}

export function useAddRecipient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, email, name }: { projectId: string; email: string; name?: string }) =>
      projectService.addProjectRecipient(projectId, email, name),
    onSuccess: (_data, { projectId }) =>
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'recipients'] }),
  });
}

export function useRemoveRecipient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      projectService.removeProjectRecipient(id),
    onSuccess: (_data, { projectId }) =>
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'recipients'] }),
  });
}

// ---- Members ----

export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'members'],
    queryFn: () => projectService.getProjectMembers(projectId),
    enabled: !!projectId,
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, profileId, role }: { projectId: string; profileId: string; role?: string }) =>
      projectService.addProjectMember(projectId, profileId, role),
    onSuccess: (_data, { projectId }) =>
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] }),
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, profileId }: { projectId: string; profileId: string }) =>
      projectService.removeProjectMember(projectId, profileId),
    onSuccess: (_data, { projectId }) =>
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] }),
  });
}
