import { Tabs } from 'expo-router';
import React from 'react';
import { Entypo, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '../../../../context/UserContext';

const HomeIcon = ({ color }) => <Entypo name="home" size={22} color={color} />;
const ChatIcon = ({ color }) => <Ionicons name="chatbubble-ellipses-outline" size={22} color={color} />;
const OrdersIcon = ({ color }) => <MaterialCommunityIcons name="clipboard-text-clock-outline" size={22} color={color} />;
const SettingIcon = ({ color }) => <Ionicons name="settings-outline" size={22} color={color} />;

const screenOptions = {
  headerShown: false,
  tabBarStyle: {
    height: 70,
    backgroundColor: '#024A63',
    borderTopWidth: 0,
  },
  tabBarActiveTintColor: 'white',
  tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
  tabBarLabelStyle: {
    fontSize: 12,
  },
};

export default function SellerTabs() {
  const { totalUnread } = useUser();
  
  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Home',
          tabBarIcon: HomeIcon,
        }}
      />
      <Tabs.Screen
        name="Chat"
        options={{
          title: 'Chat',
          tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
          tabBarBadgeStyle: { backgroundColor: 'red', color: 'white' },
          tabBarIcon: ChatIcon,
        }}
      />
      <Tabs.Screen
        name="Orders"
        options={{
          title: 'Orders',
          tabBarIcon: OrdersIcon,
        }}
      />
      <Tabs.Screen
        name="Setting"
        options={{
          title: 'Setting',
          tabBarIcon: SettingIcon,
        }}
      />
    </Tabs>
  );
}
