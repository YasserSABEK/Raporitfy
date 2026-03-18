// +native-intent.tsx
// This file intercepts incoming native deep links BEFORE Expo Router processes them.
// It fixes the "Unmatched Route" error caused by the custom scheme "raporitfy:///"
// which Expo Router can't match to any file-based route.
//
// See: https://docs.expo.dev/router/advanced/native-intent/

export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}) {
  try {
    // When the app launches or receives a deep link with just the scheme
    // (e.g., raporitfy:/// or raporitfy://), redirect to the index route
    if (path === '/' || path === '' || path === '///') {
      return '/';
    }

    // For any other deep link, let Expo Router handle it normally
    return path;
  } catch {
    // Never crash inside this function — redirect to index as fallback
    return '/';
  }
}
