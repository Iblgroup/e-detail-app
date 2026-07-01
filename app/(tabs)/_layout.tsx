import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Default tab after entering (tabs) is Analytics.
export const unstable_settings = {
  initialRouteName: 'analytics',
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: { fontSize: 14 },
      }}>
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="chart.bar.xaxis" color={color} />,
        }}
      />
      <Tabs.Screen
        name="planned-calls"
        options={{
          title: 'Planned',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="calendar.badge.checkmark" color={color} />,
        }}
      />
      <Tabs.Screen
        name="unplanned-calls"
        options={{
          title: 'Unplanned',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.wave.2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="gearshape.fill" color={color} />,
        }}
      />

      {/* Doctor detail lives inside the tabs so the bottom nav stays visible. */}
      <Tabs.Screen
        name="doctor/[id]"
        options={{ href: null }}
      />

      {/* Call analytics lives inside the tabs so the bottom nav stays visible. */}
      <Tabs.Screen
        name="call-analytics/[id]"
        options={{ href: null }}
      />

      {/* Dashboard hidden for now (route kept; tab removed via href: null). */}
      <Tabs.Screen
        name="index"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="faqs"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="ai-trainer"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />
    </Tabs>
  );
}
