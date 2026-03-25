import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLatestDocument, useSendReport } from '@/lib/hooks/useDocuments';
import { getProjectRecipients } from '@/lib/services/projects';
import { colors, spacing, typography, borderRadius } from '@/lib/theme';
import { formatDate } from '@/lib/utils/date';
import { ProjectRecipient } from '@/lib/types/domain';

export default function ReportScreen() {
  const { id: projectId, visitId, t } = useLocalSearchParams<{
    id: string; visitId: string; t?: string;
  }>();

  const { data: latestDoc, isLoading: docLoading } = useLatestDocument(visitId!);
  const sendReport = useSendReport();

  const [recipients, setRecipients] = useState<ProjectRecipient[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const recips = await getProjectRecipients(projectId!);
        setRecipients(recips);
        setSelected(new Set(recips.map(r => r.email)));
      } catch (_e) {}
      setLoading(false);
    })();
  }, [projectId, t]);

  const toggleRecipient = (email: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(email) ? next.delete(email) : next.add(email);
      return next;
    });
  };

  const addEmail = () => {
    const email = newEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) return;
    if (!additionalEmails.includes(email)) {
      setAdditionalEmails(prev => [...prev, email]);
    }
    setNewEmail('');
  };

  const removeAdditional = (email: string) => {
    setAdditionalEmails(prev => prev.filter(e => e !== email));
  };

  const allRecipients = [...Array.from(selected), ...additionalEmails];

  const handleSend = async () => {
    if (allRecipients.length === 0) {
      Alert.alert('Erreur', 'Sélectionnez au moins un destinataire.');
      return;
    }
    if (!latestDoc) {
      Alert.alert('Erreur', 'Aucun PDF généré. Générez d\'abord le compte rendu.');
      return;
    }

    try {
      const result = await sendReport.mutateAsync({
        visitId: visitId!,
        documentId: latestDoc.id,
        recipients: allRecipients,
      });
      Alert.alert(
        'CR Diffusé ✓',
        `Envoyé à ${result.sent_to} destinataire(s).`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Impossible d\'envoyer le CR');
    }
  };

  if (loading || docLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{
        headerShown: true,
        title: 'Diffuser le CR',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: typography.weights.semibold as any },
      }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Document info */}
        {latestDoc && (
          <View style={styles.docCard}>
            <Ionicons name="document-text" size={24} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.docTitle}>Compte Rendu N°{latestDoc.version}</Text>
              <Text style={styles.docMeta}>Généré le {formatDate(latestDoc.created_at)}</Text>
            </View>
          </View>
        )}

        {!latestDoc && (
          <View style={styles.warningCard}>
            <Ionicons name="warning-outline" size={20} color="#F59E0B" />
            <Text style={styles.warningText}>
              Aucun PDF n'a été généré. Retournez à la visite et cliquez "Générer le Compte Rendu".
            </Text>
          </View>
        )}

        {/* Project recipients */}
        <Text style={styles.label}>DESTINATAIRES DU PROJET</Text>
        {recipients.length === 0 && (
          <Text style={styles.emptyText}>Aucun destinataire configuré pour ce projet.</Text>
        )}
        {recipients.map(r => (
          <TouchableOpacity
            key={r.id}
            style={styles.recipientRow}
            onPress={() => toggleRecipient(r.email)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={selected.has(r.email) ? 'checkbox' : 'square-outline'}
              size={22}
              color={selected.has(r.email) ? colors.primary : colors.textMuted}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.recipientName}>{r.name || r.email}</Text>
              {r.name && <Text style={styles.recipientEmail}>{r.email}</Text>}
            </View>
          </TouchableOpacity>
        ))}

        {/* Additional emails */}
        <Text style={[styles.label, { marginTop: spacing.lg }]}>DESTINATAIRE ADDITIONNEL</Text>
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder="email@exemple.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            onSubmitEditing={addEmail}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addEmail}>
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        {additionalEmails.map(email => (
          <View key={email} style={styles.additionalRow}>
            <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.additionalEmail}>{email}</Text>
            <TouchableOpacity onPress={() => removeAdditional(email)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Send button */}
        <TouchableOpacity
          style={[styles.sendBtn, (!latestDoc || sendReport.isPending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!latestDoc || sendReport.isPending}
          activeOpacity={0.8}
        >
          {sendReport.isPending ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.sendBtnText}>Envoi en cours...</Text>
            </View>
          ) : (
            <>
              <Ionicons name="send" size={20} color="#FFFFFF" />
              <Text style={styles.sendBtnText}>
                Diffuser à {allRecipients.length} destinataire{allRecipients.length > 1 ? 's' : ''}
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
    fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold as any,
    color: colors.textMuted, letterSpacing: 1, marginBottom: spacing.xs, marginTop: spacing.md,
  },
  docCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
  },
  docTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold as any, color: colors.text },
  docMeta: { fontSize: typography.sizes.xs, color: colors.textMuted, marginTop: 2 },
  warningCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.md, backgroundColor: '#F59E0B10',
    borderRadius: borderRadius.md, borderWidth: 1, borderColor: '#F59E0B40',
  },
  warningText: { flex: 1, fontSize: typography.sizes.sm, color: '#F59E0B' },
  emptyText: { fontSize: typography.sizes.sm, color: colors.textMuted, fontStyle: 'italic' },
  recipientRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.sm, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  recipientName: { fontSize: typography.sizes.md, color: colors.text },
  recipientEmail: { fontSize: typography.sizes.xs, color: colors.textMuted, marginTop: 2 },
  addRow: { flexDirection: 'row', gap: spacing.sm },
  addInput: {
    flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
    fontSize: typography.sizes.md, color: colors.text,
  },
  addBtn: {
    width: 48, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
  },
  additionalRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.xs,
  },
  additionalEmail: { flex: 1, fontSize: typography.sizes.sm, color: colors.textSecondary },
  sendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, backgroundColor: colors.primary,
    borderRadius: borderRadius.md, padding: spacing.md, marginTop: spacing.xl,
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold as any, color: '#FFFFFF' },
});
