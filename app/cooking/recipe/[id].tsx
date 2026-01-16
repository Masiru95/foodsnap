/**
 * Recipe Detail Screen
 * Shows full recipe with photo (searched from Unsplash)
 * If no photo found, shows a cute "sad plate" placeholder
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getRecipeImage, getCountryFlag } from '../../../src/services/recipeImage';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 280;

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  
  const [recipe, setRecipe] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (params.recipeData) {
      try {
        const parsed = JSON.parse(params.recipeData as string);
        setRecipe(parsed);
        loadRecipeImage(parsed);
      } catch (error) {
        console.error('Failed to parse recipe data:', error);
      }
    }
  }, [params.recipeData]);

  const loadRecipeImage = async (recipeData: any) => {
    setIsLoadingImage(true);
    setImageError(false);
    
    try {
      const result = await getRecipeImage(
        recipeData.name,
        recipeData.cuisine || recipeData.countryOfOrigin
      );
      
      if (result.url) {
        setImageUrl(result.url);
      } else {
        setImageError(true);
      }
    } catch (error) {
      console.error('Failed to load recipe image:', error);
      setImageError(true);
    } finally {
      setIsLoadingImage(false);
    }
  };

  if (!recipe) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  const countryFlag = getCountryFlag(recipe.countryOfOrigin || recipe.cuisine || '');

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Section */}
        <View style={styles.imageContainer}>
          {isLoadingImage ? (
            <View style={styles.imagePlaceholder}>
              <ActivityIndicator size="large" color="#FF6B6B" />
              <Text style={styles.loadingImageText}>{t('recipe.loadingImage')}</Text>
            </View>
          ) : imageError || !imageUrl ? (
            // Sad plate placeholder
            <View style={styles.sadPlateContainer}>
              <View style={styles.sadPlate}>
                <Text style={styles.sadPlateEmoji}>🍽️</Text>
                <View style={styles.sadFace}>
                  <Text style={styles.sadEyes}>• •</Text>
                  <Text style={styles.sadMouth}>︵</Text>
                </View>
              </View>
              <View style={styles.flagBadge}>
                <Text style={styles.flagEmoji}>{countryFlag}</Text>
              </View>
              <Text style={styles.sadPlateText}>
                {t('recipe.noImageFound')}
              </Text>
            </View>
          ) : (
            <Image
              source={{ uri: imageUrl }}
              style={styles.recipeImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          )}
          
          {/* Country badge on image */}
          {!imageError && imageUrl && (recipe.countryOfOrigin || recipe.cuisine) && (
            <View style={styles.countryBadgeOnImage}>
              <Text style={styles.countryFlagText}>{countryFlag}</Text>
              <Text style={styles.countryNameText}>
                {recipe.countryOfOrigin || recipe.cuisine}
              </Text>
            </View>
          )}
        </View>

        {/* Recipe Info */}
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          
          {/* Meta info row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={18} color="#FF6B6B" />
              <Text style={styles.metaText}>{recipe.cookingTime} min</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="flame-outline" size={18} color="#FF6B6B" />
              <Text style={styles.metaText}>{recipe.calories} cal</Text>
            </View>
            
            {(recipe.countryOfOrigin || recipe.cuisine) && (
              <View style={styles.metaItem}>
                <Text style={styles.metaFlag}>{countryFlag}</Text>
                <Text style={styles.metaText}>
                  {recipe.cuisine || recipe.countryOfOrigin}
                </Text>
              </View>
            )}
          </View>

          {/* Macros */}
          <View style={styles.macrosContainer}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{recipe.protein}g</Text>
              <Text style={styles.macroLabel}>{t('recipe.protein')}</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{recipe.carbs}g</Text>
              <Text style={styles.macroLabel}>{t('recipe.carbs')}</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{recipe.fats}g</Text>
              <Text style={styles.macroLabel}>{t('recipe.fats')}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>{t('recipe.description')}</Text>
          <Text style={styles.description}>{recipe.description}</Text>

          {/* Ingredients */}
          <Text style={styles.sectionTitle}>{t('recipe.ingredients')}</Text>
          <View style={styles.ingredientsList}>
            {recipe.ingredients?.map((ingredient: string, index: number) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.ingredientBullet} />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>

          {/* Instructions */}
          <Text style={styles.sectionTitle}>{t('recipe.instructions')}</Text>
          <View style={styles.instructionsList}>
            {recipe.instructions?.map((instruction: string, index: number) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>

          {/* Tips if available */}
          {recipe.tips && recipe.tips.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>{t('recipe.tips')}</Text>
              <View style={styles.tipsContainer}>
                <Ionicons name="bulb-outline" size={20} color="#FFD700" />
                <View style={styles.tipsList}>
                  {recipe.tips.map((tip: string, index: number) => (
                    <Text key={index} style={styles.tipText}>• {tip}</Text>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Bottom spacing */}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0c0c0c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Image section
  imageContainer: {
    width: width,
    height: IMAGE_HEIGHT,
    backgroundColor: '#1a1a1a',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingImageText: {
    color: '#888',
    marginTop: 12,
    fontSize: 14,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  countryBadgeOnImage: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  countryFlagText: {
    fontSize: 18,
  },
  countryNameText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },

  // Sad plate placeholder
  sadPlateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  sadPlate: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sadPlateEmoji: {
    fontSize: 80,
  },
  sadFace: {
    position: 'absolute',
    top: '35%',
    alignItems: 'center',
  },
  sadEyes: {
    fontSize: 16,
    color: '#555',
    letterSpacing: 8,
  },
  sadMouth: {
    fontSize: 24,
    color: '#555',
    marginTop: -4,
  },
  flagBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 8,
    borderRadius: 12,
  },
  flagEmoji: {
    fontSize: 32,
  },
  sadPlateText: {
    color: '#666',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 40,
    fontStyle: 'italic',
  },

  // Recipe info
  recipeInfo: {
    padding: 20,
  },
  recipeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#aaa',
    fontSize: 14,
  },
  metaFlag: {
    fontSize: 16,
  },

  // Macros
  macrosContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  macroLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  macroDivider: {
    width: 1,
    backgroundColor: '#333',
  },

  // Sections
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    marginTop: 8,
  },
  description: {
    fontSize: 16,
    color: '#aaa',
    lineHeight: 24,
    marginBottom: 20,
  },

  // Ingredients
  ingredientsList: {
    marginBottom: 24,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingRight: 16,
  },
  ingredientBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    marginTop: 6,
    marginRight: 12,
  },
  ingredientText: {
    flex: 1,
    fontSize: 16,
    color: '#ddd',
    lineHeight: 22,
  },

  // Instructions
  instructionsList: {
    marginBottom: 24,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#ddd',
    lineHeight: 24,
  },

  // Tips
  tipsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  tipsList: {
    flex: 1,
  },
  tipText: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 22,
    marginBottom: 4,
  },
});
