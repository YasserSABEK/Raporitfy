// ============================================================
// Raporitfy — Domain Model Types (Source de Vérité Unique)
// ============================================================

export type UserRole = 'terrain' | 'bureau';
export type ProjectStatus = 'active' | 'archived';
export type VisitType = 'chantier' | 'reception' | 'levee_reserves';
export type Severity = 'mineur' | 'majeur' | 'critique';
export type ActionStatus = 'ouverte' | 'en_cours' | 'fermee' | 'reportee';
export type ActionPriority = 'basse' | 'moyenne' | 'haute' | 'urgente';
export type VisitStatus = 'brouillon' | 'en_revue' | 'valide' | 'diffuse';
export type EvidenceType = 'photo' | 'audio' | 'document' | 'note';
export type DocumentFormat = 'pdf' | 'docx';

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  full_name: string;
  role: UserRole;
  email: string;
  created_at: string;
}

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  address: string | null;
  description: string | null;
  phase: string | null;
  status: ProjectStatus;
  created_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  profile_id: string;
  role: string;
  created_at: string;
}

export interface ProjectRecipient {
  id: string;
  project_id: string;
  email: string;
  name: string | null;
  created_at: string;
}

export interface Visit {
  id: string;
  project_id: string;
  date: string;
  type: VisitType;
  weather: string | null;
  summary: string | null;
  status: VisitStatus;
  version: number;
  created_by: string;
  created_at: string;
}

export interface Observation {
  id: string;
  visit_id: string;
  lot: string;
  zone: string;
  description: string;
  severity: Severity;
  classification: string;
  source: string | null;
  confidence: number;
  created_at: string;
}

export interface Evidence {
  id: string;
  observation_id: string;
  type: EvidenceType;
  file_url: string | null;
  content: string | null;
  created_at: string;
}

export interface Decision {
  id: string;
  visit_id: string;
  content: string;
  author_id: string;
  validator_id: string | null;
  scope: string | null;
  validated: boolean;
  created_at: string;
}

export interface ActionItem {
  id: string;
  visit_id: string;
  observation_id: string | null;
  decision_id: string | null;
  owner: string;
  deadline: string | null;
  priority: ActionPriority;
  status: ActionStatus;
  description: string;
  created_at: string;
}

export interface GeneratedDocument {
  id: string;
  visit_id: string;
  version: number;
  format: DocumentFormat;
  file_url: string;
  recipients: string[];
  sent_at: string | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_id: string;
  details: Record<string, unknown> | null;
  created_at: string;
}
