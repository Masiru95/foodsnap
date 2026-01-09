import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../src/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function OnboardingScreen() {
  const router = useRouter();
  const { userId, completeOnboarding } = useUser();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);

  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<string>('moderate');

  const handleFinish = async () => {
    if (!age || !height || !weight) {
      Alert.alert(t('onboarding.missingInfo'), t('onboarding.fillAllFields'));
      return;
    }

    try {
      await fetch(`${API_URL}/api/users/${userId}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          age: parseInt(age),
          height: parseFloat(height),
          weight: parseFloat(weight),
          activityLevel,
          goal,
        }),
      });

      await completeOnboarding();
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Failed to save goals:', error);
      Alert.alert(t('common.error'), 'Failed to save your information. Please try again.');
    }
  };

  if (step === 1) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Ionicons name="restaurant" size={80} color="#FF6B6B" />
          <Text style={styles.title}>{t('onboarding.welcome')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.subtitle')}</Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="camera" size={24} color="#FF6B6B" />
              <Text style={styles.featureText}>{t('onboarding.feature1')}</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="analytics" size={24} color="#FF6B6B" />
              <Text style={styles.featureText}>{t('onboarding.feature2')}</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="trending-up" size={24} color="#FF6B6B" />
              <Text style={styles.featureText}>{t('onboarding.feature3')}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
            <Text style={styles.buttonText}>{t('onboarding.getStarted')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (step === 2) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{t('onboarding.goal')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.goalSubtitle')}</Text>

          <TouchableOpacity
            style={[styles.goalCard, goal === 'lose' && styles.goalCardSelected]}
            onPress={() => setGoal('lose')}
          >
            <Ionicons
              name="trending-down"
              size={32}
              color={goal === 'lose' ? '#FF6B6B' : '#aaa'}
            />
            <Text style={[styles.goalTitle, goal === 'lose' && styles.goalTitleSelected]}>
              {t('onboarding.loseWeight')}
            </Text>
            <Text style={styles.goalDescription}>{t('onboarding.loseWeightDesc')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.goalCard, goal === 'maintain' && styles.goalCardSelected]}
            onPress={() => setGoal('maintain')}
          >
            <Ionicons
              name="remove"
              size={32}
              color={goal === 'maintain' ? '#FF6B6B' : '#aaa'}
            />
            <Text style={[styles.goalTitle, goal === 'maintain' && styles.goalTitleSelected]}>
              {t('onboarding.maintainWeight')}
            </Text>
            <Text style={styles.goalDescription}>{t('onboarding.maintainWeightDesc')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.goalCard, goal === 'gain' && styles.goalCardSelected]}
            onPress={() => setGoal('gain')}
          >
            <Ionicons
              name="trending-up"
              size={32}
              color={goal === 'gain' ? '#FF6B6B' : '#aaa'}
            />
            <Text style={[styles.goalTitle, goal === 'gain' && styles.goalTitleSelected]}>
              {t('onboarding.gainMuscle')}
            </Text>
            <Text style={styles.goalDescription}>{t('onboarding.gainMuscleDesc')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => setStep(3)}>
            <Text style={styles.buttonText}>{t('common.continue')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('onboarding.aboutYou')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.aboutYouSubtitle')}</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('onboarding.age')}</Text>
          <TextInput
            style={styles.input}
            placeholder="25"
            placeholderTextColor="#555"
            keyboardType="number-pad"
            value={age}
            onChangeText={setAge}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('onboarding.height')}</Text>
          <TextInput
            style={styles.input}
            placeholder="170"
            placeholderTextColor="#555"
            keyboardType="decimal-pad"
            value={height}
            onChangeText={setHeight}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('onboarding.weight')}</Text>
          <TextInput
            style={styles.input}
            placeholder="70"
            placeholderTextColor="#555"
            keyboardType="decimal-pad"
            value={weight}
            onChangeText={setWeight}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('onboarding.activityLevel')}</Text>
          <View style={styles.activityButtons}>
            {[
              { key: 'sedentary', label: t('onboarding.sedentary') },
              { key: 'light', label: t('onboarding.light') },
              { key: 'moderate', label: t('onboarding.moderate') },
              { key: 'active', label: t('onboarding.active') },
              { key: 'very_active', label: t('onboarding.veryActive') },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.activityButton,
                  activityLevel === item.key && styles.activityButtonSelected,
                ]}
                onPress={() => setActivityLevel(item.key)}
              >
                <Text
                  style={[
                    styles.activityButtonText,
                    activityLevel === item.key && styles.activityButtonTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleFinish}>
          <Text style={styles.buttonText}>{t('onboarding.finishSetup')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 40,
  },
  featuresList: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    gap: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  goalCard: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalCardSelected: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FF6B6B10',
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#aaa',
    marginTop: 12,
    marginBottom: 4,
  },
  goalTitleSelected: {
    color: '#FF6B6B',
  },
  goalDescription: {
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  activityButtons: {
    gap: 8,
  },
  activityButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  activityButtonSelected: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FF6B6B10',
  },
  activityButtonText: {
    fontSize: 16,
    color: '#aaa',
  },
  activityButtonTextSelected: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#FF6B6B',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});