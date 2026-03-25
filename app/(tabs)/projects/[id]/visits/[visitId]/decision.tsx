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
import { useCreateDecision, useUpdateDecision, useDecision } from '@/lib/hooks/useDecisions';
import { decisionSchema } from '@/lib/validation/schemas';
import { colors, spacing, typography, borderRadius } from '@/lib/theme';

const SCOPE_OPTIONS = [
  { value: 'lot_specifique', label: 'Lot spécifique' },
  { value: 'chantier_global', label: 'Chantier global' },
  { value: 'contractuel', label: 'Contractuel' },
] as const;

export default function DecisionScreen() {
  const { id: projectId, visitId, decisionId, t } = useLocalSearchParams<{
    id: string;
    visitId: string;
    decisionId?: string;
    t?: string;
  }>();

  const isEditMode = !!decisionId;
  const { data: existingDec } = useDecision(decisionId || '');

  const createMutation = useCreateDecision();
  const updateMutation = useUpdateDecision();

  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [scope, setScope] = useState('chantier_global');
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formLoaded, setFormLoaded] = useState(!isEditMode);

  // Reset form on every fresh navigation (t changes each time)
  useEffect(() => {
    if (!isEditMode) {
      setContent('');
      setAuthor('');
      setScope('chantier_global');
      setValidated(false);
      setFormLoaded(true);
    } else {
      setFormLoaded(false);
    }
  }, [decisionId, t]);

  // Pre-fill form in edit mode
  useEffect(() => {
    if (isEditMode && existingDec && !formLoaded) {
      setContent(existingDec.content || '');
      setAuthor(existingDec.author || '');
      setScope(existingDec.scope || 'chantier_global');
      setValidated(existingDec.validated || false);
      setFormLoaded(true);
    }
  }, [isEditMode, existingDec, formLoaded]);

  const handleSubmit = async () => {
    const result = decisionSchema.safeParse({ content: content.trim(), author: author.trim(), scope });
    if (!result.success) {
      const firstError = result.error.errors[0];
      Alert.alert('Validation', firstError.message);
      return;
    }

    setIsSubmitting(true);
    try {
      const decData = {
        content: content.trim(),
        author: author.trim(),
        scope,
        validated,
      };

      if (isEditMode && decisionId) {
        await updateMutation.mutateAsync({ id: decisionId, ...decData });
      } else {
        await createMutation.mutateAsync({
          visit_id: visitId!,
          ...decData,
        });
      }

      router.back();
    } catch (e: any) {
      Alert.alert('Erreur', e.message || "Impossible d'enregistrer la décision");
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
          title: isEditMode ? 'Modifier la Décision' : 'Nouvelle Décision',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: typography.weights.semibold },
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Contenu */}
        <Text style={styles.label}>CONTENU *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={content}
          onChangeText={setContent}
          placeholder="Décision prise lors de la réunion..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Auteur */}
        <Text style={styles.label}>AUTEUR *</Text>
        <TextInput
          style={styles.input}
          value={author}
          onChangeText={setAuthor}
          placeholder="Nom de l'auteur (ex: BET Structure, MOA)"
          placeholderTextColor={colors.textMuted}
        />

        {/* Portée */}
        <Text style={styles.label}>PORTÉE</Text>
        <View style={styles.scopeRow}>
          {SCOPE_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.scopeBtn,
                scope === opt.value && styles.scopeBtnActive,
              ]}
              onPress={() => setScope(opt.value)}
            >
              <Text style={[styles.scopeLabel, scope === opt.value && styles.scopeLabelActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Validée */}
        <Text style={styles.label}>STATUT</Text>
        <TouchableOpacity
          style={[styles.toggleRow, validated && styles.toggleRowActive]}
          onPress={() => setValidated(!validated)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={validated ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={validated ? '#10B981' : colors.textMuted}
          />
          <Text style={[styles.toggleLabel, validated && styles.toggleLabelActive]}>
            {validated ? 'Décision validée' : 'En attente de validation'}
          </Text>
        </TouchableOpacity>

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
                {isEditMode ? 'Modifier la décision' : 'Enregistrer la décision'}
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
  textArea: { minHeight: 100 },

  scopeRow: { flexDirection: 'row', gap: spacing.sm },
  scopeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  scopeBtnActive: { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
  scopeLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.textSecondary },
  scopeLabelActive: { color: colors.primary },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toggleRowActive: { borderColor: '#10B981', backgroundColor: '#10B98110' },
  toggleLabel: { fontSize: typography.sizes.md, color: colors.textSecondary },
  toggleLabelActive: { color: '#10B981', fontWeight: typography.weights.medium },

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
