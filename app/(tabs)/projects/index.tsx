import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useProjects, useArchiveProject } from '@/lib/hooks/useProjects';
import { colors, spacing, typography, borderRadius } from '@/lib/theme';
import { formatRelative } from '@/lib/utils/date';
import { Project, ProjectStatus } from '@/lib/types/domain';

export default function ProjectsScreen() {
  const [showArchived, setShowArchived] = useState(false);
  const { data: projects, isLoading, error, refetch, isRefetching } = useProjects();
  const archiveMutation = useArchiveProject();

  const filteredProjects = (projects ?? []).filter((p) =>
    showArchived ? p.status === 'archived' : p.status === 'active'
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleArchiveToggle = useCallback(
    (project: Project) => {
      const isArchived = project.status === 'archived';
      Alert.alert(
        isArchived ? 'Réactiver le projet ?' : 'Archiver le projet ?',
        isArchived
          ? `"${project.name}" sera remis dans vos chantiers actifs.`
          : `"${project.name}" sera déplacé dans les archives.`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: isArchived ? 'Réactiver' : 'Archiver',
            style: isArchived ? 'default' : 'destructive',
            onPress: () =>
              archiveMutation.mutate({ id: project.id, archive: !isArchived }),
          },
        ]
      );
    },
    [archiveMutation]
  );

  const renderProjectCard = useCallback(
    ({ item }: { item: Project }) => (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push(`/(tabs)/projects/${item.id}` as any)}
        onLongPress={() => handleArchiveToggle(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons name="business" size={20} color={colors.primary} />
          </View>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.name}
            </Text>
            <StatusBadge status={item.status} />
          </View>
        </View>

        {item.address && (
          <View style={styles.cardRow}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={styles.cardAddress} numberOfLines={1}>
              {item.address}
            </Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          {item.phase && (
            <View style={styles.phaseBadge}>
              <Text style={styles.phaseBadgeText}>{item.phase}</Text>
            </View>
          )}
          <Text style={styles.cardDate}>
            Créé {formatRelative(item.created_at)}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [handleArchiveToggle]
  );

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="warning-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>Erreur de chargement</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter toggle */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterTab, !showArchived && styles.filterTabActive]}
          onPress={() => setShowArchived(false)}
        >
          <Text style={[styles.filterText, !showArchived && styles.filterTextActive]}>
            Actifs ({(projects ?? []).filter((p) => p.status === 'active').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, showArchived && styles.filterTabActive]}
          onPress={() => setShowArchived(true)}
        >
          <Text style={[styles.filterText, showArchived && styles.filterTextActive]}>
            Archivés ({(projects ?? []).filter((p) => p.status === 'archived').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Project list or empty state */}
      {filteredProjects.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name={showArchived ? 'archive-outline' : 'business-outline'}
              size={64}
              color={colors.textMuted}
            />
          </View>
          <Text style={styles.emptyTitle}>
            {showArchived ? 'Aucun chantier archivé' : 'Aucun chantier pour le moment'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {showArchived
              ? 'Les projets archivés apparaîtront ici.'
              : 'Créez votre premier projet pour commencer à générer des comptes rendus.'}
          </Text>
        </View>
      ) : (
        <FlashList
          data={filteredProjects}
          renderItem={renderProjectCard}
          estimatedItemSize={140}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)/projects/new' as any)}
      >
        <Ionicons name="add" size={28} color={colors.textInverse} />
      </TouchableOpacity>
    </View>
  );
}

// ---- Status Badge Component ----
function StatusBadge({ status }: { status: ProjectStatus }) {
  const isActive = status === 'active';
  return (
    <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusArchived]}>
      <View style={[styles.statusDot, { backgroundColor: isActive ? colors.success : colors.textMuted }]} />
      <Text style={[styles.statusText, { color: isActive ? colors.success : colors.textMuted }]}>
        {isActive ? 'Actif' : 'Archivé'}
      </Text>
    </View>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },

  // Filter bar
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
  },
  filterTabActive: {
    backgroundColor: colors.primaryMuted,
  },
  filterText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textMuted,
  },
  filterTextActive: {
    color: colors.primary,
  },

  // List
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 100,
  },
  separator: {
    height: spacing.sm,
  },

  // Card
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  cardTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  cardAddress: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  phaseBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  phaseBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  cardDate: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },

  // Status badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statusActive: {
    backgroundColor: colors.successMuted,
  },
  statusArchived: {
    backgroundColor: colors.surface,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Error state
  errorText: {
    fontSize: typography.sizes.lg,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textInverse,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
