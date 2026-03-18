import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Index() {
  const { session, initialized } = useAuth();

  if (!initialized) {
    return null; // AuthGate in _layout handles the loading spinner
  }

  if (session) {
    return <Redirect href={'/(tabs)/projects/index' as any} />;
  }

  return <Redirect href="/(auth)/login" />;
}
