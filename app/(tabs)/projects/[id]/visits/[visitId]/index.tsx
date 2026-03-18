import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Alert,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVisit, useObservations, useDeleteVisit, useDeleteObservation } from '@/lib/hooks/useVisits';
import { getPhotoUrl } from '@/lib/services/visits';
import { colors, spacing, typography, borderRadius } from '@/lib/theme';
import { formatDate } from '@/lib/utils/date';

const SEVERITY_COLORS: Record<string, string> = {
  mineur: '#3B82F6',
  majeur: '#F59E0B',
  critique: '#EF4444',
};

const SEVERITY_LABELS: Record<string, string> = {
  mineur: 'Mineur',
  majeur: 'Majeur',
  critique: 'Critique',
};

const STATUS_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  en_revue: 'En revue',
  valide: 'Validé',
  diffuse: 'Diffusé',
};

// Photo carousel for observation cards
const CARD_WIDTH = Dimensions.get('window').width - spacing.lg * 2 - 2; // minus card padding + border

function PhotoCarousel({ paths }: { paths: string[] }) {
  if (paths.length === 0) return null;
  if (paths.length === 1) {
    return (
      <Image
        source={{ uri: getPhotoUrl(paths[0]) }}
        style={thumbStyles.single}
        resizeMode="cover"
      />
    );
  }
  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      style={thumbStyles.carousel}
    >
      {paths.map((p, i) => (
        <Image
          key={i}
          source={{ uri: getPhotoUrl(p) }}
          style={thumbStyles.carouselItem}
          resizeMode="cover"
        />
      ))}
    </ScrollView>
  );
}

const thumbStyles = StyleSheet.create({
  single: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
  },
  carousel: { height: 180 },
  carouselItem: {
    width: CARD_WIDTH,
    height: 180,
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
  },
});

export default function VisitDetailScreen() {
  const { id: projectId, visitId } = useLocalSearchParams<{ id: string; visitId: string }>();
  const { data: visit, isLoading: loadingVisit, error: errorVisit } = useVisit(visitId!);
  const { data: observations, isLoading: loadingObs, refetch, isRefetching } = useObservations(visitId!);
  const deleteMutation = useDeleteVisit();
  const deleteObsMutation = useDeleteObservation();

  const handleRefresh = useCallback(() => { refetch(); }, [refetch]);

  const handleDelete = () => {
    Alert.alert(
      'Supprimer la visite',
      'Cette action est irréversible. Toutes les observations et photos seront supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(visitId!);
              router.back();
            } catch (e: any) {
              Alert.alert('Erreur', e.message);
            }
          },
        },
      ]
    );
  };

  const handleObservationLongPress = (obsId: string) => {
    Alert.alert(
      'Action',
      'Que souhaitez-vous faire ?',
      [
        {
          text: 'Modifier',
          onPress: () => router.push(`/(tabs)/projects/${projectId}/visits/${visitId}/observation?observationId=${obsId}` as any),
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmer la suppression',
              'Cette observation et ses photos seront supprimées.',
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Supprimer',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deleteObsMutation.mutateAsync(obsId);
                      refetch();
                    } catch (e: any) {
                      Alert.alert('Erreur', e.message);
                    }
                  },
                },
              ]
            );
          },
        },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  if (loadingVisit) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (errorVisit || !visit) {
    return (
      <View style={styles.centered}>
        <Ionicons name="warning-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>Visite introuvable</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const VISIT_TYPE_LABELS: Record<string, string> = {
    chantier: 'Visite de chantier',
    reception: 'Réception',
    levee_reserves: 'Levée de réserves',
  };

  const renderObservationCard = ({ item }: { item: any }) => {
    const severityColor = SEVERITY_COLORS[item.severity] || colors.textMuted;
    const hasPhotos = item.photo_paths && item.photo_paths.length > 0;
    return (
      <TouchableOpacity
        style={[styles.obsCard, { borderLeftColor: severityColor, borderLeftWidth: 4 }]}
        onPress={() => router.push(`/(tabs)/projects/${projectId}/visits/${visitId}/observation?observationId=${item.id}` as any)}
        onLongPress={() => handleObservationLongPress(item.id)}
        activeOpacity={0.7}
      >
        {hasPhotos && (
          <PhotoCarousel paths={item.photo_paths} />
        )}
        <View style={styles.obsCardContent}>
          <View style={styles.obsHeader}>
            <View style={styles.obsTags}>
              {item.lot ? (
                <View style={styles.obsTag}>
                  <Text style={styles.obsTagText}>{item.lot}</Text>
                </View>
              ) : null}
              {item.zone ? (
                <View style={styles.obsTag}>
                  <Text style={styles.obsTagText}>{item.zone}</Text>
                </View>
              ) : null}
            </View>
            <View style={[styles.severityBadge, { backgroundColor: severityColor + '20' }]}>
              <Text style={[styles.severityText, { color: severityColor }]}>
                {SEVERITY_LABELS[item.severity] || item.severity}
              </Text>
            </View>
          </View>
          <Text style={styles.obsDescription} numberOfLines={2}>{item.description}</Text>
          {item.evidence_count > 0 && (
            <View style={styles.obsFooter}>
              <Ionicons name="camera-outline" size={14} color={colors.textMuted} />
              <Text style={styles.obsFooterText}>
                {item.evidence_count} photo{item.evidence_count > 1 ? 's' : ''}
                {item.photo_paths?.length > 1 ? ` · Glissez →` : ''}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Détail de la visite',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: typography.weights.semibold },
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} hitSlop={8}>
              <Ionicons name="trash-outline" size={22} color={colors.error} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <FlatList
          data={observations ?? []}
          renderItem={renderObservationCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListHeaderComponent={
            <>
              {/* Visit Info Card */}
              <View style={styles.visitCard}>
                <View style={styles.visitCardRow}>
                  <Text style={styles.visitType}>
                    {VISIT_TYPE_LABELS[visit.type] || visit.type}
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{STATUS_LABELS[visit.status]}</Text>
                  </View>
                </View>
                <Text style={styles.visitDate}>{formatDate(visit.date)}</Text>

                {visit.weather && (
                  <View style={styles.visitInfoRow}>
                    <Ionicons name="partly-sunny-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.visitInfoText}>{visit.weather}</Text>
                  </View>
                )}

                {visit.participants && visit.participants.length > 0 && (
                  <View style={styles.visitInfoRow}>
                    <Ionicons name="people-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.visitInfoText}>{visit.participants.join(', ')}</Text>
                  </View>
                )}

                {visit.summary && (
                  <Text style={styles.visitSummary}>{visit.summary}</Text>
                )}
              </View>

              {/* Observations Section Header */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Observations {observations && observations.length > 0 ? `(${observations.length})` : ''}
                </Text>
              </View>
            </>
          }
          ListEmptyComponent={
            loadingObs ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: spacing.lg }} />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="eye-outline" size={40} color={colors.textMuted} />
                <Text style={styles.placeholderTitle}>Aucune observation</Text>
                <Text style={styles.placeholderSubtitle}>
                  Ajoutez des observations pour documenter cette visite.
                </Text>
              </View>
            )
          }
        />

        {/* FAB — Add Observation */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push(`/(tabs)/projects/${projectId}/visits/${visitId}/observation` as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.md, paddingBottom: 100 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { fontSize: typography.sizes.lg, color: colors.text, marginTop: spacing.md, marginBottom: spacing.md },
  backBtn: { backgroundColor: colors.surface, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  backBtnText: { color: colors.text, fontSize: typography.sizes.md },

  // Visit info card
  visitCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  visitCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  visitType: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  statusBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  visitDate: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  visitInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  visitInfoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  visitSummary: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 22,
  },

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

  // Observation cards
  obsCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  obsCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  obsCardContent: {
    flex: 1,
  },
  obsThumb: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
  },
  obsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  obsTags: { flexDirection: 'row', gap: spacing.xs },
  obsTag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  obsTagText: { fontSize: typography.sizes.xs, color: colors.textSecondary, fontWeight: typography.weights.medium },
  severityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  severityText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold },
  obsDescription: {
    fontSize: typography.sizes.md,
    color: colors.text,
    lineHeight: 20,
  },
  obsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  obsFooterText: { fontSize: typography.sizes.xs, color: colors.textMuted },

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
  placeholderTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.medium, color: colors.textSecondary, marginTop: spacing.sm },
  placeholderSubtitle: { fontSize: typography.sizes.sm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs },

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
