// ============================================================
// Raporitfy — Date Formatting Utilities (French Locale)
// ============================================================

const FRENCH_MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
] as const;

/**
 * Format a date string to French format: "17 mars 2026"
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${FRENCH_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format a date string to French relative time:
 * "aujourd'hui", "hier", "il y a 3 jours", "il y a 2 semaines", etc.
 */
export function formatRelative(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return 'hier';
  if (diffDays < 7) return `il y a ${diffDays} jours`;
  if (diffDays < 14) return 'il y a 1 semaine';
  if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)} semaines`;
  if (diffDays < 60) return 'il y a 1 mois';
  return `il y a ${Math.floor(diffDays / 30)} mois`;
}
