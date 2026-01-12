/**
 * Premium Context
 * Manages premium subscription state using RevenueCat
 * This is the single source of truth for premium status in the app
 * 
 * IMPORTANT: This context is designed to be crash-safe.
 * If RevenueCat fails, the app continues with premium=false.
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

interface PremiumContextType {
  // Premium status
  isPremium: boolean;
  isLoading: boolean;
  
  // Offerings
  offering: any | null;
  monthlyPackage: any | null;
  annualPackage: any | null;
  
  // Actions
  purchase: (pkg: any) => Promise<{ success: boolean; error?: string }>;
  restore: () => Promise<{ success: boolean; restored: boolean; error?: string }>;
  refreshPremiumStatus: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [offering, setOffering] = useState<any | null>(null);

  // Extract monthly and annual packages from offering
  const monthlyPackage = offering?.availablePackages?.find(
    (pkg: any) => pkg.packageType === 'MONTHLY' || pkg.identifier === '$rc_monthly'
  ) || null;
  
  const annualPackage = offering?.availablePackages?.find(
    (pkg: any) => pkg.packageType === 'ANNUAL' || pkg.identifier === '$rc_annual'
  ) || null;

  /**
   * Initialize RevenueCat and load premium status
   * Wrapped in try-catch to prevent app crash
   */
  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      try {
        console.log('[PremiumContext] Starting initialization...');
        
        // Initialize RevenueCat SDK (this will not throw)
        await initializeRevenueCat();
        
        if (!mounted) return;
        
        // Check premium status (this will not throw)
        const premium = await checkPremiumStatus();
        if (mounted) {
          setIsPremium(premium);
        }
        
        // Load offerings (this will not throw)
        const currentOffering = await getOfferings();
        if (mounted) {
          setOffering(currentOffering);
        }
        
        console.log('[PremiumContext] Initialized:', { premium, hasOffering: !!currentOffering });
        
        // Set up listener for subscription changes
        unsubscribe = addCustomerInfoListener((customerInfo: any) => {
          if (!mounted) return;
          try {
            const hasEntitlement = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] !== undefined;
            console.log('[PremiumContext] Customer info updated, premium:', hasEntitlement);
            setIsPremium(hasEntitlement);
            AsyncStorage.setItem('isPremium', hasEntitlement.toString()).catch(() => {});
          } catch (error) {
            console.error('[PremiumContext] Error processing customer info:', error);
          }
        });
        
      } catch (error) {
        console.error('[PremiumContext] Initialization error:', error);
        // Try to load from local storage as fallback
        try {
          const storedPremium = await AsyncStorage.getItem('isPremium');
          if (mounted) {
            setIsPremium(storedPremium === 'true');
          }
        } catch (e) {
          // Ignore storage errors
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
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
      console.error('[PremiumContext] Error refreshing status:', error);
    }
  }, []);

  /**
   * Purchase a package
   */
  const purchase = useCallback(async (pkg: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await purchasePackage(pkg);
      
      if (result.success && result.customerInfo) {
        const hasEntitlement = result.customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] !== undefined;
        setIsPremium(hasEntitlement);
        await AsyncStorage.setItem('isPremium', hasEntitlement.toString());
        return { success: true };
      }
      
      if (result.error === 'CANCELLED') {
        return { success: false, error: 'CANCELLED' };
      }
      
      return { success: false, error: result.error };
    } catch (error: any) {
      console.error('[PremiumContext] Purchase error:', error);
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
      console.error('[PremiumContext] Restore error:', error);
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
