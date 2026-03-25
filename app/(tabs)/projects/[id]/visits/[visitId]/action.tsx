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
import { useCreateAction, useUpdateAction, useAction } from '@/lib/hooks/useActions';
import { actionSchema } from '@/lib/validation/schemas';
import { colors, spacing, typography, borderRadius } from '@/lib/theme';
import { ActionPriority } from '@/lib/types/domain';

const PRIORITY_OPTIONS: { value: ActionPriority; label: string; color: string }[] = [
  { value: 'basse', label: 'Basse', color: '#6B7280' },
  { value: 'moyenne', label: 'Moyenne', color: '#F59E0B' },
  { value: 'haute', label: 'Haute', color: '#EF4444' },
  { value: 'urgente', label: 'Urgente', color: '#DC2626' },
];

export default function ActionScreen() {
  const { id: projectId, visitId, actionId, observationId, decisionId: linkedDecisionId, t } = useLocalSearchParams<{
    id: string;
    visitId: string;
    actionId?: string;
    observationId?: string;
    decisionId?: string;
    t?: string;
  }>();

  const isEditMode = !!actionId;
  const { data: existingAction } = useAction(actionId || '');

  const createMutation = useCreateAction();
  const updateMutation = useUpdateAction();

  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<ActionPriority>('moyenne');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formLoaded, setFormLoaded] = useState(!isEditMode);

  // Reset form on every fresh navigation
  useEffect(() => {
    if (!isEditMode) {
      setDescription('');
      setOwner('');
      setDeadline('');
      setPriority('moyenne');
      setFormLoaded(true);
    } else {
      setFormLoaded(false);
    }
  }, [actionId, t]);

  // Pre-fill in edit mode
  useEffect(() => {
    if (isEditMode && existingAction && !formLoaded) {
      setDescription(existingAction.description || '');
      setOwner(existingAction.owner || '');
      setDeadline(existingAction.deadline || '');
      setPriority(existingAction.priority || 'moyenne');
      setFormLoaded(true);
    }
  }, [isEditMode, existingAction, formLoaded]);

  const handleSubmit = async () => {
    const result = actionSchema.safeParse({
      description: description.trim(),
      owner: owner.trim(),
      deadline: deadline.trim() || undefined,
      priority,
    });
    if (!result.success) {
      const firstError = result.error.errors[0];
      Alert.alert('Validation', firstError.message);
      return;
    }

    setIsSubmitting(true);
    try {
      const actData: any = {
        description: description.trim(),
        owner: owner.trim(),
        priority,
      };
      if (deadline.trim()) actData.deadline = deadline.trim();

      if (isEditMode && actionId) {
        await updateMutation.mutateAsync({ id: actionId, ...actData });
      } else {
        actData.visit_id = visitId!;
        if (observationId) actData.observation_id = observationId;
        if (linkedDecisionId) actData.decision_id = linkedDecisionId;
        await createMutation.mutateAsync(actData);
      }

      router.back();
    } catch (e: any) {
      Alert.alert('Erreur', e.message || "Impossible d'enregistrer l'action");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditMode && !formLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: isEditMode ? "Modifier l'Action" : 'Nouvelle Action',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: typography.weights.semibold },
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Pre-link indicator */}
        {observationId && !isEditMode && (
          <View style={styles.linkBadge}>
            <Ionicons name="link" size={16} color={colors.primary} />
            <Text style={styles.linkBadgeText}>Liée à une observation</Text>
          </View>
        )}
        {linkedDecisionId && !isEditMode && (
          <View style={styles.linkBadge}>
            <Ionicons name="link" size={16} color={colors.primary} />
            <Text style={styles.linkBadgeText}>Liée à une décision</Text>
          </View>
        )}

        {/* Description */}
        <Text style={styles.label}>DESCRIPTION *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Action à réaliser..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Responsable */}
        <Text style={styles.label}>RESPONSABLE *</Text>
        <TextInput
          style={styles.input}
          value={owner}
          onChangeText={setOwner}
          placeholder="Entreprise ou personne (ex: SARL Martin - Plomberie)"
          placeholderTextColor={colors.textMuted}
        />

        {/* Échéance */}
        <Text style={styles.label}>ÉCHÉANCE</Text>
        <TextInput
          style={styles.input}
          value={deadline}
          onChangeText={setDeadline}
          placeholder="AAAA-MM-JJ (ex: 2026-04-15)"
          placeholderTextColor={colors.textMuted}
          keyboardType="numbers-and-punctuation"
        />

        {/* Priorité */}
        <Text style={styles.label}>PRIORITÉ</Text>
        <View style={styles.priorityRow}>
          {PRIORITY_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.priorityBtn,
                priority === opt.value && {
                  backgroundColor: opt.color + '20',
                  borderColor: opt.color,
                },
              ]}
              onPress={() => setPriority(opt.value)}
            >
              <View style={[styles.priorityDot, { backgroundColor: opt.color }]} />
              <Text
                style={[
                  styles.priorityLabel,
                  priority === opt.value && { color: opt.color },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <View style={styles.submitLoading}>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.submitText}>Enregistrement...</Text>
            </View>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.submitText}>
                {isEditMode ? "Modifier l'action" : "Enregistrer l'action"}
              </Text>
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

  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  textArea: { minHeight: 80 },

  linkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.sm,
  },
  linkBadgeText: { fontSize: typography.sizes.sm, color: colors.primary, fontWeight: typography.weights.medium },

  priorityRow: { flexDirection: 'row', gap: spacing.xs },
  priorityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityLabel: { fontSize: typography.sizes.xs, fontWeight: typography.weights.medium, color: colors.textSecondary },

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
  submitDisabled: { opacity: 0.6 },
  submitLoading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  submitText: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: '#FFFFFF' },
});
