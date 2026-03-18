import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProject } from '@/lib/hooks/useProjects';
import { colors, spacing, typography, borderRadius } from '@/lib/theme';
import { formatDate } from '@/lib/utils/date';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: project, isLoading, error } = useProject(id!);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !project) {
    return (
      <View style={styles.centered}>
        <Ionicons name="warning-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>Projet introuvable</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: project.name,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: typography.weights.semibold },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push(`/(tabs)/projects/${id}/settings` as any)}
              hitSlop={8}
            >
              <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Project Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerIcon}>
            <Ionicons name="business" size={32} color={colors.primary} />
          </View>
          <Text style={styles.projectName}>{project.name}</Text>

          {project.address && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color={colors.textMuted} />
              <Text style={styles.infoText}>{project.address}</Text>
            </View>
          )}

          <View style={styles.metaRow}>
            {project.phase && (
              <View style={styles.phaseBadge}>
                <Text style={styles.phaseBadgeText}>{project.phase}</Text>
              </View>
            )}
            <View style={[styles.statusBadge, project.status === 'active' ? styles.statusActive : styles.statusArchived]}>
              <View style={[styles.statusDot, { backgroundColor: project.status === 'active' ? colors.success : colors.textMuted }]} />
              <Text style={[styles.statusText, { color: project.status === 'active' ? colors.success : colors.textMuted }]}>
                {project.status === 'active' ? 'Actif' : 'Archivé'}
              </Text>
            </View>
          </View>

          {project.description && (
            <Text style={styles.description}>{project.description}</Text>
          )}

          <Text style={styles.dateText}>Créé le {formatDate(project.created_at)}</Text>
        </View>

        {/* Visits Section — Placeholder for Phase 03 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visites</Text>
          <View style={styles.placeholder}>
            <Ionicons name="calendar-outline" size={40} color={colors.textMuted} />
            <Text style={styles.placeholderTitle}>Aucune visite</Text>
            <Text style={styles.placeholderSubtitle}>
              Les visites de chantier seront disponibles dans la Phase 03.
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push(`/(tabs)/projects/${id}/settings` as any)}
          >
            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.actionText}>Réglages du projet</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    fontSize: typography.sizes.lg,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  backButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    color: colors.text,
    fontSize: typography.sizes.md,
  },

  // Header card
  headerCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  projectName: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  phaseBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  phaseBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  statusActive: { backgroundColor: colors.successMuted },
  statusArchived: { backgroundColor: colors.surface },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.medium },
  description: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  dateText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },

  // Sections
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  placeholder: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  placeholderTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  placeholderSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
});
