/**
 * RevenueCat Service
 * Handles all RevenueCat SDK interactions for in-app purchases
 * 
 * IMPORTANT: This service is designed to be crash-safe.
 * If RevenueCat fails to initialize, the app will continue working
 * with premium features disabled.
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Environment variables
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '';
const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '';
const ENTITLEMENT_ID = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT || 'premium';
const OFFERING_ID = process.env.EXPO_PUBLIC_REVENUECAT_OFFERING || 'default';

// Storage key for RevenueCat anonymous user ID
const RC_USER_ID_KEY = 'revenuecat_user_id';

// Track initialization state
let isInitialized = false;
let Purchases: any = null;

/**
 * Safely import RevenueCat SDK
 * Returns null if import fails (e.g., on web or if not properly installed)
 */
async function getPurchasesSDK() {
  if (Platform.OS === 'web') {
    return null;
  }
  
  if (Purchases) {
    return Purchases;
  }
  
  try {
    const module = await import('react-native-purchases');
    Purchases = module.default;
    return Purchases;
  } catch (error) {
    console.warn('[RevenueCat] Failed to import SDK:', error);
    return null;
  }
}

/**
 * Check if API key is valid (not a placeholder)
 */
function isValidApiKey(key: string): boolean {
  if (!key) return false;
  if (key === 'your_revenuecat_android_api_key') return false;
  if (key === 'your_revenuecat_ios_api_key') return false;
  if (key.length < 10) return false;
  return true;
}

/**
 * Initialize RevenueCat SDK
 * Should be called once when app starts
 * 
 * This function is designed to never throw - it will log errors
 * and fail gracefully if initialization fails.
 */
export async function initializeRevenueCat(): Promise<void> {
  // Skip on web
  if (Platform.OS === 'web') {
    console.log('[RevenueCat] Web platform detected, skipping initialization');
    return;
  }

  // Don't re-initialize
  if (isInitialized) {
    console.log('[RevenueCat] Already initialized');
    return;
  }

  const rawKey = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;
const apiKey = rawKey.trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "");
console.log('[RevenueCat] apiKey length:', apiKey.length);
  
  // Validate API key
  if (!isValidApiKey(apiKey)) {
    console.warn('[RevenueCat] API key not configured or invalid. Purchases will not work.');
    console.warn('[RevenueCat] Current key:', apiKey ? apiKey.substring(0, 10) + '...' : '(empty)');
    return;
  }

  try {
    // Dynamically import to avoid crash if module isn't available
    const sdk = await getPurchasesSDK();
    if (!sdk) {
      console.warn('[RevenueCat] SDK not available');
      return;
    }

    // Enable debug logs in development
    if (__DEV__) {
      try {
        const { LOG_LEVEL } = await import('react-native-purchases');
        sdk.setLogLevel(LOG_LEVEL.DEBUG);
      } catch (e) {
        console.warn('[RevenueCat] Could not set log level');
      }
    }

    // Check if we have a stored user ID for consistency across app restarts
    let storedUserId: string | null = null;
    try {
      storedUserId = await AsyncStorage.getItem(RC_USER_ID_KEY);
    } catch (e) {
      console.warn('[RevenueCat] Could not read stored user ID');
    }
    
    // Configure RevenueCat
    await sdk.configure({
      apiKey,
      appUserID: storedUserId || undefined,
    });

    // Get and store the app user ID for future sessions
    try {
      const appUserId = await sdk.getAppUserID();
      await AsyncStorage.setItem(RC_USER_ID_KEY, appUserId);
      console.log('[RevenueCat] Initialized successfully with user:', appUserId);
    } catch (e) {
      console.warn('[RevenueCat] Could not get/store user ID');
    }
    
    isInitialized = true;
  } catch (error) {
    console.error('[RevenueCat] Initialization error:', error);
    // Don't throw - app should continue working without purchases
  }
}

/**
 * Check if user has premium entitlement
 */
export async function checkPremiumStatus(): Promise<boolean> {
  // On web or if not initialized, check AsyncStorage fallback
  if (Platform.OS === 'web' || !isInitialized) {
    try {
      const storedPremium = await AsyncStorage.getItem('isPremium');
      return storedPremium === 'true';
    } catch {
      return false;
    }
  }

  try {
    const sdk = await getPurchasesSDK();
    if (!sdk) {
      const storedPremium = await AsyncStorage.getItem('isPremium');
      return storedPremium === 'true';
    }
    
    const customerInfo = await sdk.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (error) {
    console.error('[RevenueCat] Error checking premium status:', error);
    // Fallback to local storage
    try {
      const storedPremium = await AsyncStorage.getItem('isPremium');
      return storedPremium === 'true';
    } catch {
      return false;
    }
  }
}

/**
 * Get current customer info
 */
export async function getCustomerInfo(): Promise<any | null> {
  if (Platform.OS === 'web' || !isInitialized) {
    return null;
  }

  try {
    const sdk = await getPurchasesSDK();
    if (!sdk) return null;
    return await sdk.getCustomerInfo();
  } catch (error) {
    console.error('[RevenueCat] Error getting customer info:', error);
    return null;
  }
}

/**
 * Get available offerings (packages/products)
 */
export async function getOfferings(): Promise<any | null> {
  if (Platform.OS === 'web') {
    // Return mock offerings for web preview
    return getMockOffering();
  }

  if (!isInitialized) {
    console.warn('[RevenueCat] Not initialized, returning mock offerings');
    return getMockOffering();
  }

  try {
    const sdk = await getPurchasesSDK();
    if (!sdk) return getMockOffering();
    
    const offerings = await sdk.getOfferings();
    
    // Try to get the specified offering, fallback to current
    if (offerings.all[OFFERING_ID]) {
      return offerings.all[OFFERING_ID];
    }
    
    return offerings.current || getMockOffering();
  } catch (error) {
    console.error('[RevenueCat] Error getting offerings:', error);
    return getMockOffering();
  }
}

/**
 * Purchase a package
 */
export async function purchasePackage(pkg: any): Promise<{
  success: boolean;
  customerInfo?: any;
  error?: string;
}> {
  if (Platform.OS === 'web') {
    return {
      success: false,
      error: 'Purchases are not available on web. Please use the mobile app.',
    };
  }

  if (!isInitialized) {
    return {
      success: false,
      error: 'Purchase system not initialized. Please restart the app.',
    };
  }

  try {
    const sdk = await getPurchasesSDK();
    if (!sdk) {
      return { success: false, error: 'Purchase system unavailable' };
    }
    
    const { customerInfo } = await sdk.purchasePackage(pkg);
    
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

  if (!isInitialized) {
    return {
      success: false,
      isPremium: false,
      error: 'Purchase system not initialized. Please restart the app.',
    };
  }

  try {
    const sdk = await getPurchasesSDK();
    if (!sdk) {
      return { success: false, isPremium: false, error: 'Purchase system unavailable' };
    }
    
    const customerInfo = await sdk.restorePurchases();
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
  callback: (customerInfo: any) => void
): () => void {
  if (Platform.OS === 'web' || !isInitialized) {
    return () => {}; // No-op
  }

  // Use sync check since we need to return immediately
  if (!Purchases) {
    return () => {};
  }

  try {
    const listener = Purchases.addCustomerInfoUpdateListener(callback);
    return () => {
      try {
        listener.remove();
      } catch (e) {
        // Ignore removal errors
      }
    };
  } catch (error) {
    console.error('[RevenueCat] Error adding listener:', error);
    return () => {};
  }
}

/**
 * Mock offering for web preview and fallback
 */
function getMockOffering(): any {
  return {
    identifier: 'default',
    serverDescription: 'Default Offering',
    metadata: {},
    availablePackages: [
      {
        identifier: '$rc_monthly',
        packageType: 'MONTHLY',
        product: {
          identifier: 'premium_monthly',
          description: 'Monthly Premium Subscription',
          title: 'Premium Monthly',
          price: 4.99,
          priceString: '$4.99',
          currencyCode: 'USD',
          introPrice: null,
          discounts: [],
          productCategory: 'SUBSCRIPTION',
          productType: 'AUTO_RENEWABLE_SUBSCRIPTION',
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
        packageType: 'ANNUAL',
        product: {
          identifier: 'premium_annual',
          description: 'Annual Premium Subscription',
          title: 'Premium Annual',
          price: 39.99,
          priceString: '$39.99',
          currencyCode: 'USD',
          introPrice: null,
          discounts: [],
          productCategory: 'SUBSCRIPTION',
          productType: 'AUTO_RENEWABLE_SUBSCRIPTION',
          subscriptionPeriod: 'P1Y',
          defaultOption: null,
          subscriptionOptions: [],
          presentedOfferingIdentifier: 'default',
          presentedOfferingContext: null,
        },
        offeringIdentifier: 'default',
        presentedOfferingContext: null,
      },
    ],
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
