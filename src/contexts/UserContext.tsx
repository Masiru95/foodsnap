import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// Helper function for fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

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

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      console.log('[UserContext] Starting initialization...');
      const storedUserId = await AsyncStorage.getItem('userId');
      const onboardingComplete = await AsyncStorage.getItem('onboardingComplete');
      const storedPremium = await AsyncStorage.getItem('isPremium');
      
      // Set premium from local storage first
      if (storedPremium === 'true') {
        setIsPremium(true);
      }
      
      if (storedUserId) {
        console.log('[UserContext] Found stored user:', storedUserId);
        setUserId(storedUserId);
        setHasCompletedOnboarding(onboardingComplete === 'true');
        // Don't await this - let it run in background
        refreshUser(storedUserId).catch(console.error);
      } else {
        console.log('[UserContext] No stored user, creating new...');
        await createUser();
      }
    } catch (error) {
      console.error('[UserContext] Failed to initialize user:', error);
      // Even on error, we should stop loading to prevent infinite hang
    } finally {
      console.log('[UserContext] Initialization complete');
      setIsLoading(false);
    }
  };

  const createUser = async () => {
    try {
      console.log('[UserContext] Creating new user...');
      const response = await fetchWithTimeout(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }, 15000); // 15 second timeout
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      await AsyncStorage.setItem('userId', data.userId);
      setUserId(data.userId);
      setIsPremium(data.isPremium);
      console.log('[UserContext] User created:', data.userId);
    } catch (error) {
      console.error('[UserContext] Failed to create user:', error);
      // Generate a local UUID as fallback
      const fallbackId = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      await AsyncStorage.setItem('userId', fallbackId);
      setUserId(fallbackId);
      console.log('[UserContext] Using fallback user ID:', fallbackId);
    }
  };

  const refreshUser = async (id?: string) => {
    const targetId = id || userId;
    if (!targetId) return;
    
    try {
      console.log('[UserContext] Refreshing user data...');
      const response = await fetchWithTimeout(`${API_URL}/api/users/${targetId}`, {}, 10000);
      
      if (!response.ok) {
        console.warn('[UserContext] Server returned non-OK status:', response.status);
        return;
      }
      
      const data = await response.json();
      setIsPremium(data.isPremium || false);
      console.log('[UserContext] User refreshed, isPremium:', data.isPremium);
    } catch (error) {
      console.error('[UserContext] Failed to refresh user:', error);
      // Don't throw - this is a non-critical operation
    }
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('onboardingComplete', 'true');
    setHasCompletedOnboarding(true);
  };

  const setPremium = async (premium: boolean) => {
    try {
      // Update locally first for immediate UI feedback
      console.log('[UserContext] Setting premium to:', premium);
      setIsPremium(premium);
      await AsyncStorage.setItem('isPremium', premium.toString());
      console.log('[UserContext] Premium state updated successfully');
      
      // Then update on server if userId exists (non-blocking)
      if (userId) {
        fetchWithTimeout(`${API_URL}/api/users/${userId}/premium?is_premium=${premium}`, {
          method: 'PATCH',
        }, 10000).catch((error) => {
          console.warn('[UserContext] Server premium update failed:', error);
          // Keep the local state even if server fails
        });
      }
    } catch (error) {
      console.error('[UserContext] Failed to update premium status:', error);
      // Keep the local state even if something fails
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
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}