import { Redirect } from 'expo-router';

export default function Index() {
  // Root index just redirects — the auth guard in _layout.tsx handles the logic
  return <Redirect href="/(auth)/login" />;
}
