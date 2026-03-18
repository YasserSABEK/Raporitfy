import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProject } from '@/lib/hooks/useProjects';
import { useVisits } from '@/lib/hooks/useVisits';
import { colors, spacing, typography, borderRadius } from '@/lib/theme';
import { formatDate, formatRelative } from '@/lib/utils/date';
import { Visit } from '@/lib/types/domain';

const VISIT_TYPE_LABELS: Record<string, string> = {
  chantier: 'Visite de chantier',
  reception: 'Réception',
  levee_reserves: 'Levée de réserves',
};

const VISIT_TYPE_ICONS: Record<string, string> = {
  chantier: 'construct-outline',
  reception: 'checkmark-circle-outline',
  levee_reserves: 'clipboard-outline',
};

const STATUS_COLORS: Record<string, string> = {
  brouillon: colors.textMuted,
  en_revue: '#F59E0B',
  valide: colors.success,
  diffuse: colors.primary,
};

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: project, isLoading: loadingProject, error: errorProject } = useProject(id!);
  const { data: visits, isLoading: loadingVisits, refetch, isRefetching } = useVisits(id!);

  const handleRefresh = useCallback(() => { refetch(); }, [refetch]);

  if (loadingProject) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (errorProject || !project) {
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

  const renderVisitCard = ({ item }: { item: Visit }) => (
    <TouchableOpacity
      style={styles.visitCard}
      onPress={() => router.push(`/(tabs)/projects/${id}/visits/${item.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.visitCardHeader}>
        <View style={styles.visitTypeRow}>
          <Ionicons
            name={(VISIT_TYPE_ICONS[item.type] || 'calendar-outline') as any}
            size={18}
            color={colors.primary}
          />
          <Text style={styles.visitTypeName}>
            {VISIT_TYPE_LABELS[item.type] || item.type}
          </Text>
        </View>
        <View style={[styles.visitStatusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
          <View style={[styles.visitStatusDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
          <Text style={[styles.visitStatusText, { color: STATUS_COLORS[item.status] }]}>
            {item.status === 'brouillon' ? 'Brouillon' :
             item.status === 'en_revue' ? 'En revue' :
             item.status === 'valide' ? 'Validé' : 'Diffusé'}
          </Text>
        </View>
      </View>

      <Text style={styles.visitDate}>{formatDate(item.date)}</Text>

      {item.weather && (
        <View style={styles.visitInfoRow}>
          <Ionicons name="partly-sunny-outline" size={14} color={colors.textMuted} />
          <Text style={styles.visitInfoText}>{item.weather}</Text>
        </View>
      )}

      {item.participants && item.participants.length > 0 && (
        <View style={styles.visitInfoRow}>
          <Ionicons name="people-outline" size={14} color={colors.textMuted} />
          <Text style={styles.visitInfoText}>
            {item.participants.length} participant{item.participants.length > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {item.summary && (
        <Text style={styles.visitSummary} numberOfLines={2}>{item.summary}</Text>
      )}
    </TouchableOpacity>
  );

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
      <View style={styles.container}>
        {/* Project Header Card */}
        <FlatList
          data={visits ?? []}
          renderItem={renderVisitCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListHeaderComponent={
            <>
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
                <Text style={styles.dateText}>Créé le {formatDate(project.created_at)}</Text>
              </View>

              {/* Section Title */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Visites {visits && visits.length > 0 ? `(${visits.length})` : ''}
                </Text>
              </View>
            </>
          }
          ListEmptyComponent={
            loadingVisits ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: spacing.lg }} />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="calendar-outline" size={40} color={colors.textMuted} />
                <Text style={styles.placeholderTitle}>Aucune visite</Text>
                <Text style={styles.placeholderSubtitle}>
                  Planifiez votre première visite de chantier.
                </Text>
              </View>
            )
          }
        />

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push(`/(tabs)/projects/${id}/visits/new?t=${Date.now()}` as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100,
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
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.full },
  statusActive: { backgroundColor: colors.successMuted },
  statusArchived: { backgroundColor: colors.surface },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.medium },
  dateText: { fontSize: typography.sizes.xs, color: colors.textMuted },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },

  // Visit cards
  visitCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  visitCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  visitTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  visitTypeName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },
  visitStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  visitStatusDot: { width: 6, height: 6, borderRadius: 3 },
  visitStatusText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.medium },
  visitDate: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  visitInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  visitInfoText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  visitSummary: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },

  // Placeholder
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

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
