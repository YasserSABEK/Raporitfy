import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCreateObservation, useAddEvidence } from '@/lib/hooks/useVisits';
import { uploadPhoto } from '@/lib/services/visits';
import { colors, spacing, typography, borderRadius } from '@/lib/theme';

const SEVERITY_OPTIONS = [
  { value: 'mineur', label: 'Mineur', color: '#3B82F6' },
  { value: 'majeur', label: 'Majeur', color: '#F59E0B' },
  { value: 'critique', label: 'Critique', color: '#EF4444' },
] as const;

const LOT_SUGGESTIONS = [
  'Gros œuvre', 'Plomberie', 'Électricité', 'Menuiserie',
  'Peinture', 'Façade', 'Toiture', 'Carrelage',
];

const MAX_PHOTOS = 15;

export default function ObservationScreen() {
  const { id: projectId, visitId } = useLocalSearchParams<{ id: string; visitId: string }>();
  const createMutation = useCreateObservation();
  const addEvidenceMutation = useAddEvidence();

  const [lot, setLot] = useState('');
  const [zone, setZone] = useState('');
  const [severity, setSeverity] = useState<string>('mineur');
  const [description, setDescription] = useState('');
  const [classification, setClassification] = useState<string>('constat');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const requestPermission = async (type: 'camera' | 'library') => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', "L'accès à la caméra est nécessaire pour prendre des photos.");
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', "L'accès à la galerie est nécessaire pour sélectionner des photos.");
        return false;
      }
    }
    return true;
  };

  const takePhoto = async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Limite atteinte', `Maximum ${MAX_PHOTOS} photos par observation.`);
      return;
    }
    if (!(await requestPermission('camera'))) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos(prev => [...prev, result.assets[0].uri]);
    }
  };

  const pickFromGallery = async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Limite atteinte', `Maximum ${MAX_PHOTOS} photos par observation.`);
      return;
    }
    if (!(await requestPermission('library'))) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
    });

    if (!result.canceled) {
      setPhotos(prev => [...prev, ...result.assets.map(a => a.uri)].slice(0, MAX_PHOTOS));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!visitId || !description.trim()) {
      Alert.alert('Champ requis', 'La description est obligatoire (min. 5 caractères).');
      return;
    }
    if (description.trim().length < 5) {
      Alert.alert('Description trop courte', 'Minimum 5 caractères.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create observation
      const obs = await createMutation.mutateAsync({
        visit_id: visitId,
        lot: lot.trim(),
        zone: zone.trim(),
        description: description.trim(),
        severity,
        classification,
      });

      // 2. Upload photos in parallel (max 3 concurrent)
      if (photos.length > 0) {
        const MAX_CONCURRENT = 3;
        let completed = 0;

        for (let i = 0; i < photos.length; i += MAX_CONCURRENT) {
          const batch = photos.slice(i, i + MAX_CONCURRENT);
          const results = await Promise.allSettled(
            batch.map(uri => uploadPhoto(uri))
          );

          for (const result of results) {
            completed++;
            setUploadProgress(`Envoi ${completed}/${photos.length}...`);
            if (result.status === 'fulfilled') {
              await addEvidenceMutation.mutateAsync({
                observation_id: obs.id,
                type: 'photo',
                file_url: result.value,
              });
            }
          }
        }
      }

      router.back();
    } catch (e: any) {
      Alert.alert('Erreur', e.message || "Impossible d'enregistrer l'observation");
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Nouvelle Observation',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: typography.weights.semibold },
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Lot */}
        <Text style={styles.label}>LOT</Text>
        <TextInput
          style={styles.input}
          value={lot}
          onChangeText={setLot}
          placeholder="Ex: Gros œuvre, Plomberie..."
          placeholderTextColor={colors.textMuted}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {LOT_SUGGESTIONS.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, lot === s && styles.chipActive]}
              onPress={() => setLot(s)}
            >
              <Text style={[styles.chipText, lot === s && styles.chipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Zone */}
        <Text style={styles.label}>ZONE</Text>
        <TextInput
          style={styles.input}
          value={zone}
          onChangeText={setZone}
          placeholder="Ex: RDC, Étage 1, Toiture..."
          placeholderTextColor={colors.textMuted}
        />

        {/* Severity */}
        <Text style={styles.label}>SÉVÉRITÉ</Text>
        <View style={styles.severityRow}>
          {SEVERITY_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.severityBtn,
                severity === opt.value && { backgroundColor: opt.color + '20', borderColor: opt.color },
              ]}
              onPress={() => setSeverity(opt.value)}
            >
              <View style={[styles.severityDot, { backgroundColor: opt.color }]} />
              <Text style={[styles.severityLabel, severity === opt.value && { color: opt.color }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text style={styles.label}>DESCRIPTION *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Décrivez l'observation en détail..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Photos */}
        <Text style={styles.label}>PHOTOS ({photos.length}/{MAX_PHOTOS})</Text>
        <View style={styles.photoActions}>
          <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
            <Ionicons name="camera" size={20} color={colors.primary} />
            <Text style={styles.photoBtnText}>Caméra</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoBtn} onPress={pickFromGallery}>
            <Ionicons name="images" size={20} color={colors.primary} />
            <Text style={styles.photoBtnText}>Galerie</Text>
          </TouchableOpacity>
        </View>

        {photos.length > 0 && (
          <View style={styles.photoGrid}>
            {photos.map((uri, i) => (
              <View key={i} style={styles.photoWrapper}>
                <Image source={{ uri }} style={styles.photoThumb} />
                <TouchableOpacity style={styles.photoDelete} onPress={() => removePhoto(i)}>
                  <Ionicons name="close-circle" size={22} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

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
              <Text style={styles.submitText}>
                {uploadProgress || 'Enregistrement...'}
              </Text>
            </View>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.submitText}>Enregistrer l'observation</Text>
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

  chips: { marginTop: spacing.xs, marginBottom: spacing.xs },
  chip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
  chipText: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  chipTextActive: { color: colors.primary, fontWeight: typography.weights.medium },

  severityRow: { flexDirection: 'row', gap: spacing.sm },
  severityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  severityDot: { width: 10, height: 10, borderRadius: 5 },
  severityLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.textSecondary },

  photoActions: { flexDirection: 'row', gap: spacing.sm },
  photoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoBtnText: { fontSize: typography.sizes.md, color: colors.primary, fontWeight: typography.weights.medium },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  photoWrapper: { position: 'relative' },
  photoThumb: { width: 80, height: 80, borderRadius: borderRadius.md },
  photoDelete: { position: 'absolute', top: -6, right: -6 },

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
