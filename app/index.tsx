import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '@/lib/hooks/useAuth';
import { colors } from '@/lib/theme';

// Keep splash screen visible until auth state is determined
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { session, initialized, initialize } = useAuth();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized]);

  useEffect(() => {
    if (initialized) {
      SplashScreen.hideAsync();
    }
  }, [initialized]);

  // Still loading — show spinner (splash screen hides behind it)
  if (!initialized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Auth state determined — redirect
  if (session) {
    return <Redirect href={'/(tabs)' as any} />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
