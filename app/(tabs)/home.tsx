import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../src/contexts/UserContext';
import { usePremium } from '../../src/contexts/PremiumContext';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function HomeScreen() {
  const { userId } = useUser();
  const { isPremium } = usePremium();
  const router = useRouter();
  const { t } = useTranslation();
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    checkTodayCount();
  }, [userId]);

  const checkTodayCount = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${API_URL}/api/meals/${userId}/today`);
      const data = await response.json();
      setTodayCount(data.count);
    } catch (error) {
      console.error('Failed to check today count:', error);
    }
  };

  const handleTrackFood = () => {
    if (!isPremium && todayCount >= 2) {
      Alert.alert(
        t('home.dailyLimitReached'),
        t('home.upgradeForUnlimited'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('history.upgradeNow'), onPress: () => router.push('/paywall') },
        ]
      );
      return;
    }
    router.push('/track-food');
  };

  const handleWhatToCook = () => {
    if (!isPremium) {
      Alert.alert(
        t('cooking.premiumFeature'),
        'Recipe suggestions are only available for Premium users. Upgrade now to unlock unlimited cooking ideas!',
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('history.upgradeNow'), onPress: () => router.push('/paywall') },
        ]
      );
      return;
    }
    router.push('/cooking');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('home.title')}</Text>
        {!isPremium && (
          <View style={styles.limitBadge}>
            <Text style={styles.limitText}>{t('home.dailyLimit', { count: todayCount })}</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.actionCard} onPress={handleTrackFood}>
          <View style={styles.iconContainer}>
            <Ionicons name="camera" size={48} color="#FF6B6B" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{t('home.trackFood')}</Text>
            <Text style={styles.cardDescription}>{t('home.trackFoodDesc')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#aaa" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleWhatToCook}>
          <View style={styles.iconContainer}>
            <Ionicons name="restaurant" size={48} color="#FF6B6B" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{t('home.whatToCook')}</Text>
            <Text style={styles.cardDescription}>{t('home.whatToCookDesc')}</Text>
            {!isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="lock-closed" size={14} color="#FFD700" />
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={24} color="#aaa" />
        </TouchableOpacity>

        {!isPremium && todayCount >= 2 && (
          <View style={styles.upgradePrompt}>
            <Text style={styles.upgradeText}>{t('home.dailyLimitReached')}</Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => router.push('/paywall')}
            >
              <Text style={styles.upgradeButtonText}>{t('history.upgradeNow')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  limitBadge: {
    backgroundColor: '#FF6B6B20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  limitText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#333',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B6B20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#aaa',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  premiumText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
  upgradePrompt: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
  },
  upgradeText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  upgradeButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});