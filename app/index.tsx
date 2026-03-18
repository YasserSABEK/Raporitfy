import { Redirect } from 'expo-router';

// IMPORTANT: This file must have ZERO imports from @/lib/
// The expo-secure-store / supabase import chain crashes during
// module evaluation in Expo Go SDK 55, which prevents this route
// from registering and causes "Unmatched Route".
//
// Auth redirect is handled by login.tsx (router.replace on success).
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}