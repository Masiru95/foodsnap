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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePremium } from '../../src/contexts/PremiumContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getSupportedLanguages } from '../../src/i18n';
import {
  registerForPushNotificationsAsync,
  scheduleLunchReminder,
  scheduleDinnerReminder,
  scheduleSnackReminder,
  scheduleFridayReminder,
  getLunchReminderStatus,
  getDinnerReminderStatus,
  getSnackReminderStatus,
  getFridayReminderStatus,
} from '../../src/services/notifications';

export default function SettingsScreen() {
  const { isPremium } = usePremium();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [saveToGallery, setSaveToGallery] = useState(true);
  const [lunchReminder, setLunchReminder] = useState(false);
  const [dinnerReminder, setDinnerReminder] = useState(false);
  const [snackReminder, setSnackReminder] = useState(false);
  const [fridayReminder, setFridayReminder] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  
  const supportedLanguages = getSupportedLanguages();

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
    const snackStatus = await getSnackReminderStatus();
    const fridayStatus = await getFridayReminderStatus();
    setLunchReminder(lunchStatus);
    setDinnerReminder(dinnerStatus);
    setSnackReminder(snackStatus);
    setFridayReminder(fridayStatus);
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

  const toggleSnackReminder = async (value: boolean) => {
    if (value) {
      await registerForPushNotificationsAsync();
    }
    await scheduleSnackReminder(value, i18n.language);
    setSnackReminder(value);
    
    if (value) {
      Alert.alert(
        t('settings.notificationsEnabled'),
        t('settings.snackReminderDesc')
      );
    }
  };

  const toggleFridayReminder = async (value: boolean) => {
    if (value) {
      await registerForPushNotificationsAsync();
    }
    await scheduleFridayReminder(value, i18n.language);
    setFridayReminder(value);
    
    if (value) {
      Alert.alert(
        t('settings.notificationsEnabled'),
        t('settings.fridayReminderDesc')
      );
    }
  };

  const toggleLanguage = async () => {
    setLanguageModalVisible(true);
  };

  const selectLanguage = async (langCode: string) => {
    await changeLanguage(langCode);
    setLanguageModalVisible(false);
    
    // Update all notifications with new language
    if (lunchReminder) await scheduleLunchReminder(true, langCode);
    if (dinnerReminder) await scheduleDinnerReminder(true, langCode);
    if (snackReminder) await scheduleSnackReminder(true, langCode);
    if (fridayReminder) await scheduleFridayReminder(true, langCode);
  };

  const getCurrentLanguageDisplay = () => {
    const currentLang = supportedLanguages.find(l => l.code === i18n.language);
    return currentLang ? `${currentLang.flag} ${currentLang.name}` : 'English';
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
                {getCurrentLanguageDisplay()}
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

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('settings.snackReminder')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.snackReminderDesc')}
              </Text>
            </View>
            <Switch
              value={snackReminder}
              onValueChange={toggleSnackReminder}
              trackColor={{ false: '#333', true: '#FF6B6B' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('settings.fridayReminder')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.fridayReminderDesc')}
              </Text>
            </View>
            <Switch
              value={fridayReminder}
              onValueChange={toggleFridayReminder}
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

      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setLanguageModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.language')}</Text>
            {supportedLanguages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  i18n.language === lang.code && styles.languageOptionSelected
                ]}
                onPress={() => selectLanguage(lang.code)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text style={[
                  styles.languageText,
                  i18n.language === lang.code && styles.languageTextSelected
                ]}>
                  {lang.name}
                </Text>
                {i18n.language === lang.code && (
                  <Ionicons name="checkmark" size={24} color="#FF6B6B" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  // Language Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#2a2a2a',
  },
  languageOptionSelected: {
    backgroundColor: '#FF6B6B20',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  languageTextSelected: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#333',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#aaa',
  },
});