import { Drawer } from 'expo-router/drawer';
import { Ionicons, MaterialIcons, FontAwesome5, Entypo } from '@expo/vector-icons';
import React from 'react';

export default function Layout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#fff',
          width: 250,
        },
      }}
    >
      <Drawer.Screen
        name="(sellerTabs)"
        options={{
          drawerLabel: 'Dashboard',
          drawerIcon: ({ color }) => <Entypo name="home" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="products"
        options={{
          drawerLabel: 'Products',
          drawerIcon: ({ color }) => <FontAwesome5 name="box-open" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="payments"
        options={{
          drawerLabel: 'Payments',
          drawerIcon: ({ color }) => <MaterialIcons name="payment" size={22} color={color} />,
        }}
      />
    </Drawer>
  );
}
