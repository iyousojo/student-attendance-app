import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';

export default function TabLayout() {
  const [role, setRole] = useState('student');

  useEffect(() => {
    const getRole = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          const parsed = JSON.parse(userData);
          setRole(parsed.role);
        }
      } catch (e) {
        console.error("Failed to load role", e);
      }
    };
    getRole();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#f5a623', 
        tabBarInactiveTintColor: '#64748b', 
        tabBarStyle: {
          backgroundColor: '#000000', 
          borderTopWidth: 0,
          elevation: 20,
          height: 90,
          paddingBottom: 30,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'DASHBOARD',
          tabBarIcon: ({ color }) => <Feather name="grid" size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="action"
        options={{
          title: role === 'professor' ? 'CREATE' : 'SCAN',
          tabBarIcon: ({ color }) => (
            <Feather 
              name={role === 'professor' ? "plus-circle" : "maximize"} 
              size={26} 
              color={color} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: 'HISTORY',
          tabBarIcon: ({ color }) => <Feather name="list" size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ color }) => <Feather name="user" size={22} color={color} />,
        }}
      />
      
      {/* NO MORE EXCLUSION LIST HERE. 
          If you see a warning for "scan", it's because a file named "scan.js" 
          still exists inside the (tabs) folder. Delete it or move it! */}
    </Tabs>
  );
}