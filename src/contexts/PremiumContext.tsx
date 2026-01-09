/**
 * Premium Context
 * Manages premium subscription state using RevenueCat
 * This is the single source of truth for premium status in the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initializeRevenueCat,
  checkPremiumStatus,
  getOfferings,
  purchasePackage,
  restorePurchases,
  addCustomerInfoListener,
  ENTITLEMENT_ID,
} from '../services/revenuecat';
import type { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';

interface PremiumContextType {
  // Premium status
  isPremium: boolean;
  isLoading: boolean;
  
  // Offerings
  offering: PurchasesOffering | null;
  monthlyPackage: PurchasesPackage | null;
  annualPackage: PurchasesPackage | null;
  
  // Actions
  purchase: (pkg: PurchasesPackage) => Promise<{ success: boolean; error?: string }>;
  restore: () => Promise<{ success: boolean; restored: boolean; error?: string }>;
  refreshPremiumStatus: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);

  // Extract monthly and annual packages from offering
  const monthlyPackage = offering?.availablePackages.find(
    (pkg) => pkg.packageType === 'MONTHLY' || pkg.identifier === '$rc_monthly'
  ) || null;
  
  const annualPackage = offering?.availablePackages.find(
    (pkg) => pkg.packageType === 'ANNUAL' || pkg.identifier === '$rc_annual'
  ) || null;

  /**
   * Initialize RevenueCat and load premium status
   */
  useEffect(() => {
    const init = async () => {
      try {
        // Initialize RevenueCat SDK
        await initializeRevenueCat();
        
        // Check premium status
        const premium = await checkPremiumStatus();
        setIsPremium(premium);
        
        // Load offerings
        const currentOffering = await getOfferings();
        setOffering(currentOffering);
        
        console.log('[Premium] Initialized:', { premium, hasOffering: !!currentOffering });
      } catch (error) {
        console.error('[Premium] Initialization error:', error);
        // Try to load from local storage as fallback
        const storedPremium = await AsyncStorage.getItem('isPremium');
        setIsPremium(storedPremium === 'true');
      } finally {
        setIsLoading(false);
      }
    };

    init();

    // Listen for customer info updates (purchases, restores, subscription changes)
    const unsubscribe = addCustomerInfoListener((customerInfo: CustomerInfo) => {
      const hasEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
      console.log('[Premium] Customer info updated, premium:', hasEntitlement);
      setIsPremium(hasEntitlement);
      AsyncStorage.setItem('isPremium', hasEntitlement.toString());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Refresh premium status manually
   */
  const refreshPremiumStatus = useCallback(async () => {
    try {
      const premium = await checkPremiumStatus();
      setIsPremium(premium);
      await AsyncStorage.setItem('isPremium', premium.toString());
    } catch (error) {
      console.error('[Premium] Error refreshing status:', error);
    }
  }, []);

  /**
   * Purchase a package
   */
  const purchase = useCallback(async (pkg: PurchasesPackage): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await purchasePackage(pkg);
      
      if (result.success && result.customerInfo) {
        const hasEntitlement = result.customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
        setIsPremium(hasEntitlement);
        await AsyncStorage.setItem('isPremium', hasEntitlement.toString());
        return { success: true };
      }
      
      if (result.error === 'CANCELLED') {
        return { success: false, error: 'CANCELLED' };
      }
      
      return { success: false, error: result.error };
    } catch (error: any) {
      console.error('[Premium] Purchase error:', error);
      return { success: false, error: error.message || 'Purchase failed' };
    }
  }, []);

  /**
   * Restore purchases
   */
  const restore = useCallback(async (): Promise<{ success: boolean; restored: boolean; error?: string }> => {
    try {
      const result = await restorePurchases();
      
      if (result.success) {
        setIsPremium(result.isPremium);
        await AsyncStorage.setItem('isPremium', result.isPremium.toString());
        return { success: true, restored: result.isPremium };
      }
      
      return { success: false, restored: false, error: result.error };
    } catch (error: any) {
      console.error('[Premium] Restore error:', error);
      return { success: false, restored: false, error: error.message || 'Restore failed' };
    }
  }, []);

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        isLoading,
        offering,
        monthlyPackage,
        annualPackage,
        purchase,
        restore,
        refreshPremiumStatus,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within PremiumProvider');
  }
  return context;
}
