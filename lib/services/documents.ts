import { supabase } from '../supabase';
import { GeneratedDocument } from '../types/domain';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export async function generatePdf(visitId: string): Promise<{ document_id: string; file_url: string; version: number }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Non authentifié');

  const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ visit_id: visitId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
    throw new Error(err.error || `Erreur ${res.status}`);
  }

  return res.json();
}

export async function sendReport(
  visitId: string,
  documentId: string,
  recipients: string[],
): Promise<{ sent_to: number }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Non authentifié');

  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ visit_id: visitId, document_id: documentId, recipients }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
    throw new Error(err.error || `Erreur ${res.status}`);
  }

  return res.json();
}

export async function getDocuments(visitId: string): Promise<GeneratedDocument[]> {
  const { data, error } = await supabase
    .from('generated_documents')
    .select('*')
    .eq('visit_id', visitId)
    .order('version', { ascending: false });
  if (error) throw new Error(error.message);
  return data as GeneratedDocument[];
}

export async function getLatestDocument(visitId: string): Promise<GeneratedDocument | null> {
  const { data, error } = await supabase
    .from('generated_documents')
    .select('*')
    .eq('visit_id', visitId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as GeneratedDocument | null;
}
