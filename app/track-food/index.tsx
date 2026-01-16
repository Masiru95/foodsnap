import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/src/contexts/UserContext';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function TrackFoodScreen() {
  const { userId } = useUser();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [portions, setPortions] = useState(1);

  const PORTION_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3];

  const getAdjustedValue = (value: number) => {
    return Math.round(value * portions);
  };

  const getAdjustedDecimal = (value: number) => {
    return (value * portions).toFixed(1);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(t('common.error'), 'Camera permission is needed.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setSelectedImage(result.assets[0].uri);
      analyzeFood(result.assets[0].base64);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setSelectedImage(result.assets[0].uri);
      analyzeFood(result.assets[0].base64);
    }
  };

  const analyzeFood = async (base64Image: string) => {
    if (!userId) {
      Alert.alert(t('common.error'), 'User not found. Please restart the app.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    try {
      console.log('Starting food analysis...');
      const response = await fetch(`${API_URL}/api/analyze-food`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          imageBase64: base64Image,
          language: i18n.language,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check if response is OK
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', response.status, errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate response has required fields
      if (!data.dishName || data.calories === undefined) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format');
      }
      
      console.log('Analysis successful:', data.dishName);
      setAnalysisResult(data);
    } catch (error: any) {
      console.error('Failed to analyze food:', error);
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        Alert.alert(
          t('trackFood.analysisFailed'), 
          'Analysis took too long. Please try again with a clearer photo.'
        );
      } else {
        Alert.alert(t('trackFood.analysisFailed'), t('trackFood.analysisFailedMessage'));
      }
      
      setSelectedImage(null);
      setAnalysisResult(null);
    } finally {
      clearTimeout(timeoutId);
      setIsAnalyzing(false);
    }
  };

  const saveMeal = async () => {
    if (!userId || !selectedImage || !analysisResult) return;

    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];

        // Save with adjusted values based on portions
        await fetch(`${API_URL}/api/meals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            photoBase64: base64Data,
            dishName: analysisResult.dishName,
            calories: getAdjustedValue(analysisResult.calories),
            protein: parseFloat(getAdjustedDecimal(analysisResult.protein)),
            carbs: parseFloat(getAdjustedDecimal(analysisResult.carbs)),
            fats: parseFloat(getAdjustedDecimal(analysisResult.fats)),
            ingredients: analysisResult.ingredients,
            warnings: analysisResult.warnings,
            portions: portions,
          }),
        });

        Alert.alert(t('common.success'), t('trackFood.mealSaved'));
        router.back();
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Failed to save meal:', error);
      Alert.alert(t('trackFood.saveFailed'), t('trackFood.saveFailedMessage'));
    }
  };

  const cancel = () => {
    router.back();
  };

  if (selectedImage) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={cancel}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('trackFood.title')}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.image} />
        </View>

        {isAnalyzing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loadingText}>{t('trackFood.analyzing')}</Text>
          </View>
        ) : analysisResult ? (
          <View style={styles.resultContainer}>
            <Text style={styles.dishName}>{analysisResult.dishName}</Text>

            {/* Portion Selector */}
            <View style={styles.portionContainer}>
              <Text style={styles.portionLabel}>{t('trackFood.portionSize')}</Text>
              <View style={styles.portionButtons}>
                {PORTION_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.portionButton,
                      portions === option && styles.portionButtonActive,
                    ]}
                    onPress={() => setPortions(option)}
                  >
                    <Text
                      style={[
                        styles.portionButtonText,
                        portions === option && styles.portionButtonTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.macrosContainer}>
              <View style={styles.macroBox}>
                <Text style={styles.macroValue}>{getAdjustedValue(analysisResult.calories)}</Text>
                <Text style={styles.macroLabel}>{t('trackFood.calories')}</Text>
              </View>
              <View style={styles.macroBox}>
                <Text style={styles.macroValue}>{getAdjustedDecimal(analysisResult.protein)}g</Text>
                <Text style={styles.macroLabel}>{t('trackFood.protein')}</Text>
              </View>
              <View style={styles.macroBox}>
                <Text style={styles.macroValue}>{getAdjustedDecimal(analysisResult.carbs)}g</Text>
                <Text style={styles.macroLabel}>{t('trackFood.carbs')}</Text>
              </View>
              <View style={styles.macroBox}>
                <Text style={styles.macroValue}>{getAdjustedDecimal(analysisResult.fats)}g</Text>
                <Text style={styles.macroLabel}>{t('trackFood.fats')}</Text>
              </View>
            </View>

            {analysisResult.warnings && analysisResult.warnings.length > 0 && (
              <View style={styles.warningsContainer}>
                {analysisResult.warnings.map((warning: string, index: number) => (
                  <View key={index} style={styles.warningItem}>
                    <Ionicons name="warning" size={16} color="#FFA500" />
                    <Text style={styles.warningText}>{warning}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.ingredientsContainer}>
              <Text style={styles.sectionTitle}>{t('trackFood.ingredients')}</Text>
              {analysisResult.ingredients.map((ingredient: string, index: number) => (
                <Text key={index} style={styles.ingredientText}>• {ingredient}</Text>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={cancel}>
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveMeal}>
                <Text style={styles.saveButtonText}>{t('trackFood.saveMeal')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={cancel}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('trackFood.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Ionicons name="camera" size={120} color="#FF6B6B" />
        <Text style={styles.instructionText}>{t('trackFood.instruction')}</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={pickImage}>
          <Ionicons name="camera" size={24} color="#fff" />
          <Text style={styles.primaryButtonText}>{t('trackFood.takePhoto')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={pickFromGallery}>
          <Ionicons name="images" size={24} color="#FF6B6B" />
          <Text style={styles.secondaryButtonText}>{t('trackFood.chooseGallery')}</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  portionContainer: {
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
  },
  portionLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  portionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  portionButton: {
    flex: 1,
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  portionButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  portionButtonText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
  },
  portionButtonTextActive: {
    color: '#fff',
  },
  instructionText: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#1a1a1a',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  resultContainer: {
    padding: 20,
  },
  dishName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
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
  warningsContainer: {
    backgroundColor: '#FFA50020',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  warningText: {
    color: '#FFA500',
    fontSize: 14,
  },
  ingredientsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  ingredientText: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});