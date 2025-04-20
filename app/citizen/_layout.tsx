import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { MapPin, List, Bell,Plus, CircleUser as UserCircle } from 'lucide-react-native';

interface TabBarIconProps {
  color: string;
  size: number;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#eee',
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_400Regular',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          //title: 'Home',
          tabBarIcon: ({ color }: TabBarIconProps) => <Ionicons name="home-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          title: 'Civil Sathi',
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <MapPin size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'My Reports',
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <List size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lodge_complaint"
        options={{
          title: 'Lodge', // Short and sweet
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Plus size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Updates',
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Bell size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <UserCircle size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
