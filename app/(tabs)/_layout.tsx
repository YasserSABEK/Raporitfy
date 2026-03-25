import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '@/lib/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: typography.weights.semibold,
          fontSize: typography.sizes.xl,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 88,
          paddingBottom: 30,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: typography.sizes.xs,
          fontWeight: typography.weights.medium,
        },
      }}
    >
      <Tabs.Screen
        name="projects/index"
        options={{
          title: 'Chantiers',
          headerTitle: 'Mes Chantiers',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="actions/index"
        options={{
          title: 'Actions',
          headerTitle: 'Actions',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="clipboard-outline" size={size} color={color} />
          ),
        }}
      />
      {/* Hide non-tab screens from bottom bar */}
      <Tabs.Screen name="projects/new" options={{ href: null }} />
      <Tabs.Screen name="projects/[id]/index" options={{ href: null }} />
      <Tabs.Screen name="projects/[id]/settings" options={{ href: null }} />
      <Tabs.Screen name="projects/[id]/visits/new" options={{ href: null }} />
      <Tabs.Screen name="projects/[id]/visits/[visitId]/index" options={{ href: null }} />
      <Tabs.Screen name="projects/[id]/visits/[visitId]/observation" options={{ href: null }} />
      <Tabs.Screen name="projects/[id]/visits/[visitId]/decision" options={{ href: null }} />
      <Tabs.Screen name="projects/[id]/visits/[visitId]/action" options={{ href: null }} />
      <Tabs.Screen name="projects/[id]/visits/[visitId]/report" options={{ href: null }} />
    </Tabs>
  );
}
