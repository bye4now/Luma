import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function Index() {
  const { hasCompletedOnboarding, isLoading } = useOnboarding();

  useEffect(() => {
    console.log('🔵 [Index] Onboarding status:', { hasCompletedOnboarding, isLoading });
  }, [hasCompletedOnboarding, isLoading]);

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#025067', '#0B9FBD', '#6C0E42']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B31B6F" />
        </View>
      </LinearGradient>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/home" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});