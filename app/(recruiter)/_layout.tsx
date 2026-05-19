import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function RecruiterLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#818CF8', // Indigo for recruiter
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
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Admin',
          tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Missions',
          tabBarIcon: ({ color }) => <TabBarIcon name="briefcase" color={color} />,
        }}
      />
      <Tabs.Screen
        name="candidates"
        options={{
          title: 'Talent',
          tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
        }}
      />
      
      {/* Utility Screens */}
      <Tabs.Screen name="jd-forge" options={{ href: null }} />
      <Tabs.Screen name="candidate-audit" options={{ href: null }} />
      <Tabs.Screen name="post-job" options={{ href: null }} />
      <Tabs.Screen name="pipeline" options={{ href: null }} />
    </Tabs>
  );
}

