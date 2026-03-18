import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useProject,
  useArchiveProject,
  useProjectRecipients,
  useAddRecipient,
  useRemoveRecipient,
  useProjectMembers,
} from '@/lib/hooks/useProjects';
import { colors, spacing, typography, borderRadius, TOUCH_TARGET_MIN } from '@/lib/theme';

export default function ProjectSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: project } = useProject(id!);
  const { data: recipients, isLoading: recipientsLoading } = useProjectRecipients(id!);
  const { data: members, isLoading: membersLoading } = useProjectMembers(id!);
  const archiveMutation = useArchiveProject();
  const addRecipientMutation = useAddRecipient();
  const removeRecipientMutation = useRemoveRecipient();

  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');

  const handleAddRecipient = async () => {
    if (!newEmail.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une adresse email.');
      return;
    }
    try {
      await addRecipientMutation.mutateAsync({
        projectId: id!,
        email: newEmail.trim().toLowerCase(),
        name: newName.trim() || undefined,
      });
      setNewEmail('');
      setNewName('');
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || "Impossible d'ajouter le destinataire.");
    }
  };

  const handleRemoveRecipient = (recipientId: string, email: string) => {
    Alert.alert('Supprimer le destinataire ?', email, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => removeRecipientMutation.mutate({ id: recipientId, projectId: id! }),
      },
    ]);
  };

  const handleArchive = () => {
    if (!project) return;
    const isArchived = project.status === 'archived';
    Alert.alert(
      isArchived ? 'Réactiver le projet ?' : 'Archiver le projet ?',
      isArchived ? 'Le projet sera remis dans vos chantiers actifs.' : 'Le projet sera déplacé dans les archives.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: isArchived ? 'Réactiver' : 'Archiver',
          style: isArchived ? 'default' : 'destructive',
          onPress: async () => {
            await archiveMutation.mutateAsync({ id: id!, archive: !isArchived });
            router.back();
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Réglages du projet',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: typography.weights.semibold },
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Recipients Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destinataires</Text>
          <Text style={styles.sectionSubtitle}>
            Les comptes rendus seront envoyés à ces adresses.
          </Text>

          {recipientsLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
          ) : (
            <>
              {(recipients ?? []).map((r) => (
                <View key={r.id} style={styles.recipientRow}>
                  <View style={styles.recipientInfo}>
                    <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recipientEmail}>{r.email}</Text>
                      {r.name && <Text style={styles.recipientName}>{r.name}</Text>}
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveRecipient(r.id, r.email)}
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add recipient form */}
              <View style={styles.addForm}>
                <TextInput
                  style={styles.addInput}
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholder="email@exemple.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.addInput}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Nom (optionnel)"
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity
                  style={[styles.addButton, addRecipientMutation.isPending && styles.buttonDisabled]}
                  onPress={handleAddRecipient}
                  disabled={addRecipientMutation.isPending}
                >
                  {addRecipientMutation.isPending ? (
                    <ActivityIndicator size="small" color={colors.textInverse} />
                  ) : (
                    <Text style={styles.addButtonText}>Ajouter</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Members Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Membres du projet</Text>
          <Text style={styles.sectionSubtitle}>
            Les membres ont accès à ce projet et peuvent créer des visites.
          </Text>

          {membersLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
          ) : (
            <>
              {(members ?? []).map((m) => (
                <View key={m.id} style={styles.memberRow}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberInitial}>
                      {(m.profile?.full_name || m.profile?.email || '?')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{m.profile?.full_name || 'Membre'}</Text>
                    <Text style={styles.memberEmail}>{m.profile?.email}</Text>
                  </View>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{m.role}</Text>
                  </View>
                </View>
              ))}
              {(members ?? []).length === 0 && (
                <Text style={styles.emptyText}>Aucun membre ajouté.</Text>
              )}
            </>
          )}
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zone de danger</Text>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleArchive}
            activeOpacity={0.8}
          >
            <Ionicons
              name={project?.status === 'archived' ? 'refresh-outline' : 'archive-outline'}
              size={20}
              color={project?.status === 'archived' ? colors.success : colors.error}
            />
            <Text style={[styles.dangerText, { color: project?.status === 'archived' ? colors.success : colors.error }]}>
              {project?.status === 'archived' ? 'Réactiver le projet' : 'Archiver le projet'}
            </Text>
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

  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },

  // Recipients
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  recipientEmail: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  recipientName: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },

  // Add form
  addForm: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    minHeight: TOUCH_TARGET_MIN,
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  addButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textInverse,
  },

  // Members
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInitial: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  memberName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  memberEmail: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  roleBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  roleText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    fontStyle: 'italic',
  },

  // Danger zone
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dangerText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
});
