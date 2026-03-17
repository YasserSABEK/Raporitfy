// ============================================================
// Raporitfy — Design Theme (Dark Navy + Amber)
// ============================================================

export const colors = {
  // Backgrounds
  background: '#0A1628',
  surface: '#111D32',
  surfaceElevated: '#1A2740',
  surfacePressed: '#0D1B2E',

  // Primary (Amber)
  primary: '#F59E0B',
  primaryLight: '#FBBF24',
  primaryDark: '#D97706',
  primaryMuted: 'rgba(245, 158, 11, 0.15)',

  // Text
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0A1628',

  // Status
  error: '#EF4444',
  errorMuted: 'rgba(239, 68, 68, 0.15)',
  success: '#22C55E',
  successMuted: 'rgba(34, 197, 94, 0.15)',
  warning: '#F59E0B',
  warningMuted: 'rgba(245, 158, 11, 0.15)',
  info: '#3B82F6',

  // Borders
  border: '#1E293B',
  borderLight: '#334155',

  // Severity colors
  severityMineur: '#3B82F6',
  severityMajeur: '#F59E0B',
  severityCritique: '#EF4444',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  fontFamily: 'Inter',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 28,
    title: 34,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

// Minimum touch target for field usage (construction site)
export const TOUCH_TARGET_MIN = 48;
