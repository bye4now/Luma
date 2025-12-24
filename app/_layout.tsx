import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { JournalProvider } from "@/hooks/useJournal";
import { HoroscopeProvider } from "@/hooks/useHoroscope";
import { PremiumProvider } from "@/hooks/usePremium";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { OnboardingProvider } from "@/hooks/useOnboarding";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="record" 
        options={{ 
          presentation: "modal",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="subscription" 
        options={{ 
          presentation: "modal",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="insights" 
        options={{ 
          title: "Insights",
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#B31B6F',
        }} 
      />
      <Stack.Screen 
        name="faq" 
        options={{ 
          headerShown: false,
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.container}>
        <OnboardingProvider>
          <SubscriptionProvider>
            <PremiumProvider>
              <JournalProvider>
                <HoroscopeProvider>
                  <RootLayoutNav />
                </HoroscopeProvider>
              </JournalProvider>
            </PremiumProvider>
          </SubscriptionProvider>
        </OnboardingProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});