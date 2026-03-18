// ============================================================
// Raporitfy — Projects Service Layer (Supabase CRUD)
// ============================================================

import { supabase } from '../supabase';
import { Project, ProjectMember, ProjectRecipient } from '../types/domain';

// ---- Projects CRUD ----

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getProject(id: string): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createProject(project: {
  name: string;
  address?: string;
  description?: string;
  phase?: string;
  organization_id: string;
}): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProject(
  id: string,
  updates: Partial<Pick<Project, 'name' | 'address' | 'description' | 'phase' | 'status'>>
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function archiveProject(id: string, archive: boolean): Promise<Project> {
  return updateProject(id, { status: archive ? 'archived' : 'active' });
}

// ---- Project Members ----

export async function getProjectMembers(
  projectId: string
): Promise<(ProjectMember & { profile: { full_name: string; email: string } })[]> {
  const { data, error } = await supabase
    .from('project_members')
    .select('*, profile:profiles(full_name, email)')
    .eq('project_id', projectId);
  if (error) throw error;
  return data as any ?? [];
}

export async function addProjectMember(
  projectId: string,
  profileId: string,
  role = 'member'
): Promise<void> {
  const { error } = await supabase
    .from('project_members')
    .insert({ project_id: projectId, profile_id: profileId, role });
  if (error) throw error;
}

export async function removeProjectMember(
  projectId: string,
  profileId: string
): Promise<void> {
  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('profile_id', profileId);
  if (error) throw error;
}

// ---- Project Recipients ----

export async function getProjectRecipients(projectId: string): Promise<ProjectRecipient[]> {
  const { data, error } = await supabase
    .from('project_recipients')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addProjectRecipient(
  projectId: string,
  email: string,
  name?: string
): Promise<void> {
  const { error } = await supabase
    .from('project_recipients')
    .insert({ project_id: projectId, email, name });
  if (error) throw error;
}

export async function removeProjectRecipient(id: string): Promise<void> {
  const { error } = await supabase
    .from('project_recipients')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
