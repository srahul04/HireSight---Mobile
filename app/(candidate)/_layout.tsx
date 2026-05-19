import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function CandidateLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopWidth: 1,
          borderTopColor: '#334155',
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
        },
        headerStyle: {
          backgroundColor: '#0F172A',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#F8FAFC',
        },
        headerShown: false, // Using custom SafeArea headers in screens
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: 'Log',
          tabBarIcon: ({ color }) => <TabBarIcon name="list-alt" color={color} />,
        }}
      />
      <Tabs.Screen
        name="analyze"
        options={{
          title: 'Deep Scan',
          tabBarIcon: ({ color }) => <TabBarIcon name="bolt" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Vault',
          tabBarIcon: ({ color }) => <TabBarIcon name="folder-open" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Config',
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />

      {/* Hidden Screens (accessible via navigation) */}
      <Tabs.Screen name="browse-jobs" options={{ href: null }} />
      <Tabs.Screen name="latex-builder" options={{ href: null }} />
      <Tabs.Screen name="mock-interview" options={{ href: null }} />
      <Tabs.Screen name="linkedin" options={{ href: null }} />
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
    </Tabs>
  );
}

