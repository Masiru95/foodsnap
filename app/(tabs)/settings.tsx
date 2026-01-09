import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePremium } from '../../src/contexts/PremiumContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../src/i18n';
import {
  registerForPushNotificationsAsync,
  scheduleLunchReminder,
  scheduleDinnerReminder,
  getLunchReminderStatus,
  getDinnerReminderStatus,
} from '../../src/services/notifications';

export default function SettingsScreen() {
  const { isPremium } = usePremium();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [saveToGallery, setSaveToGallery] = useState(true);
  const [lunchReminder, setLunchReminder] = useState(false);
  const [dinnerReminder, setDinnerReminder] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedPref = await AsyncStorage.getItem('saveToGallery');
    if (savedPref !== null) {
      setSaveToGallery(savedPref === 'true');
    }
    
    // Load notification settings
    const lunchStatus = await getLunchReminderStatus();
    const dinnerStatus = await getDinnerReminderStatus();
    setLunchReminder(lunchStatus);
    setDinnerReminder(dinnerStatus);
  };

  const toggleSaveToGallery = async (value: boolean) => {
    setSaveToGallery(value);
    await AsyncStorage.setItem('saveToGallery', value.toString());
  };

  const toggleLunchReminder = async (value: boolean) => {
    if (value) {
      await registerForPushNotificationsAsync();
    }
    await scheduleLunchReminder(value, i18n.language);
    setLunchReminder(value);
    
    if (value) {
      Alert.alert(
        t('settings.notificationsEnabled'),
        t('settings.lunchReminderDesc')
      );
    }
  };

  const toggleDinnerReminder = async (value: boolean) => {
    if (value) {
      await registerForPushNotificationsAsync();
    }
    await scheduleDinnerReminder(value, i18n.language);
    setDinnerReminder(value);
    
    if (value) {
      Alert.alert(
        t('settings.notificationsEnabled'),
        t('settings.dinnerReminderDesc')
      );
    }
  };

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    await changeLanguage(newLang);
    
    // Update notifications with new language
    if (lunchReminder) {
      await scheduleLunchReminder(true, newLang);
    }
    if (dinnerReminder) {
      await scheduleDinnerReminder(true, newLang);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>{t('settings.subtitle')}</Text>
      </View>

      <ScrollView style={styles.content}>
        {isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={24} color="#FFD700" />
            <Text style={styles.premiumText}>{t('settings.premiumMember')}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.general')}</Text>
          
          <TouchableOpacity style={styles.settingRow} onPress={toggleLanguage}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('settings.language')}</Text>
              <Text style={styles.settingDescription}>
                {i18n.language === 'en' ? 'English' : 'Español'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#aaa" />
          </TouchableOpacity>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('settings.saveToGallery')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.saveToGalleryDesc')}
              </Text>
            </View>
            <Switch
              value={saveToGallery}
              onValueChange={toggleSaveToGallery}
              trackColor={{ false: '#333', true: '#FF6B6B' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('settings.lunchReminder')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.lunchReminderDesc')}
              </Text>
            </View>
            <Switch
              value={lunchReminder}
              onValueChange={toggleLunchReminder}
              trackColor={{ false: '#333', true: '#FF6B6B' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('settings.dinnerReminder')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.dinnerReminderDesc')}
              </Text>
            </View>
            <Switch
              value={dinnerReminder}
              onValueChange={toggleDinnerReminder}
              trackColor={{ false: '#333', true: '#FF6B6B' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.subscription')}</Text>
          
          {!isPremium ? (
            <TouchableOpacity
              style={styles.upgradeCard}
              onPress={() => router.push('/paywall')}
            >
              <View style={styles.upgradeContent}>
                <Ionicons name="star" size={40} color="#FFD700" />
                <View style={styles.upgradeText}>
                  <Text style={styles.upgradeTitle}>{t('settings.upgradePremium')}</Text>
                  <Text style={styles.upgradeDescription}>
                    {t('settings.upgradePremiumDesc')}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#aaa" />
            </TouchableOpacity>
          ) : (
            <View style={styles.premiumCard}>
              <Text style={styles.premiumCardText}>{t('settings.premiumActive')}</Text>
              <Text style={styles.premiumCardSubtext}>{t('settings.premiumActiveDesc')}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/legal/privacy')}
          >
            <Text style={styles.menuText}>{t('settings.privacyPolicy')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#aaa" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/legal/terms')}
          >
            <Text style={styles.menuText}>{t('settings.termsOfService')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#aaa" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/legal/help')}
          >
            <Text style={styles.menuText}>{t('settings.helpSupport')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#aaa" />
          </TouchableOpacity>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>{t('settings.version')}</Text>
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
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70020',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 12,
  },
  premiumText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#aaa',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#aaa',
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  upgradeText: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  upgradeDescription: {
    fontSize: 14,
    color: '#aaa',
  },
  premiumCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  premiumCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  premiumCardSubtext: {
    fontSize: 14,
    color: '#aaa',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuText: {
    fontSize: 16,
    color: '#fff',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  versionText: {
    fontSize: 14,
    color: '#555',
  },
});