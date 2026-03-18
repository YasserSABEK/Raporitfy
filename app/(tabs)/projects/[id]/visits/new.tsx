import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCreateVisit } from '@/lib/hooks/useVisits';
import { colors, spacing, typography, borderRadius } from '@/lib/theme';

const VISIT_TYPES = [
  { value: 'chantier', label: 'Visite de chantier', icon: 'construct-outline' },
  { value: 'reception', label: 'Réception', icon: 'checkmark-circle-outline' },
  { value: 'levee_reserves', label: 'Levée de réserves', icon: 'clipboard-outline' },
] as const;

export default function NewVisitScreen() {
  const { id: projectId, t } = useLocalSearchParams<{ id: string; t?: string }>();
  const createMutation = useCreateVisit();

  const [type, setType] = useState<string>('chantier');
  const [weather, setWeather] = useState('');
  const [summary, setSummary] = useState('');
  const [participants, setParticipants] = useState('');

  // Reset form on every fresh navigation
  useEffect(() => {
    setType('chantier');
    setWeather('');
    setSummary('');
    setParticipants('');
  }, [t]);

  const today = new Date().toISOString().split('T')[0];

  const handleCreate = async () => {
    if (!projectId) return;

    try {
      const participantsList = participants
        .split(',')
        .map(p => p.trim())
        .filter(Boolean);

      const visit = await createMutation.mutateAsync({
        project_id: projectId,
        date: today,
        type,
        weather: weather.trim() || undefined,
        summary: summary.trim() || undefined,
        participants: participantsList,
      });

      router.replace(`/(tabs)/projects/${projectId}/visits/${visit.id}` as any);
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Impossible de créer la visite');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Nouvelle Visite',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: typography.weights.semibold },
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Visit Type Selector */}
        <Text style={styles.label}>TYPE DE VISITE</Text>
        <View style={styles.typeGrid}>
          {VISIT_TYPES.map(vt => (
            <TouchableOpacity
              key={vt.value}
              style={[styles.typeCard, type === vt.value && styles.typeCardActive]}
              onPress={() => setType(vt.value)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={vt.icon as any}
                size={24}
                color={type === vt.value ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.typeLabel, type === vt.value && styles.typeLabelActive]}>
                {vt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date (read-only, today) */}
        <Text style={styles.label}>DATE</Text>
        <View style={styles.readOnlyField}>
          <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
          <Text style={styles.readOnlyText}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* Weather */}
        <Text style={styles.label}>MÉTÉO</Text>
        <TextInput
          style={styles.input}
          value={weather}
          onChangeText={setWeather}
          placeholder="Ex: Ensoleillé, 22°C"
          placeholderTextColor={colors.textMuted}
        />

        {/* Participants */}
        <Text style={styles.label}>PARTICIPANTS</Text>
        <TextInput
          style={styles.input}
          value={participants}
          onChangeText={setParticipants}
          placeholder="Noms séparés par des virgules"
          placeholderTextColor={colors.textMuted}
        />
        <Text style={styles.hint}>Ex: Jean Dupont, Marie Martin, Paul Bernard</Text>

        {/* Summary */}
        <Text style={styles.label}>RÉSUMÉ / AGENDA</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={summary}
          onChangeText={setSummary}
          placeholder="Points à aborder, résumé de la visite..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, createMutation.isPending && styles.submitButtonDisabled]}
          onPress={handleCreate}
          disabled={createMutation.isPending}
          activeOpacity={0.8}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.submitText}>Créer la visite</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },

  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },

  typeGrid: { gap: spacing.sm },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  typeLabel: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  typeLabelActive: { color: colors.primary },

  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  readOnlyText: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },

  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
  },
  hint: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 4,
  },

  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: '#FFFFFF',
  },
});
