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
