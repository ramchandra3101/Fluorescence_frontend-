import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme: 'light' | 'dark' = useColorScheme() ?? 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
            backgroundColor:  'rgba(255, 255, 255, 0.8)',
          },
          android:{
            backgroundColor: Colors[colorScheme].background,
            elevation: 0,
          },
          default: {},
        }),
      }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="preview"
        options={{
          title: 'Preview',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bag.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Results',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.doc.horizontal.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="AIresults"
        options={{
          title: 'AI',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.doc.horizontal.fill" color={color} />,
        }}
      />



    </Tabs>
  );
}
