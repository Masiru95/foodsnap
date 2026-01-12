import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface UserContextType {
  userId: string | null;
  isPremium: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  createUser: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setPremium: (premium: boolean) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

type JsonValue = any;

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 15000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
};

const safeJson = async (res: Response): Promise<JsonValue | null> => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const apiBase = useMemo(() => {
    const trimmed = (API_URL || '').trim();
    if (!trimmed) {
      console.warn(
        '[UserContext] EXPO_PUBLIC_BACKEND_URL is empty. App will continue without backend until configured.'
      );
    }
    // No trailing slash to keep URLs consistent
    return trimmed.replace(/\/+$/, '');
  }, []);

  const initializeUser = async () => {
    try {
      // Local first: never block UI on backend
      const [storedUserId, onboardingComplete, storedPremium] = await Promise.all([
        AsyncStorage.getItem('userId'),
        AsyncStorage.getItem('onboardingComplete'),
        AsyncStorage.getItem('isPremium'),
      ]);

      if (!mountedRef.current) return;

      setHasCompletedOnboarding(onboardingComplete === 'true');
      if (storedPremium === 'true') setIsPremium(true);

      if (storedUserId) {
        setUserId(storedUserId);

        // Try refresh, but never hang forever
        await refreshUserInternal(storedUserId);
      } else {
        // Create user, but never hang forever
        await createUserInternal();
      }
    } catch (error) {
      console.error('[UserContext] Failed to initialize user:', error);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createUserInternal = async () => {
    if (!apiBase) {
      // Backend not configured: do NOT hang; keep userId null.
      console.warn('[UserContext] Skipping createUser because backend URL is missing.');
      return;
    }

    try {
      const res = await fetchWithTimeout(`${apiBase}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await safeJson(res);

      if (!res.ok || !data?.userId) {
        console.error('[UserContext] createUser failed:', { status: res.status, data });
        return;
      }

      await AsyncStorage.setItem('userId', String(data.userId));

      if (!mountedRef.current) return;

      setUserId(String(data.userId));
      setIsPremium(Boolean(data.isPremium));

      // Persist premium locally for faster boot next time
      await AsyncStorage.setItem('isPremium', String(Boolean(data.isPremium)));
    } catch (error) {
      console.error('[UserContext] Failed to create user:', error);
    }
  };

  const refreshUserInternal = async (id: string) => {
    if (!apiBase) {
      console.warn('[UserContext] Skipping refreshUser because backend URL is missing.');
      return;
    }

    try {
      const res = await fetchWithTimeout(`${apiBase}/api/users/${id}`, {}, 15000);
      const data = await safeJson(res);

      if (!res.ok) {
        console.error('[UserContext] refreshUser failed:', { status: res.status, data });
        return;
      }

      const premium = Boolean(data?.isPremium);

      if (!mountedRef.current) return;

      setIsPremium(premium);
      await AsyncStorage.setItem('isPremium', String(premium));
    } catch (error) {
      console.error('[UserContext] Failed to refresh user:', error);
    }
  };

  // Public API functions (stable)
  const createUser = async () => {
    await createUserInternal();
  };

  const refreshUser = async () => {
    const targetId = userId;
    if (!targetId) return;
    await refreshUserInternal(targetId);
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('onboardingComplete', 'true');
    if (mountedRef.current) setHasCompletedOnboarding(true);
  };

  const setPremium = async (premium: boolean) => {
    try {
      // Local first: immediate UX
      if (mountedRef.current) setIsPremium(premium);
      await AsyncStorage.setItem('isPremium', String(premium));

      // Server best-effort
      if (!apiBase) {
        console.warn('[UserContext] Skipping server premium update because backend URL is missing.');
        return;
      }
      if (!userId) return;

      const res = await fetchWithTimeout(
        `${apiBase}/api/users/${userId}/premium?is_premium=${premium}`,
        { method: 'PATCH' },
        15000
      );

      if (!res.ok) {
        const data = await safeJson(res);
        console.error('[UserContext] Server error updating premium:', { status: res.status, data });
      }
    } catch (error) {
      console.error('[UserContext] Failed to update premium status:', error);
      // Keep local state anyway
    }
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        isPremium,
        isLoading,
        hasCompletedOnboarding,
        createUser,
        completeOnboarding,
        setPremium,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
}