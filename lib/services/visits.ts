import { supabase } from '../supabase';
import { Visit, Observation, Evidence } from '../types/domain';

// ============ VISITS ============

export async function getVisits(projectId: string): Promise<Visit[]> {
  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('project_id', projectId)
    .order('date', { ascending: false });
  if (error) throw new Error(error.message);
  return data as Visit[];
}

export async function getVisit(id: string): Promise<Visit> {
  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as Visit;
}

export async function createVisit(input: {
  project_id: string;
  date: string;
  type: string;
  weather?: string;
  summary?: string;
  participants?: string[];
}): Promise<Visit> {
  const { data, error } = await supabase
    .from('visits')
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Visit;
}

export async function updateVisit(
  id: string,
  updates: Partial<Pick<Visit, 'date' | 'type' | 'weather' | 'summary' | 'status' | 'participants'>>
): Promise<Visit> {
  const { data, error } = await supabase
    .from('visits')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Visit;
}

export async function deleteVisit(id: string): Promise<void> {
  const { error } = await supabase.from('visits').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============ OBSERVATIONS ============

export async function getObservations(visitId: string): Promise<(Observation & { evidence_count: number })[]> {
  const { data, error } = await supabase
    .from('observations')
    .select('*, evidence(id)')
    .eq('visit_id', visitId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((o: any) => ({
    ...o,
    evidence_count: Array.isArray(o.evidence) ? o.evidence.length : 0,
    evidence: undefined,
  }));
}

export async function getObservation(id: string): Promise<Observation> {
  const { data, error } = await supabase
    .from('observations')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as Observation;
}

export async function createObservation(input: {
  visit_id: string;
  lot: string;
  zone: string;
  description: string;
  severity: string;
  classification?: string;
}): Promise<Observation> {
  const { data, error } = await supabase
    .from('observations')
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Observation;
}

export async function updateObservation(
  id: string,
  updates: Partial<Pick<Observation, 'lot' | 'zone' | 'description' | 'severity' | 'classification'>>
): Promise<Observation> {
  const { data, error } = await supabase
    .from('observations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Observation;
}

export async function deleteObservation(id: string): Promise<void> {
  const { error } = await supabase.from('observations').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============ EVIDENCE ============

export async function getEvidence(observationId: string): Promise<Evidence[]> {
  const { data, error } = await supabase
    .from('evidence')
    .select('*')
    .eq('observation_id', observationId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data as Evidence[];
}

export async function addEvidence(input: {
  observation_id: string;
  type: string;
  file_url?: string;
  content?: string;
}): Promise<Evidence> {
  const { data, error } = await supabase
    .from('evidence')
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Evidence;
}

export async function removeEvidence(id: string): Promise<void> {
  const { error } = await supabase.from('evidence').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============ PHOTO UPLOAD ============

export async function uploadPhoto(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const ext = uri.split('.').pop()?.split('?')[0] || 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `observations/${filename}`;

  const { error } = await supabase.storage
    .from('evidence-photos')
    .upload(path, blob, { contentType: `image/${ext}` });
  if (error) throw new Error(error.message);

  return path; // Store path, not URL — use getSignedUrl for display
}

export async function getSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('evidence-photos')
    .createSignedUrl(path, 3600); // 1 hour
  if (error) throw new Error(error.message);
  return data.signedUrl;
}
