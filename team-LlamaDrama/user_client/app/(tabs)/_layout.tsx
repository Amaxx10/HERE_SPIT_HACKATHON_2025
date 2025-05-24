import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            height: 88,
            paddingBottom: 34,
            borderTopWidth: 0,
            backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          default: {
            height: 65,
            paddingBottom: 10,
            backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF',
            elevation: 8,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <IconSymbol
                size={focused ? 32 : 28}
                name={focused ? 'map.fill' : 'map'}
                color={color}
              />
              {focused && (
                <View style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: Colors[colorScheme ?? 'light'].tint,
                  marginTop: 4,
                }}/>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="form"
        options={{
          title: 'Add Review',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <IconSymbol 
                size={focused ? 32 : 28} 
                name={focused ? 'plus.circle.fill' : 'plus.circle'} 
                color={color}
              />
              {focused && (
                <View style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: Colors[colorScheme ?? 'light'].tint,
                  marginTop: 4,
                }}/>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <IconSymbol 
                size={focused ? 32 : 28} 
                name={focused ? 'person.crop.circle.fill' : 'person.crop.circle'} 
                color={color} 
              />
              {focused && (
                <View style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: Colors[colorScheme ?? 'light'].tint,
                  marginTop: 4,
                }}/>
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
