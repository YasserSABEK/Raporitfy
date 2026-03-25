import { supabase } from '../supabase';
import { Decision } from '../types/domain';

export async function getDecisions(visitId: string): Promise<Decision[]> {
  const { data, error } = await supabase
    .from('decisions')
    .select('*')
    .eq('visit_id', visitId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data as Decision[];
}

export async function getDecision(id: string): Promise<Decision> {
  const { data, error } = await supabase
    .from('decisions')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as Decision;
}

export async function createDecision(input: {
  visit_id: string;
  content: string;
  author: string;
  scope?: string;
}): Promise<Decision> {
  // created_by has DEFAULT auth.uid() in DB
  const { data, error } = await supabase
    .from('decisions')
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Decision;
}

export async function updateDecision(
  id: string,
  updates: Partial<Pick<Decision, 'content' | 'author' | 'scope' | 'validated'>>
): Promise<Decision> {
  const { data, error } = await supabase
    .from('decisions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Decision;
}

export async function deleteDecision(id: string): Promise<void> {
  const { error } = await supabase.from('decisions').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
