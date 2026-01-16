/**
 * RevenueCat Service (crash-safe)
 * IMPORTANT:
 * - On mobile: NEVER return mock packages (they can crash purchasePackage in native).
 * - On web: return mocks so the UI preview works.
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '';
const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '';
export const ENTITLEMENT_ID = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT || 'premium';
const OFFERING_ID = process.env.EXPO_PUBLIC_REVENUECAT_OFFERING || 'default';

const RC_USER_ID_KEY = 'revenuecat_user_id';

let isInitialized = false;
let Purchases: any = null;
let initPromise: Promise<void> | null = null;

async function getPurchasesSDK() {
  if (Platform.OS === 'web') return null;
  if (Purchases) return Purchases;

  try {
    const module = await import('react-native-purchases');
    Purchases = module.default;
    return Purchases;
  } catch (error) {
    console.warn('[RevenueCat] Failed to import SDK:', error);
    return null;
  }
}

function normalizeKey(raw: string): string {
  return (raw || '').trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
}

function isValidApiKey(key: string): boolean {
  if (!key) return false;
  if (key === 'your_revenuecat_android_api_key') return false;
  if (key === 'your_revenuecat_ios_api_key') return false;
  if (key.length < 10) return false;
  return true;
}

/**
 * Ensure init runs once and doesn't race on cold starts.
 */
async function ensureInitialized(): Promise<void> {
  if (Platform.OS === 'web') return;
  if (isInitialized) return;

  if (initPromise) {
    await initPromise;
    return;
  }

  initPromise = (async () => {
    const rawKey = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;
    const apiKey = normalizeKey(rawKey);

    console.log('[RevenueCat] apiKey length:', apiKey.length);

    if (!isValidApiKey(apiKey)) {
      console.warn('[RevenueCat] API key not configured or invalid. Purchases will not work.');
      console.warn('[RevenueCat] Current key:', apiKey ? apiKey.substring(0, 10) + '...' : '(empty)');
      return;
    }

    const sdk = await getPurchasesSDK();
    if (!sdk) {
      console.warn('[RevenueCat] SDK not available');
      return;
    }

    // Debug logs in dev
    if (__DEV__) {
      try {
        const { LOG_LEVEL } = await import('react-native-purchases');
        sdk.setLogLevel(LOG_LEVEL.DEBUG);
      } catch {
        // ignore
      }
    }

    let storedUserId: string | null = null;
    try {
      storedUserId = await AsyncStorage.getItem(RC_USER_ID_KEY);
    } catch {
      // ignore
    }

    await sdk.configure({
      apiKey,
      appUserID: storedUserId || undefined,
    });

    try {
      const appUserId = await sdk.getAppUserID();
      await AsyncStorage.setItem(RC_USER_ID_KEY, appUserId);
      console.log('[RevenueCat] Initialized successfully with user:', appUserId);
    } catch {
      // ignore
    }

    isInitialized = true;
  })();

  try {
    await initPromise;
  } finally {
    // allow retry next time if init failed
    if (!isInitialized) initPromise = null;
  }
}

export async function initializeRevenueCat(): Promise<void> {
  try {
    await ensureInitialized();
  } catch (e) {
    console.error('[RevenueCat] Initialization error:', e);
  }
}

export async function checkPremiumStatus(): Promise<boolean> {
  // Web or not initialized: fallback to local
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
    return customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] !== undefined;
  } catch (error) {
    console.error('[RevenueCat] Error checking premium status:', error);
    try {
      const storedPremium = await AsyncStorage.getItem('isPremium');
      return storedPremium === 'true';
    } catch {
      return false;
    }
  }
}

export async function getCustomerInfo(): Promise<any | null> {
  if (Platform.OS === 'web') return null;
  if (!isInitialized) return null;

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
 * Offerings:
 * - Web: mock offering (UI preview).
 * - Mobile: return null if not ready (NO MOCK), so UI disables purchase safely.
 */
export async function getOfferings(): Promise<any | null> {
  if (Platform.OS === 'web') return getMockOffering();

  // Try init (safe). If it fails, return null.
  await ensureInitialized();
  if (!isInitialized) {
    console.warn('[RevenueCat] Not initialized, offerings unavailable');
    return null;
  }

  try {
    const sdk = await getPurchasesSDK();
    if (!sdk) return null;

    const offerings = await sdk.getOfferings();

    if (offerings?.all?.[OFFERING_ID]) return offerings.all[OFFERING_ID];
    if (offerings?.current) return offerings.current;

    return null;
  } catch (error) {
    console.error('[RevenueCat] Error getting offerings:', error);
    return null;
  }
}

/**
 * IMPORTANT: Only buy packages returned by the SDK.
 * If pkg is "mock"/invalid -> return a clean error (avoid native crash).
 */
export async function purchasePackage(pkg: any): Promise<{
  success: boolean;
  customerInfo?: any;
  error?: string;
}> {
  if (Platform.OS === 'web') {
    return { success: false, error: 'Purchases are not available on web. Please use the mobile app.' };
  }

  await ensureInitialized();
  if (!isInitialized) {
    return { success: false, error: 'Purchase system not initialized. Please restart the app.' };
  }

  // Guard: prevent passing mock/handmade objects to native
  if (!pkg || !pkg.identifier || !pkg.product || !pkg.product.identifier) {
    return {
      success: false,
      error: 'Subscriptions are not available yet. Please try again in a moment.',
    };
  }

  try {
    const sdk = await getPurchasesSDK();
    if (!sdk) return { success: false, error: 'Purchase system unavailable' };

    const { customerInfo } = await sdk.purchasePackage(pkg);

    const premium = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] !== undefined;
    await AsyncStorage.setItem('isPremium', String(premium));

    return { success: true, customerInfo };
  } catch (error: any) {
    if (error?.userCancelled) return { success: false, error: 'CANCELLED' };

    console.error('[RevenueCat] Purchase error:', error);
    return { success: false, error: error?.message || 'Purchase failed' };
  }
}

export async function restorePurchases(): Promise<{
  success: boolean;
  isPremium: boolean;
  error?: string;
}> {
  if (Platform.OS === 'web') {
    return { success: false, isPremium: false, error: 'Restore is not available on web.' };
  }

  await ensureInitialized();
  if (!isInitialized) {
    return { success: false, isPremium: false, error: 'Purchase system not initialized. Please restart the app.' };
  }

  try {
    const sdk = await getPurchasesSDK();
    if (!sdk) return { success: false, isPremium: false, error: 'Purchase system unavailable' };

    const customerInfo = await sdk.restorePurchases();
    const premium = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] !== undefined;

    await AsyncStorage.setItem('isPremium', String(premium));
    return { success: true, isPremium: premium };
  } catch (error: any) {
    console.error('[RevenueCat] Restore error:', error);
    return { success: false, isPremium: false, error: error?.message || 'Restore failed' };
  }
}

export function addCustomerInfoListener(callback: (customerInfo: any) => void): () => void {
  if (Platform.OS === 'web') return () => {};
  if (!isInitialized) return () => {};
  if (!Purchases) return () => {};

  try {
    const listener = Purchases.addCustomerInfoUpdateListener(callback);
    return () => {
      try {
        listener.remove();
      } catch {
        // ignore
      }
    };
  } catch (error) {
    console.error('[RevenueCat] Error adding listener:', error);
    return () => {};
  }
}

/**
 * Mock offering (WEB ONLY)
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
          title: 'Premium Monthly',
          price: 4.99,
          priceString: '$4.99',
          currencyCode: 'USD',
        },
      },
      {
        identifier: '$rc_annual',
        packageType: 'ANNUAL',
        product: {
          identifier: 'premium_annual',
          title: 'Premium Annual',
          price: 39.99,
          priceString: '$39.99',
          currencyCode: 'USD',
        },
      },
    ],
  };
}
