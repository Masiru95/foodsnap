/**
 * Paywall Screen
 * Minimal paywall: no hardcoded prices, single CTA.
 * Purchase uses RevenueCat package (prefer monthly, fallback annual).
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { usePremium } from '../src/contexts/PremiumContext';
import type { PurchasesPackage } from 'react-native-purchases';

export default function PaywallScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    isPremium,
    monthlyPackage,
    annualPackage,
    purchase,
    restore,
    isLoading: premiumLoading,
  } = usePremium();

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const isProcessing = isPurchasing || isRestoring || premiumLoading;

  // Prefer monthly; if not available, fallback to annual; if none, show graceful error.
  const selectedPackage: PurchasesPackage | null = useMemo(() => {
    return monthlyPackage || annualPackage || null;
  }, [monthlyPackage, annualPackage]);

  // If already premium, redirect back
  if (isPremium) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.alreadyPremium}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          <Text style={styles.alreadyPremiumTitle}>{t('paywall.alreadyPremium')}</Text>
          <Text style={styles.alreadyPremiumSubtitle}>{t('paywall.enjoyFeatures')}</Text>

          <TouchableOpacity style={styles.goBackButton} onPress={() => router.back()}>
            <Text style={styles.goBackButtonText}>{t('common.goBack')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert(
        t('common.error'),
        Platform.OS === 'web'
          ? t('paywall.webNotSupported')
          : t('paywall.packageNotAvailable')
      );
      return;
    }

    setIsPurchasing(true);
    try {
      const result = await purchase(selectedPackage);

      if (result.success) {
        Alert.alert(
          t('common.success'),
          t('paywall.activated'),
          [{ text: t('common.done'), onPress: () => router.back() }]
        );
      } else if (result.error !== 'CANCELLED') {
        Alert.alert(
          t('paywall.purchaseFailed'),
          result.error || t('paywall.tryAgain')
        );
      }
    } catch (error: any) {
      Alert.alert(
        t('paywall.purchaseFailed'),
        error?.message || t('paywall.tryAgain')
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const result = await restore();

      if (result.success) {
        if (result.restored) {
          Alert.alert(
            t('common.success'),
            t('paywall.purchaseRestored'),
            [{ text: t('common.done'), onPress: () => router.back() }]
          );
        } else {
          Alert.alert(
            t('paywall.noSubscription'),
            t('paywall.noSubscriptionMessage')
          );
        }
      } else {
        Alert.alert(
          t('paywall.restoreFailed'),
          result.error || t('paywall.tryAgain')
        );
      }
    } catch (error: any) {
      Alert.alert(
        t('paywall.restoreFailed'),
        error?.message || t('paywall.tryAgain')
      );
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
        disabled={isProcessing}
      >
        <Ionicons name="close" size={28} color="#fff" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="star" size={60} color="#FFD700" />
          <Text style={styles.title}>{t('paywall.title')}</Text>
          <Text style={styles.subtitle}>{t('paywall.subtitle')}</Text>
        </View>

        <View style={styles.featuresContainer}>
          <FeatureItem title={t('paywall.feature1Title')} description={t('paywall.feature1Desc')} />
          <FeatureItem title={t('paywall.feature2Title')} description={t('paywall.feature2Desc')} />
          <FeatureItem title={t('paywall.feature3Title')} description={t('paywall.feature3Desc')} />
          <FeatureItem title={t('paywall.feature4Title')} description={t('paywall.feature4Desc')} />
          <FeatureItem title={t('paywall.feature5Title')} description={t('paywall.feature5Desc')} />
          <FeatureItem title={t('paywall.feature6Title')} description={t('paywall.feature6Desc')} />
        </View>

        {/* Single CTA (no hardcoded prices) */}
        <TouchableOpacity
          style={[styles.purchaseButton, isProcessing && styles.purchaseButtonDisabled]}
          onPress={handlePurchase}
          disabled={isProcessing}
        >
          {isPurchasing ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.purchaseButtonText}>{t('paywall.startPremium')}</Text>
          )}
        </TouchableOpacity>

        {/* Optional hint to reduce confusion */}
        <Text style={styles.hint}>
          {t('paywall.priceShownInStore', 'El precio final se muestra en Google Play antes de confirmar.')}
        </Text>

        <Text style={styles.disclaimer}>{t('paywall.disclaimer')}</Text>

        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={isProcessing}>
          {isRestoring ? (
            <ActivityIndicator color="#aaa" size="small" />
          ) : (
            <Text style={styles.restoreButtonText}>{t('paywall.restorePurchase')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.notNowButton} onPress={() => router.back()} disabled={isProcessing}>
          <Text style={styles.notNowButtonText}>{t('paywall.notNow')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.checkCircle}>
        <Ionicons name="checkmark" size={24} color="#fff" />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0c0c0c' },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
  },
  content: { padding: 24, paddingTop: 100 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 16, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#aaa', textAlign: 'center' },
  featuresContainer: { marginBottom: 28 },
  featureItem: { flexDirection: 'row', marginBottom: 20, gap: 16 },
  checkCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'center',
  },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  featureDescription: { fontSize: 14, color: '#aaa' },

  purchaseButton: {
    backgroundColor: '#FFD700',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  purchaseButtonDisabled: { backgroundColor: '#888' },
  purchaseButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },

  hint: { fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 10 },
  disclaimer: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 16, lineHeight: 18 },

  restoreButton: { padding: 12, alignItems: 'center' },
  restoreButtonText: { color: '#aaa', fontSize: 14, textDecorationLine: 'underline' },

  notNowButton: { padding: 12, alignItems: 'center', marginBottom: 20 },
  notNowButtonText: { color: '#666', fontSize: 14 },

  alreadyPremium: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  alreadyPremiumTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 24, marginBottom: 8 },
  alreadyPremiumSubtitle: { fontSize: 16, color: '#aaa', textAlign: 'center', marginBottom: 32 },
  goBackButton: { backgroundColor: '#FF6B6B', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  goBackButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
