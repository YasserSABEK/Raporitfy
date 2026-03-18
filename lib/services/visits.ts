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
  // Get current user for created_by (column has no DEFAULT)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data, error } = await supabase
    .from('visits')
    .insert({ ...input, created_by: user.id })
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

export async function getObservations(visitId: string): Promise<(Observation & { evidence_count: number; first_photo_path: string | null })[]> {
  const { data, error } = await supabase
    .from('observations')
    .select('*, evidence(id, type, file_url)')
    .eq('visit_id', visitId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((o: any) => {
    const evidenceList = Array.isArray(o.evidence) ? o.evidence : [];
    const firstPhoto = evidenceList.find((e: any) => e.type === 'photo' && e.file_url);
    return {
      ...o,
      evidence_count: evidenceList.length,
      first_photo_path: firstPhoto?.file_url || null,
      evidence: undefined,
    };
  });
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

import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export async function uploadPhoto(uri: string): Promise<string> {
  // Supabase-recommended approach for React Native:
  // 1. Read file as base64 (expo-file-system)
  // 2. Decode to ArrayBuffer (base64-arraybuffer)
  // 3. Upload ArrayBuffer to storage
  
  const base64Data = await FileSystem.readAsStringAsync(uri, {
    encoding: 'base64', // Using string literal as fallback if enum is omitted in types
  });

  const ext = uri.split('.').pop()?.split('?')[0] || 'jpg';
  const mimeType = ext === 'heic' ? 'image/heic'
    : ext === 'webp' ? 'image/webp'
    : ext === 'png' ? 'image/png'
    : 'image/jpeg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `observations/${filename}`;

  const { error } = await supabase.storage
    .from('evidence-photos')
    .upload(path, decode(base64Data), {
      contentType: mimeType,
      upsert: false,
    });
  if (error) throw new Error(error.message);

  return path;
}

// Public URL — bucket is public, no auth needed
export function getPhotoUrl(path: string): string {
  const { data } = supabase.storage
    .from('evidence-photos')
    .getPublicUrl(path);
  return data.publicUrl;
}

// Signed URL fallback (kept for reference)
export async function getSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('evidence-photos')
    .createSignedUrl(path, 3600);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}
