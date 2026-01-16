import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../src/contexts/UserContext';

export default function Index() {
  const router = useRouter();
  const { userId, isLoading, hasCompletedOnboarding } = useUser();

  useEffect(() => {
    if (!isLoading) {
      if (!userId) {
        // Will trigger user creation in UserContext
        return;
      }
      
      if (!hasCompletedOnboarding) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)/home');
      }
    }
  }, [isLoading, userId, hasCompletedOnboarding]);

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
    backgroundColor: '#0c0c0c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
});