/**
 * Ingredients Service
 * Handles saving and retrieving user's available ingredients
 * Auto-saves when user selects ingredients
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const LOCAL_INGREDIENTS_KEY = 'user_ingredients_cache';

interface IngredientsResponse {
  ingredients: string[];
  lastUpdated: string | null;
  count: number;
}

/**
 * Save ingredients to the server (and local cache)
 * @param userId User ID
 * @param ingredients Array of ingredient names
 * @param append If true, adds to existing. If false, replaces all.
 */
export async function saveIngredients(
  userId: string,
  ingredients: string[],
  append: boolean = true
): Promise<boolean> {
  try {
    // First save to local cache
    if (append) {
      const existing = await getLocalIngredients();
      const merged = [...new Set([...existing, ...ingredients])];
      await AsyncStorage.setItem(LOCAL_INGREDIENTS_KEY, JSON.stringify(merged));
    } else {
      await AsyncStorage.setItem(LOCAL_INGREDIENTS_KEY, JSON.stringify(ingredients));
    }

    // Then try to sync with server
    const response = await fetch(`${API_URL}/api/users/${userId}/ingredients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ingredients, append }),
    });

    return response.ok;
  } catch (error) {
    console.error('[Ingredients] Error saving:', error);
    // Even if server fails, local save succeeded
    return true;
  }
}

/**
 * Get ingredients from server, fallback to local cache
 */
export async function getIngredients(userId: string): Promise<string[]> {
  try {
    const response = await fetch(`${API_URL}/api/users/${userId}/ingredients`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data: IngredientsResponse = await response.json();
      // Update local cache
      await AsyncStorage.setItem(LOCAL_INGREDIENTS_KEY, JSON.stringify(data.ingredients));
      return data.ingredients;
    }
  } catch (error) {
    console.log('[Ingredients] Server fetch failed, using local cache');
  }

  // Fallback to local
  return getLocalIngredients();
}

/**
 * Get locally cached ingredients
 */
async function getLocalIngredients(): Promise<string[]> {
  try {
    const cached = await AsyncStorage.getItem(LOCAL_INGREDIENTS_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    return [];
  }
}

/**
 * Remove specific ingredients
 */
export async function removeIngredients(
  userId: string,
  ingredientsToRemove: string[]
): Promise<boolean> {
  try {
    // Update local cache
    const current = await getLocalIngredients();
    const filtered = current.filter(i => !ingredientsToRemove.includes(i));
    await AsyncStorage.setItem(LOCAL_INGREDIENTS_KEY, JSON.stringify(filtered));

    // Sync with server
    const response = await fetch(`${API_URL}/api/users/${userId}/ingredients`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients_to_remove: ingredientsToRemove }),
    });

    return response.ok;
  } catch (error) {
    console.error('[Ingredients] Error removing:', error);
    return true; // Local update succeeded
  }
}

/**
 * Clear all ingredients
 */
export async function clearAllIngredients(userId: string): Promise<boolean> {
  try {
    await AsyncStorage.setItem(LOCAL_INGREDIENTS_KEY, JSON.stringify([]));

    const response = await fetch(`${API_URL}/api/users/${userId}/ingredients`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    return response.ok;
  } catch (error) {
    console.error('[Ingredients] Error clearing:', error);
    return true;
  }
}
