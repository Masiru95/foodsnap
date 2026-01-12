import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const go = async () => {
      try {
        // App must NEVER block on backend/user creation.
        const onboardingComplete = await AsyncStorage.getItem('onboardingComplete');

        if (cancelled) return;

        if (onboardingComplete === 'true') {
          // Main app
          router.replace('/(tabs)');
        } else {
          // Local-only onboarding
          router.replace('/onboarding');
        }
      } catch {
        // If storage fails for any reason, still allow app to proceed.
        if (!cancelled) router.replace('/onboarding');
      }
    };

    go();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF6B6B" />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: { marginTop: 12, color: '#fff', fontSize: 16 },
});
