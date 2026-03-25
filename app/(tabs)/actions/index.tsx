import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAllOpenActions, useUpdateAction } from '@/lib/hooks/useActions';
import { colors, spacing, typography, borderRadius } from '@/lib/theme';
import { formatDate } from '@/lib/utils/date';
import { ActionPriority, ActionStatus } from '@/lib/types/domain';

const PRIORITY_COLORS: Record<string, string> = {
  basse: '#6B7280',
  moyenne: '#F59E0B',
  haute: '#EF4444',
  urgente: '#DC2626',
};

const STATUS_LABELS: Record<string, string> = {
  ouverte: 'Ouverte',
  en_cours: 'En cours',
  fermee: 'Fermée',
  reportee: 'Reportée',
};

const STATUS_COLORS: Record<string, string> = {
  ouverte: '#6B7280',
  en_cours: '#3B82F6',
  fermee: '#10B981',
  reportee: '#F59E0B',
};

type StatusFilter = 'ouverte' | 'en_cours' | 'toutes';

function getDeadlineInfo(deadline: string | null): { label: string; color: string; isLate: boolean } {
  if (!deadline) return { label: "Pas d'échéance", color: colors.textMuted, isLate: false };
  const d = new Date(deadline);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: `En retard · J+${Math.abs(diff)}`, color: '#EF4444', isLate: true };
  if (diff <= 3) return { label: formatDate(deadline), color: '#F59E0B', isLate: false };
  return { label: formatDate(deadline), color: '#10B981', isLate: false };
}

export default function ActionsScreen() {
  const { data: allActions, isLoading, refetch, isRefetching } = useAllOpenActions();
  const updateMutation = useUpdateAction();

  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ouverte');

  const projectNames = useMemo(() => {
    if (!allActions) return [];
    return [...new Set(allActions.map(a => a.project_name).filter(Boolean))];
  }, [allActions]);

  const filteredActions = useMemo(() => {
    let items = allActions ?? [];
    if (selectedProject) items = items.filter(a => a.project_name === selectedProject);
    if (selectedStatus !== 'toutes') items = items.filter(a => a.status === selectedStatus);
    return items;
  }, [allActions, selectedProject, selectedStatus]);

  const handleRefresh = useCallback(() => { refetch(); }, [refetch]);

  const handleLongPress = (actionId: string) => {
    Alert.alert(
      'Changer le statut',
      'Sélectionnez le nouveau statut :',
      [
        { text: 'Ouverte', onPress: () => updateMutation.mutate({ id: actionId, status: 'ouverte' }) },
        { text: 'En cours', onPress: () => updateMutation.mutate({ id: actionId, status: 'en_cours' }) },
        { text: 'Fermée', onPress: () => updateMutation.mutate({ id: actionId, status: 'fermee' }) },
        { text: 'Reportée', onPress: () => updateMutation.mutate({ id: actionId, status: 'reportee' }) },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const renderActionCard = ({ item }: { item: any }) => {
    const dl = getDeadlineInfo(item.deadline);
    const prColor = PRIORITY_COLORS[item.priority] || '#6B7280';
    const stColor = STATUS_COLORS[item.status] || '#6B7280';

    return (
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: prColor, borderLeftWidth: 4 }]}
        onPress={() => router.push(`/(tabs)/projects/${item.project_id}/visits/${item.visit_id}?t=${Date.now()}` as any)}
        onLongPress={() => handleLongPress(item.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.cardProject}>{item.project_name}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.cardRow}>
            <Ionicons name="person-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.cardMeta}>{item.owner}</Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="calendar-outline" size={12} color={dl.color} />
            <Text style={[styles.cardMeta, { color: dl.color }]}>{dl.label}</Text>
          </View>
        </View>
        <View style={styles.cardBadgeRow}>
          <View style={[styles.badge, { backgroundColor: stColor + '20' }]}>
            <Text style={[styles.badgeText, { color: stColor }]}>{STATUS_LABELS[item.status] || item.status}</Text>
          </View>
          {dl.isLate && (
            <View style={[styles.badge, { backgroundColor: '#EF444420' }]}>
              <Text style={[styles.badgeText, { color: '#EF4444' }]}>En retard</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
    { key: 'ouverte', label: 'Ouvertes' },
    { key: 'en_cours', label: 'En cours' },
    { key: 'toutes', label: 'Toutes' },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Suivi des actions',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: typography.weights.semibold, fontSize: typography.sizes.xl },
        }}
      />
      <View style={styles.container}>
        <FlatList
          data={filteredActions}
          renderItem={renderActionCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListHeaderComponent={
            <View style={styles.filterContainer}>
              {/* Project chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectChipScroll}>
                <TouchableOpacity
                  style={[styles.projectChip, !selectedProject && styles.projectChipActive]}
                  onPress={() => setSelectedProject(null)}
                >
                  <Text style={[styles.projectChipText, !selectedProject && styles.projectChipTextActive]}>Tous</Text>
                </TouchableOpacity>
                {projectNames.map(name => (
                  <TouchableOpacity
                    key={name}
                    style={[styles.projectChip, selectedProject === name && styles.projectChipActive]}
                    onPress={() => setSelectedProject(selectedProject === name ? null : name)}
                  >
                    <Text style={[styles.projectChipText, selectedProject === name && styles.projectChipTextActive]}>
                      {name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Status segment */}
              <View style={styles.statusSegment}>
                {STATUS_FILTERS.map(f => (
                  <TouchableOpacity
                    key={f.key}
                    style={[styles.statusBtn, selectedStatus === f.key && styles.statusBtnActive]}
                    onPress={() => setSelectedStatus(f.key)}
                  >
                    <Text style={[styles.statusBtnText, selectedStatus === f.key && styles.statusBtnTextActive]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          ListEmptyComponent={
            isLoading ? null : (
              <View style={styles.emptyContainer}>
                <Ionicons name="clipboard-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>
                  {allActions && allActions.length > 0
                    ? 'Aucune action ne correspond aux filtres sélectionnés.'
                    : 'Aucune action en cours'}
                </Text>
                {(!allActions || allActions.length === 0) && (
                  <Text style={styles.emptySubtitle}>
                    Les actions créées lors de vos visites de chantier apparaîtront ici.
                  </Text>
                )}
              </View>
            )
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.md, paddingBottom: 100 },

  // Filters
  filterContainer: { marginBottom: spacing.md },
  projectChipScroll: { marginBottom: spacing.sm },
  projectChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  projectChipActive: { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
  projectChipText: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  projectChipTextActive: { color: colors.primary, fontWeight: typography.weights.medium },

  statusSegment: { flexDirection: 'row', gap: spacing.xs },
  statusBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  statusBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  statusBtnText: { fontSize: typography.sizes.sm, color: colors.textSecondary, fontWeight: typography.weights.medium },
  statusBtnTextActive: { color: '#FFFFFF' },

  // Cards
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardProject: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: typography.sizes.md,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardMeta: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  cardBadgeRow: { flexDirection: 'row', gap: spacing.xs },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  badgeText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
