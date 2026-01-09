/**
 * RevenueCat Service
 * Handles all RevenueCat SDK interactions for in-app purchases
 */

import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Environment variables
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '';
const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '';
const ENTITLEMENT_ID = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT || 'premium';
const OFFERING_ID = process.env.EXPO_PUBLIC_REVENUECAT_OFFERING || 'default';

// Storage key for RevenueCat anonymous user ID
const RC_USER_ID_KEY = 'revenuecat_user_id';

/**
 * Initialize RevenueCat SDK
 * Should be called once when app starts
 */
export async function initializeRevenueCat(): Promise<void> {
  // Only initialize on native platforms, not web
  if (Platform.OS === 'web') {
    console.log('[RevenueCat] Web platform detected, skipping initialization');
    return;
  }

  const apiKey = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;
  
  if (!apiKey || apiKey === 'your_revenuecat_android_api_key' || apiKey === 'your_revenuecat_ios_api_key') {
    console.warn('[RevenueCat] API key not configured. Purchases will not work.');
    return;
  }

  try {
    // Enable debug logs in development
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    // Check if we have a stored user ID for consistency across app restarts
    const storedUserId = await AsyncStorage.getItem(RC_USER_ID_KEY);
    
    // Configure RevenueCat
    await Purchases.configure({
      apiKey,
      appUserID: storedUserId || undefined, // Use stored ID or let RC generate one
    });

    // Get and store the app user ID for future sessions
    const appUserId = await Purchases.getAppUserID();
    await AsyncStorage.setItem(RC_USER_ID_KEY, appUserId);
    
    console.log('[RevenueCat] Initialized successfully with user:', appUserId);
  } catch (error) {
    console.error('[RevenueCat] Initialization error:', error);
  }
}

/**
 * Check if user has premium entitlement
 */
export async function checkPremiumStatus(): Promise<boolean> {
  if (Platform.OS === 'web') {
    // On web, check AsyncStorage fallback
    const storedPremium = await AsyncStorage.getItem('isPremium');
    return storedPremium === 'true';
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (error) {
    console.error('[RevenueCat] Error checking premium status:', error);
    // Fallback to local storage
    const storedPremium = await AsyncStorage.getItem('isPremium');
    return storedPremium === 'true';
  }
}

/**
 * Get current customer info
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error('[RevenueCat] Error getting customer info:', error);
    return null;
  }
}

/**
 * Get available offerings (packages/products)
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (Platform.OS === 'web') {
    // Return mock offerings for web preview
    return getMockOffering();
  }

  try {
    const offerings = await Purchases.getOfferings();
    
    // Try to get the specified offering, fallback to current
    if (offerings.all[OFFERING_ID]) {
      return offerings.all[OFFERING_ID];
    }
    
    return offerings.current;
  } catch (error) {
    console.error('[RevenueCat] Error getting offerings:', error);
    return null;
  }
}

/**
 * Purchase a package
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  if (Platform.OS === 'web') {
    return {
      success: false,
      error: 'Purchases are not available on web. Please use the mobile app.',
    };
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    
    // Update local storage as backup
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    await AsyncStorage.setItem('isPremium', isPremium.toString());
    
    return { success: true, customerInfo };
  } catch (error: any) {
    // Handle user cancellation
    if (error.userCancelled) {
      return { success: false, error: 'CANCELLED' };
    }
    
    console.error('[RevenueCat] Purchase error:', error);
    return { success: false, error: error.message || 'Purchase failed' };
  }
}

/**
 * Restore purchases
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  isPremium: boolean;
  error?: string;
}> {
  if (Platform.OS === 'web') {
    return {
      success: false,
      isPremium: false,
      error: 'Restore is not available on web.',
    };
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    
    // Update local storage
    await AsyncStorage.setItem('isPremium', isPremium.toString());
    
    return { success: true, isPremium };
  } catch (error: any) {
    console.error('[RevenueCat] Restore error:', error);
    return { success: false, isPremium: false, error: error.message || 'Restore failed' };
  }
}

/**
 * Add listener for customer info updates
 */
export function addCustomerInfoListener(
  callback: (customerInfo: CustomerInfo) => void
): () => void {
  if (Platform.OS === 'web') {
    return () => {}; // No-op for web
  }

  const listener = Purchases.addCustomerInfoUpdateListener(callback);
  return () => listener.remove();
}

/**
 * Mock offering for web preview (shows UI without real purchases)
 */
function getMockOffering(): PurchasesOffering {
  return {
    identifier: 'default',
    serverDescription: 'Default Offering',
    metadata: {},
    availablePackages: [
      {
        identifier: '$rc_monthly',
        packageType: 'MONTHLY' as any,
        product: {
          identifier: 'premium_monthly',
          description: 'Monthly Premium Subscription',
          title: 'Premium Monthly',
          price: 4.99,
          priceString: '$4.99',
          currencyCode: 'USD',
          introPrice: null,
          discounts: [],
          productCategory: 'SUBSCRIPTION' as any,
          productType: 'AUTO_RENEWABLE_SUBSCRIPTION' as any,
          subscriptionPeriod: 'P1M',
          defaultOption: null,
          subscriptionOptions: [],
          presentedOfferingIdentifier: 'default',
          presentedOfferingContext: null,
        },
        offeringIdentifier: 'default',
        presentedOfferingContext: null,
      },
      {
        identifier: '$rc_annual',
        packageType: 'ANNUAL' as any,
        product: {
          identifier: 'premium_annual',
          description: 'Annual Premium Subscription',
          title: 'Premium Annual',
          price: 39.99,
          priceString: '$39.99',
          currencyCode: 'USD',
          introPrice: null,
          discounts: [],
          productCategory: 'SUBSCRIPTION' as any,
          productType: 'AUTO_RENEWABLE_SUBSCRIPTION' as any,
          subscriptionPeriod: 'P1Y',
          defaultOption: null,
          subscriptionOptions: [],
          presentedOfferingIdentifier: 'default',
          presentedOfferingContext: null,
        },
        offeringIdentifier: 'default',
        presentedOfferingContext: null,
      },
    ] as any,
    monthly: null,
    annual: null,
    lifetime: null,
    sixMonth: null,
    threeMonth: null,
    twoMonth: null,
    weekly: null,
  };
}

export { ENTITLEMENT_ID };
