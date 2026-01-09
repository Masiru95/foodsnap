import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function RecipeDetailScreen() {
  const { recipeData } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const recipe = recipeData ? JSON.parse(recipeData as string) : null;

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Recipe not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('cooking.recipeDetails')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.recipeName}>{recipe.name}</Text>
        <Text style={styles.recipeDescription}>{recipe.description}</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={20} color="#FF6B6B" />
            <Text style={styles.infoText}>
              {t('cooking.cookingTime', { time: recipe.cookingTime })}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="people" size={20} color="#FF6B6B" />
            <Text style={styles.infoText}>
              {recipe.servings} {t('cooking.servings')}
            </Text>
          </View>
        </View>

        <View style={styles.macrosContainer}>
          <View style={styles.macroBox}>
            <Text style={styles.macroValue}>{recipe.calories}</Text>
            <Text style={styles.macroLabel}>{t('trackFood.calories')}</Text>
          </View>
          <View style={styles.macroBox}>
            <Text style={styles.macroValue}>{recipe.protein}g</Text>
            <Text style={styles.macroLabel}>{t('trackFood.protein')}</Text>
          </View>
          <View style={styles.macroBox}>
            <Text style={styles.macroValue}>{recipe.carbs}g</Text>
            <Text style={styles.macroLabel}>{t('trackFood.carbs')}</Text>
          </View>
          <View style={styles.macroBox}>
            <Text style={styles.macroValue}>{recipe.fats}g</Text>
            <Text style={styles.macroLabel}>{t('trackFood.fats')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('trackFood.ingredients')}</Text>
          {recipe.ingredients.map((ingredient: string, index: number) => (
            <View key={index} style={styles.ingredientItem}>
              <Ionicons name="checkmark-circle" size={20} color="#FF6B6B" />
              <Text style={styles.ingredientText}>{ingredient}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('cooking.instructions')}</Text>
          {recipe.instructions.map((instruction: string, index: number) => (
            <View key={index} style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>

        {recipe.healthierOption && (
          <View style={styles.healthierSection}>
            <View style={styles.healthierHeader}>
              <Ionicons name="leaf" size={24} color="#4CAF50" />
              <Text style={styles.healthierTitle}>{t('cooking.healthierOption')}</Text>
            </View>
            <Text style={styles.healthierText}>{recipe.healthierOption}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  recipeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  recipeDescription: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 20,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#aaa',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  macroBox: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  macroLabel: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  ingredientText: {
    fontSize: 16,
    color: '#ddd',
    flex: 1,
  },
  instructionItem: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#ddd',
    lineHeight: 24,
  },
  healthierSection: {
    backgroundColor: '#4CAF5020',
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
  },
  healthierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  healthierTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  healthierText: {
    fontSize: 14,
    color: '#ddd',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
  },
});