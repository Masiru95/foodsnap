import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../src/contexts/UserContext';
import { usePremium } from '../../src/contexts/PremiumContext';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function HistoryScreen() {
  const { userId } = useUser();
  const { isPremium } = usePremium();
  const router = useRouter();
  const { t } = useTranslation();
  const [meals, setMeals] = useState<any[]>([]);
  const [dailyTotals, setDailyTotals] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPremium) {
      setIsLoading(false);
      return;
    }
    loadHistory();
  }, [userId, isPremium]);

  const loadHistory = async () => {
    if (!userId) return;

    try {
      const [mealsResponse, totalsResponse] = await Promise.all([
        fetch(`${API_URL}/api/meals/${userId}`),
        fetch(`${API_URL}/api/meals/${userId}/daily-totals`),
      ]);

      const mealsData = await mealsResponse.json();
      const totalsData = await totalsResponse.json();

      setMeals(mealsData.meals);
      setDailyTotals(totalsData);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMeal = async (mealId: string) => {
    Alert.alert(
      t('history.deleteTitle'),
      t('history.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('history.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API_URL}/api/meals/${mealId}`, {
                method: 'DELETE',
              });
              // Remove from local state
              setMeals(meals.filter((meal) => meal.id !== mealId));
              // Reload totals
              const totalsResponse = await fetch(`${API_URL}/api/meals/${userId}/daily-totals`);
              const totalsData = await totalsResponse.json();
              setDailyTotals(totalsData);
            } catch (error) {
              console.error('Failed to delete meal:', error);
              Alert.alert(t('common.error'), t('history.deleteFailed'));
            }
          },
        },
      ]
    );
  };

  if (!isPremium) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>{t('history.subtitle')}</Text>
        </View>
        <View style={styles.lockedContainer}>
          <Ionicons name="lock-closed" size={80} color="#555" />
          <Text style={styles.lockedTitle}>{t('history.premiumFeature')}</Text>
          <Text style={styles.lockedText}>{t('history.premiumMessage')}</Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => router.push('/paywall')}
          >
            <Text style={styles.upgradeButtonText}>{t('history.upgradeNow')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>{t('history.subtitle')}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>{t('history.subtitle')}</Text>
      </View>

      {dailyTotals && dailyTotals.mealCount > 0 && (
        <View style={styles.dailySummary}>
          <Text style={styles.summaryTitle}>{t('history.todaySummary')}</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{dailyTotals.calories}</Text>
              <Text style={styles.summaryLabel}>{t('trackFood.calories')}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{dailyTotals.protein.toFixed(1)}g</Text>
              <Text style={styles.summaryLabel}>{t('trackFood.protein')}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{dailyTotals.carbs.toFixed(1)}g</Text>
              <Text style={styles.summaryLabel}>{t('trackFood.carbs')}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{dailyTotals.fats.toFixed(1)}g</Text>
              <Text style={styles.summaryLabel}>{t('trackFood.fats')}</Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView style={styles.mealsList}>
        {meals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant" size={60} color="#555" />
            <Text style={styles.emptyText}>{t('history.noMeals')}</Text>
            <Text style={styles.emptySubtext}>{t('history.noMealsSubtext')}</Text>
          </View>
        ) : (
          meals.map((meal: any) => (
            <View key={meal.id} style={styles.mealCard}>
              <Image
                source={{ uri: `data:image/jpeg;base64,${meal.photoBase64}` }}
                style={styles.mealImage}
              />
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.dishName}</Text>
                <Text style={styles.mealTime}>
                  {format(new Date(meal.timestamp), 'MMM d, h:mm a')}
                </Text>
                <View style={styles.mealMacros}>
                  <Text style={styles.mealMacroText}>{meal.calories} cal</Text>
                  <Text style={styles.mealMacroText}>P: {meal.protein}g</Text>
                  <Text style={styles.mealMacroText}>C: {meal.carbs}g</Text>
                  <Text style={styles.mealMacroText}>F: {meal.fats}g</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteMeal(meal.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          ))
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
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
  },
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 12,
  },
  lockedText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 30,
  },
  upgradeButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  upgradeButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailySummary: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    margin: 16,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
  mealsList: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 8,
  },
  mealCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  mealImage: {
    width: 100,
    height: 100,
  },
  mealInfo: {
    flex: 1,
    padding: 12,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  mealTime: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 8,
  },
  mealMacros: {
    flexDirection: 'row',
    gap: 12,
  },
  mealMacroText: {
    fontSize: 12,
    color: '#FF6B6B',
  },
  deleteButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});