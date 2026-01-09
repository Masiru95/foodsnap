import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LUNCH_REMINDER_KEY = 'lunch_reminder_enabled';
const DINNER_REMINDER_KEY = 'dinner_reminder_enabled';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('meal-reminders', {
      name: 'Meal Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B6B',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export async function scheduleLunchReminder(enabled: boolean, language: string = 'en'): Promise<void> {
  // Cancel existing lunch reminders
  const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of allNotifications) {
    if (notification.identifier.startsWith('lunch-')) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }

  if (!enabled) {
    await AsyncStorage.setItem(LUNCH_REMINDER_KEY, 'false');
    return;
  }

  await AsyncStorage.setItem(LUNCH_REMINDER_KEY, 'true');

  const title = language === 'es' ? '🍽️ ¡Hora de planear tu almuerzo!' : '🍽️ Time to plan your lunch!';
  const body = language === 'es' 
    ? '¿Qué vas a comer hoy? Abre FoodSnap para ver sugerencias saludables.'
    : "What are you having today? Open FoodSnap for healthy suggestions.";

  // Schedule for 10:00 AM every day (2 hours before typical lunch)
  await Notifications.scheduleNotificationAsync({
    identifier: 'lunch-reminder',
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 10,
      minute: 0,
    },
  });
}

export async function scheduleDinnerReminder(enabled: boolean, language: string = 'en'): Promise<void> {
  // Cancel existing dinner reminders
  const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of allNotifications) {
    if (notification.identifier.startsWith('dinner-')) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }

  if (!enabled) {
    await AsyncStorage.setItem(DINNER_REMINDER_KEY, 'false');
    return;
  }

  await AsyncStorage.setItem(DINNER_REMINDER_KEY, 'true');

  const title = language === 'es' ? '🌙 ¡Hora de planear tu cena!' : '🌙 Time to plan your dinner!';
  const body = language === 'es' 
    ? '¿Ya sabes qué cenar? Revisa tu día y elige algo nutritivo.'
    : "Know what's for dinner? Check your day and pick something nutritious.";

  // Schedule for 6:00 PM every day (2 hours before typical dinner)
  await Notifications.scheduleNotificationAsync({
    identifier: 'dinner-reminder',
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 18,
      minute: 0,
    },
  });
}

export async function getLunchReminderStatus(): Promise<boolean> {
  const status = await AsyncStorage.getItem(LUNCH_REMINDER_KEY);
  return status === 'true';
}

export async function getDinnerReminderStatus(): Promise<boolean> {
  const status = await AsyncStorage.getItem(DINNER_REMINDER_KEY);
  return status === 'true';
}

export async function sendTestNotification(language: string = 'en'): Promise<void> {
  const title = language === 'es' ? '🎉 ¡Notificaciones activadas!' : '🎉 Notifications enabled!';
  const body = language === 'es' 
    ? 'Recibirás recordatorios para el almuerzo y la cena.'
    : "You'll receive reminders for lunch and dinner.";

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: null, // Send immediately
  });
}
