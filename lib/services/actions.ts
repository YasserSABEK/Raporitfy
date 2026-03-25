import { supabase } from '../supabase';
import { ActionItem } from '../types/domain';

export async function getActions(visitId: string): Promise<ActionItem[]> {
  const { data, error } = await supabase
    .from('action_items')
    .select('*')
    .eq('visit_id', visitId)
    .order('deadline', { ascending: true });
  if (error) throw new Error(error.message);
  return data as ActionItem[];
}

export async function getAction(id: string): Promise<ActionItem> {
  const { data, error } = await supabase
    .from('action_items')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as ActionItem;
}

// Carry-forward: get ALL open actions for a project (across all visits)
// Two-step query to avoid unreliable nested Supabase joins
export async function getOpenActionsForProject(projectId: string): Promise<(ActionItem & { visit_date: string })[]> {
  // Step 1: Get all visit IDs for this project
  const { data: visits, error: vErr } = await supabase
    .from('visits')
    .select('id, date')
    .eq('project_id', projectId)
    .order('date', { ascending: false });
  if (vErr) throw new Error(vErr.message);
  if (!visits || visits.length === 0) return [];

  const visitIds = visits.map(v => v.id);
  const visitDateMap = Object.fromEntries(visits.map(v => [v.id, v.date]));

  // Step 2: Get open actions for those visits
  const { data, error } = await supabase
    .from('action_items')
    .select('*')
    .in('visit_id', visitIds)
    .in('status', ['ouverte', 'en_cours', 'reportee'])
    .order('deadline', { ascending: true });
  if (error) throw new Error(error.message);

  return (data ?? []).map((a: any) => ({
    ...a,
    visit_date: visitDateMap[a.visit_id] || '',
  }));
}

// Dashboard: get ALL open actions across all projects for current user's org
// Two-step query for reliability (nested Supabase joins can be flaky)
export async function getAllOpenActions(): Promise<(ActionItem & { project_id: string; project_name: string; visit_date: string })[]> {
  // Step 1: Get all open actions with visit info
  const { data: actions, error: aErr } = await supabase
    .from('action_items')
    .select('*, visits!inner(project_id, date)')
    .in('status', ['ouverte', 'en_cours', 'reportee'])
    .order('deadline', { ascending: true });
  if (aErr) throw new Error(aErr.message);
  if (!actions || actions.length === 0) return [];

  // Step 2: Get project names for unique project IDs
  const projectIds = [...new Set(actions.map((a: any) => a.visits?.project_id).filter(Boolean))];
  const { data: projects, error: pErr } = await supabase
    .from('projects')
    .select('id, name')
    .in('id', projectIds);
  if (pErr) throw new Error(pErr.message);

  const projectMap = Object.fromEntries((projects ?? []).map(p => [p.id, p.name]));

  return actions.map((a: any) => ({
    ...a,
    project_id: a.visits?.project_id || '',
    project_name: projectMap[a.visits?.project_id] || '',
    visit_date: a.visits?.date || '',
    visits: undefined,
  }));
}

export async function createAction(input: {
  visit_id: string;
  description: string;
  owner: string;
  deadline?: string;
  priority?: string;
  observation_id?: string;
  decision_id?: string;
}): Promise<ActionItem> {
  // created_by has DEFAULT auth.uid() in DB
  const { data, error } = await supabase
    .from('action_items')
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as ActionItem;
}

export async function updateAction(
  id: string,
  updates: Partial<Pick<ActionItem, 'description' | 'owner' | 'deadline' | 'priority' | 'status'>>
): Promise<ActionItem> {
  const { data, error } = await supabase
    .from('action_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as ActionItem;
}

export async function deleteAction(id: string): Promise<void> {
  const { error } = await supabase.from('action_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
