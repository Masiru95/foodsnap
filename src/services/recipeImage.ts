/**
 * Recipe Image Service
 * Searches for food images using Unsplash API (free)
 * Falls back to a "sad plate" placeholder if no image found
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Unsplash API (free tier: 50 requests/hour)
const UNSPLASH_ACCESS_KEY = 'your_unsplash_access_key'; // We'll use demo mode
const CACHE_KEY_PREFIX = 'recipe_image_';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface CachedImage {
  url: string | null;
  photographer?: string;
  photographerUrl?: string;
  timestamp: number;
}

/**
 * Get cached image for a recipe
 */
async function getCachedImage(recipeName: string): Promise<CachedImage | null> {
  try {
    const key = CACHE_KEY_PREFIX + recipeName.toLowerCase().replace(/\s+/g, '_');
    const cached = await AsyncStorage.getItem(key);
    
    if (cached) {
      const data: CachedImage = JSON.parse(cached);
      // Check if cache is still valid
      if (Date.now() - data.timestamp < CACHE_DURATION) {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error('[RecipeImage] Cache read error:', error);
    return null;
  }
}

/**
 * Save image to cache
 */
async function cacheImage(recipeName: string, imageData: CachedImage): Promise<void> {
  try {
    const key = CACHE_KEY_PREFIX + recipeName.toLowerCase().replace(/\s+/g, '_');
    await AsyncStorage.setItem(key, JSON.stringify(imageData));
  } catch (error) {
    console.error('[RecipeImage] Cache write error:', error);
  }
}

/**
 * Search for a food image using Unsplash
 */
async function searchUnsplash(query: string): Promise<{
  url: string | null;
  photographer?: string;
  photographerUrl?: string;
}> {
  try {
    // Use Unsplash source (free, no API key needed for basic usage)
    // This returns a random image matching the query
    const searchQuery = encodeURIComponent(`${query} food dish plate`);
    
    // Try the Unsplash API first (if key is configured)
    if (UNSPLASH_ACCESS_KEY && UNSPLASH_ACCESS_KEY !== 'your_unsplash_access_key') {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=1&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const photo = data.results[0];
          return {
            url: photo.urls.regular,
            photographer: photo.user.name,
            photographerUrl: photo.user.links.html,
          };
        }
      }
    }
    
    // Fallback: Use Unsplash Source (simpler, no API key)
    // This URL will redirect to a random matching image
    const sourceUrl = `https://source.unsplash.com/800x600/?${searchQuery}`;
    
    // Verify the image exists by making a HEAD request
    const checkResponse = await fetch(sourceUrl, { method: 'HEAD' });
    if (checkResponse.ok) {
      // The final URL after redirect is the actual image
      return {
        url: checkResponse.url || sourceUrl,
        photographer: 'Unsplash',
        photographerUrl: 'https://unsplash.com',
      };
    }
    
    return { url: null };
  } catch (error) {
    console.error('[RecipeImage] Unsplash search error:', error);
    return { url: null };
  }
}

/**
 * Alternative free image sources
 */
async function searchAlternativeSources(query: string): Promise<string | null> {
  try {
    // Try Foodish API (free, random food images)
    // Note: This returns random food, not specific dishes
    const foodishResponse = await fetch('https://foodish-api.com/api/');
    if (foodishResponse.ok) {
      const data = await foodishResponse.json();
      if (data.image) {
        return data.image;
      }
    }
  } catch (error) {
    console.log('[RecipeImage] Alternative source failed:', error);
  }
  
  return null;
}

/**
 * Main function: Get image for a recipe
 * Returns cached image if available, otherwise searches and caches
 */
export async function getRecipeImage(recipeName: string, cuisine?: string): Promise<{
  url: string | null;
  photographer?: string;
  photographerUrl?: string;
  fromCache: boolean;
}> {
  // Check cache first
  const cached = await getCachedImage(recipeName);
  if (cached) {
    console.log('[RecipeImage] Cache hit for:', recipeName);
    return {
      url: cached.url,
      photographer: cached.photographer,
      photographerUrl: cached.photographerUrl,
      fromCache: true,
    };
  }
  
  console.log('[RecipeImage] Searching for:', recipeName);
  
  // Build search query with recipe name and cuisine for better results
  let searchQuery = recipeName;
  if (cuisine) {
    searchQuery = `${cuisine} ${recipeName}`;
  }
  
  // Try Unsplash first
  const unsplashResult = await searchUnsplash(searchQuery);
  
  if (unsplashResult.url) {
    // Cache the result
    await cacheImage(recipeName, {
      url: unsplashResult.url,
      photographer: unsplashResult.photographer,
      photographerUrl: unsplashResult.photographerUrl,
      timestamp: Date.now(),
    });
    
    return {
      ...unsplashResult,
      fromCache: false,
    };
  }
  
  // If Unsplash fails, try alternative sources
  const alternativeUrl = await searchAlternativeSources(searchQuery);
  
  if (alternativeUrl) {
    await cacheImage(recipeName, {
      url: alternativeUrl,
      timestamp: Date.now(),
    });
    
    return {
      url: alternativeUrl,
      fromCache: false,
    };
  }
  
  // No image found - cache the null result to avoid repeated searches
  await cacheImage(recipeName, {
    url: null,
    timestamp: Date.now(),
  });
  
  return {
    url: null,
    fromCache: false,
  };
}

/**
 * Clear all cached recipe images
 */
export async function clearRecipeImageCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const recipeImageKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
    await AsyncStorage.multiRemove(recipeImageKeys);
    console.log('[RecipeImage] Cache cleared:', recipeImageKeys.length, 'items');
  } catch (error) {
    console.error('[RecipeImage] Cache clear error:', error);
  }
}

/**
 * Country code to flag emoji mapping
 */
export function getCountryFlag(country: string): string {
  const countryFlags: Record<string, string> = {
    // Europe
    'italy': '🇮🇹',
    'italian': '🇮🇹',
    'italia': '🇮🇹',
    'france': '🇫🇷',
    'french': '🇫🇷',
    'francia': '🇫🇷',
    'spain': '🇪🇸',
    'spanish': '🇪🇸',
    'españa': '🇪🇸',
    'germany': '🇩🇪',
    'german': '🇩🇪',
    'alemania': '🇩🇪',
    'greece': '🇬🇷',
    'greek': '🇬🇷',
    'grecia': '🇬🇷',
    'portugal': '🇵🇹',
    'portuguese': '🇵🇹',
    'uk': '🇬🇧',
    'british': '🇬🇧',
    'england': '🇬🇧',
    'reino unido': '🇬🇧',
    'ireland': '🇮🇪',
    'irish': '🇮🇪',
    'irlanda': '🇮🇪',
    'sweden': '🇸🇪',
    'swedish': '🇸🇪',
    'suecia': '🇸🇪',
    'russia': '🇷🇺',
    'russian': '🇷🇺',
    'rusia': '🇷🇺',
    'poland': '🇵🇱',
    'polish': '🇵🇱',
    'polonia': '🇵🇱',
    'netherlands': '🇳🇱',
    'dutch': '🇳🇱',
    'holanda': '🇳🇱',
    
    // Asia
    'japan': '🇯🇵',
    'japanese': '🇯🇵',
    'japón': '🇯🇵',
    'china': '🇨🇳',
    'chinese': '🇨🇳',
    'korea': '🇰🇷',
    'korean': '🇰🇷',
    'corea': '🇰🇷',
    'thailand': '🇹🇭',
    'thai': '🇹🇭',
    'tailandia': '🇹🇭',
    'vietnam': '🇻🇳',
    'vietnamese': '🇻🇳',
    'india': '🇮🇳',
    'indian': '🇮🇳',
    'indonesia': '🇮🇩',
    'indonesian': '🇮🇩',
    'malaysia': '🇲🇾',
    'malaysian': '🇲🇾',
    'malasia': '🇲🇾',
    'philippines': '🇵🇭',
    'filipino': '🇵🇭',
    'filipinas': '🇵🇭',
    'turkey': '🇹🇷',
    'turkish': '🇹🇷',
    'turquía': '🇹🇷',
    
    // Americas
    'usa': '🇺🇸',
    'american': '🇺🇸',
    'united states': '🇺🇸',
    'estados unidos': '🇺🇸',
    'mexico': '🇲🇽',
    'mexican': '🇲🇽',
    'méxico': '🇲🇽',
    'brazil': '🇧🇷',
    'brazilian': '🇧🇷',
    'brasil': '🇧🇷',
    'argentina': '🇦🇷',
    'argentinian': '🇦🇷',
    'peru': '🇵🇪',
    'peruvian': '🇵🇪',
    'perú': '🇵🇪',
    'colombia': '🇨🇴',
    'colombian': '🇨🇴',
    'chile': '🇨🇱',
    'chilean': '🇨🇱',
    'cuba': '🇨🇺',
    'cuban': '🇨🇺',
    'jamaica': '🇯🇲',
    'jamaican': '🇯🇲',
    'canada': '🇨🇦',
    'canadian': '🇨🇦',
    'canadá': '🇨🇦',
    
    // Africa & Middle East
    'morocco': '🇲🇦',
    'moroccan': '🇲🇦',
    'marruecos': '🇲🇦',
    'egypt': '🇪🇬',
    'egyptian': '🇪🇬',
    'egipto': '🇪🇬',
    'ethiopia': '🇪🇹',
    'ethiopian': '🇪🇹',
    'etiopía': '🇪🇹',
    'south africa': '🇿🇦',
    'sudáfrica': '🇿🇦',
    'lebanon': '🇱🇧',
    'lebanese': '🇱🇧',
    'líbano': '🇱🇧',
    'israel': '🇮🇱',
    'israeli': '🇮🇱',
    
    // Oceania
    'australia': '🇦🇺',
    'australian': '🇦🇺',
    'new zealand': '🇳🇿',
    'nueva zelanda': '🇳🇿',
    
    // Generic/Regional
    'mediterranean': '🌊',
    'mediterráneo': '🌊',
    'asian': '🌏',
    'asiático': '🌏',
    'latin': '🌎',
    'latino': '🌎',
    'european': '🇪🇺',
    'europeo': '🇪🇺',
    'african': '🌍',
    'africano': '🌍',
    'middle eastern': '🌙',
    'árabe': '🌙',
    'caribbean': '🏝️',
    'caribeño': '🏝️',
  };
  
  const lowerCountry = country.toLowerCase().trim();
  return countryFlags[lowerCountry] || '🍽️';
}
