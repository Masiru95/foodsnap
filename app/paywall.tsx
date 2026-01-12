/**
 * Paywall Screen
 * Production-ready paywall with RevenueCat integration
 * Shows subscription options with localized prices from the SDK
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

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Helpers: package is usable only if it has a real product with priceString
  const isValidPackage = (pkg: PurchasesPackage | null | undefined) => {
    return !!(pkg && (pkg as any).product && (pkg as any).product.priceString);
  };

  const monthlyValid = isValidPackage(monthlyPackage);
  const annualValid = isValidPackage(annualPackage);

  // If selectedPlan is not available, auto-pick the one that exists (safe UX)
  const effectiveSelectedPlan = useMemo(() => {
    if (selectedPlan === 'yearly' && annualValid) return 'yearly';
    if (selectedPlan === 'monthly' && monthlyValid) return 'monthly';
    if (annualValid) return 'yearly';
    if (monthlyValid) return 'monthly';
    return selectedPlan; // none available, keep
  }, [selectedPlan, annualValid, monthlyValid]);

  const selectedPackage: PurchasesPackage | null =
    effectiveSelectedPlan === 'yearly' ? (annualPackage ?? null) : (monthlyPackage ?? null);

  const canPurchaseSelected = isValidPackage(selectedPackage);

  // Show only RevenueCat localized prices (NO hardcoded fallback)
  const getMonthlyPrice = () => (monthlyPackage?.product?.priceString ? monthlyPackage.product.priceString : null);
  const getAnnualPrice = () => (annualPackage?.product?.priceString ? annualPackage.product.priceString : null);

  // Savings label only if both prices exist as numbers
  const getSavingsPercentage = () => {
    if (monthlyPackage?.product?.price && annualPackage?.product?.price) {
      const monthlyYearlyCost = monthlyPackage.product.price * 12;
      const annualCost = annualPackage.product.price;
      if (monthlyYearlyCost <= 0) return null;
      const savings = Math.round(((monthlyYearlyCost - annualCost) / monthlyYearlyCost) * 100);
      if (!Number.isFinite(savings) || savings <= 0) return null;
      return `${t('paywall.save')} ${savings}%`;
    }
    return null;
  };

  const isProcessing = isPurchasing || isRestoring || premiumLoading;

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
    // Hard guard: NEVER call purchase with an invalid package (prevents native crash)
    if (!selectedPackage || !selectedPackage.product || !selectedPackage.product.priceString) {
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
        Alert.alert(t('paywall.purchaseFailed'), result.error || t('paywall.tryAgain'));
      }
    } catch (error: any) {
      Alert.alert(t('paywall.purchaseFailed'), error?.message || t('paywall.tryAgain'));
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
          Alert.alert(t('paywall.noSubscription'), t('paywall.noSubscriptionMessage'));
        }
      } else {
        Alert.alert(t('paywall.restoreFailed'), result.error || t('paywall.tryAgain'));
      }
    } catch (error: any) {
      Alert.alert(t('paywall.restoreFailed'), error?.message || t('paywall.tryAgain'));
    } finally {
      setIsRestoring(false);
    }
  };

  const annualPrice = getAnnualPrice();
  const monthlyPrice = getMonthlyPrice();
  const savingsLabel = getSavingsPercentage();

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

        {/* Features */}
        <View style={styles.featuresContainer}>
          <FeatureItem title={t('paywall.feature1Title')} description={t('paywall.feature1Desc')} />
          <FeatureItem title={t('paywall.feature2Title')} description={t('paywall.feature2Desc')} />
          <FeatureItem title={t('paywall.feature3Title')} description={t('paywall.feature3Desc')} />
          <FeatureItem title={t('paywall.feature4Title')} description={t('paywall.feature4Desc')} />
          <FeatureItem title={t('paywall.feature5Title')} description={t('paywall.feature5Desc')} />
          <FeatureItem title={t('paywall.feature6Title')} description={t('paywall.feature6Desc')} />
        </View>

        {/* Pricing Options */}
        <View style={styles.pricingContainer}>
          {/* Annual Plan (only show if available) */}
          {annualValid && (
            <TouchableOpacity
              style={[
                styles.pricingCard,
                effectiveSelectedPlan === 'yearly' && styles.pricingCardSelected,
              ]}
              onPress={() => setSelectedPlan('yearly')}
              disabled={isProcessing}
            >
              {effectiveSelectedPlan === 'yearly' && !!savingsLabel && (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>{savingsLabel}</Text>
                </View>
              )}

              <View style={styles.pricingRow}>
                <View style={styles.pricingInfo}>
                  <Text style={styles.pricingTitle}>{t('paywall.yearly')}</Text>
                  <Text style={styles.pricingDescription}>{t('paywall.yearlyBilled')}</Text>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{annualPrice}</Text>
                  <Text style={styles.priceSubtext}>{t('paywall.perYear')}</Text>
                </View>
              </View>

              {effectiveSelectedPlan === 'yearly' && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={24} color="#FFD700" />
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Monthly Plan (only show if available) */}
          {monthlyValid && (
            <TouchableOpacity
              style={[
                styles.pricingCard,
                effectiveSelectedPlan === 'monthly' && styles.pricingCardSelected,
              ]}
              onPress={() => setSelectedPlan('monthly')}
              disabled={isProcessing}
            >
              <View style={styles.pricingRow}>
                <View style={styles.pricingInfo}>
                  <Text style={styles.pricingTitle}>{t('paywall.monthly')}</Text>
                  <Text style={styles.pricingDescription}>{t('paywall.monthlyBilled')}</Text>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{monthlyPrice}</Text>
                  <Text style={styles.priceSubtext}>{t('paywall.perMonth')}</Text>
                </View>
              </View>

              {effectiveSelectedPlan === 'monthly' && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={24} color="#FFD700" />
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* If nothing loaded yet */}
          {!annualValid && !monthlyValid && (
            <View style={styles.noPlansBox}>
              <Text style={styles.noPlansTitle}>{t('common.loading')}</Text>
              <Text style={styles.noPlansDesc}>
                {Platform.OS === 'web' ? t('paywall.webNotSupported') : t('paywall.packageNotAvailable')}
              </Text>
            </View>
          )}
        </View>

        {/* Purchase Button */}
        <TouchableOpacity
          style={[
            styles.purchaseButton,
            (isProcessing || !canPurchaseSelected) && styles.purchaseButtonDisabled,
          ]}
          onPress={handlePurchase}
          disabled={isProcessing || !canPurchaseSelected}
        >
          {isPurchasing ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.purchaseButtonText}>{t('paywall.startPremium')}</Text>
          )}
        </TouchableOpacity>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>{t('paywall.disclaimer')}</Text>

        {/* Restore Purchases */}
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={isProcessing}>
          {isRestoring ? (
            <ActivityIndicator color="#aaa" size="small" />
          ) : (
            <Text style={styles.restoreButtonText}>{t('paywall.restorePurchase')}</Text>
          )}
        </TouchableOpacity>

        {/* Not Now Button */}
        <TouchableOpacity style={styles.notNowButton} onPress={() => router.back()} disabled={isProcessing}>
          <Text style={styles.notNowButtonText}>{t('paywall.notNow')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// Feature item component
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
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
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
  content: {
    padding: 24,
    paddingTop: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 16,
  },
  checkCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#aaa',
  },
  pricingContainer: {
    marginBottom: 24,
  },
  pricingCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#333',
    position: 'relative',
  },
  pricingCardSelected: {
    borderColor: '#FFD700',
    backgroundColor: '#1a1a0f',
  },
  savingsBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingInfo: {
    flex: 1,
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  pricingDescription: {
    fontSize: 14,
    color: '#aaa',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  priceSubtext: {
    fontSize: 12,
    color: '#888',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  purchaseButton: {
    backgroundColor: '#FFD700',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  purchaseButtonDisabled: {
    backgroundColor: '#888',
  },
  purchaseButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  restoreButton: {
    padding: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: '#aaa',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  notNowButton: {
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  notNowButtonText: {
    color: '#666',
    fontSize: 14,
  },
  noPlansBox: {
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  noPlansTitle: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 6,
  },
  noPlansDesc: {
    color: '#aaa',
    fontSize: 13,
    lineHeight: 18,
  },
  // Already premium styles
  alreadyPremium: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  alreadyPremiumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 24,
    marginBottom: 8,
  },
  alreadyPremiumSubtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 32,
  },
  goBackButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  goBackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
