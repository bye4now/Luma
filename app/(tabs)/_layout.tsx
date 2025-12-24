import { Tabs } from "expo-router";
import { BookOpen, Settings, BarChart3, Sparkles } from "lucide-react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  // A good, consistent bar height + safe area padding
  const baseBarHeight = 58;
  const bottomPadding = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#B31B6F",
        tabBarInactiveTintColor: "#7fb8b9",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0c1508",      // your dark brand base
          borderTopWidth: 1,
          borderTopColor: "rgba(160, 217, 218, 0.25)",
          height: baseBarHeight + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          paddingBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Journal",
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="horoscope"
        options={{
          title: "Cosmic",
          tabBarIcon: ({ color, size }) => <Sparkles size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
