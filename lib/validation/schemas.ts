import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  address: z.string().optional(),
  description: z.string().optional(),
  phase: z.string().optional(),
});
export type ProjectFormData = z.infer<typeof projectSchema>;

export const recipientSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  name: z.string().optional(),
});
export type RecipientFormData = z.infer<typeof recipientSchema>;

export const visitSchema = z.object({
  date: z.string().min(1, 'La date est requise'),
  type: z.enum(['chantier', 'reception', 'levee_reserves']),
  weather: z.string().optional(),
  summary: z.string().optional(),
  participants: z.string().optional(), // comma-separated, parsed to array
});
export type VisitFormData = z.infer<typeof visitSchema>;

export const observationSchema = z.object({
  lot: z.string().min(1, 'Le lot est requis'),
  zone: z.string().min(1, 'La zone est requise'),
  description: z.string().min(5, 'La description doit contenir au moins 5 caractères'),
  severity: z.enum(['mineur', 'majeur', 'critique']),
  classification: z.enum(['constat', 'remarque', 'reserve']).default('constat'),
});
export type ObservationFormData = z.infer<typeof observationSchema>;
