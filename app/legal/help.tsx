import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function HelpScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();

  const content = i18n.language === 'es' ? {
    title: 'Ayuda y Soporte',
    intro: 'Encuentra respuestas a las preguntas más frecuentes sobre FoodSnap.',
    faqs: [
      {
        question: '¿Cómo funciona el análisis de comida?',
        answer: 'FoodSnap utiliza inteligencia artificial avanzada (GPT-4 Vision de OpenAI) para analizar fotos de tus comidas. La IA identifica los alimentos, estima las porciones y calcula los valores nutricionales aproximados.\n\nEl análisis generalmente toma 2-5 segundos. Los resultados incluyen calorías, proteínas, carbohidratos, grasas y advertencias de salud relevantes.'
      },
      {
        question: '¿Por qué las estimaciones pueden variar?',
        answer: 'Las estimaciones nutricionales son aproximaciones basadas en:\n\n• Reconocimiento visual de alimentos\n• Estimación de tamaño de porción\n• Bases de datos nutricionales\n• Métodos de cocción visibles\n\nLos valores pueden variar en ±10-20% según la calidad de la foto, ángulo y preparación real del alimento. Para mayor precisión, toma fotos claras con buena iluminación.'
      },
      {
        question: '¿Cómo cancelo mi suscripción Premium?',
        answer: 'Para iOS (Apple):\n1. Abre la app Ajustes en tu iPhone\n2. Toca tu nombre en la parte superior\n3. Toca "Suscripciones"\n4. Selecciona FoodSnap\n5. Toca "Cancelar suscripción"\n\nPara Android (Google Play):\n1. Abre la app Google Play Store\n2. Toca el icono de perfil\n3. Toca "Pagos y suscripciones" > "Suscripciones"\n4. Selecciona FoodSnap\n5. Toca "Cancelar suscripción"\n\nTu suscripción permanecerá activa hasta el final del período de facturación actual.'
      },
      {
        question: '¿Qué incluye la versión gratuita?',
        answer: 'La versión GRATUITA incluye:\n• 1 foto de comida por día\n• Análisis nutricional completo de esa comida\n• Estimaciones de calorías y macronutrientes\n• Advertencias de salud\n\nLas limitaciones son:\n• Sin historial de nutrición\n• Sin sugerencias de recetas\n• Sin notificaciones\n• Se muestran anuncios'
      },
      {
        question: '¿Qué obtengo con Premium?',
        answer: 'PREMIUM INCLUYE:\n• Fotos ilimitadas de comida por día\n• Historial completo de nutrición\n• Panel de control con totales diarios\n• Sugerencias de recetas basadas en ingredientes\n• Recetas completas paso a paso\n• Notificaciones nocturnas inteligentes\n• Cálculo de objetivos personalizados\n• Sin anuncios\n• Todas las funciones desbloqueadas\n\nPRECIOS:\n• Mensual: $5.99/mes\n• Anual: $49.99/año (ahorra 30%)'
      },
      {
        question: '¿Cómo funcionan las sugerencias de recetas?',
        answer: 'Las sugerencias de recetas (función Premium) funcionan de dos maneras:\n\n1. FOTO DE INGREDIENTES: Toma una foto de tu nevera/despensa y la IA identificará los ingredientes disponibles.\n\n2. SELECCIóN MANUAL: Elige ingredientes de una lista de elementos comunes.\n\nDespués, la IA sugiere 3 recetas que puedes preparar, cada una con:\n• Instrucciones paso a paso\n• Tiempo de cocción\n• Información nutricional\n• Opciones más saludables'
      },
      {
        question: '¿Son precisos los datos nutricionales?',
        answer: 'FoodSnap proporciona ESTIMACIONES generadas por IA. Si bien nos esforzamos por la precisión, los valores son aproximados y no deben usarse para:\n\n• Diagnóstico médico\n• Planificación de dieta médica estricta\n• Gestión de condiciones de salud graves\n\nPara necesidades nutricionales precisas, consulta a un dietista o nutricionista registrado. FoodSnap es mejor para seguimiento general y conciencia nutricional.'
      },
      {
        question: '¿Mis fotos son privadas?',
        answer: 'SÍ. Tus fotos de comida son privadas y seguras:\n\n• Almacenadas de forma segura en servidores cifrados\n• NO compartidas públicamente\n• NO utilizadas para entrenar modelos de IA de terceros sin consentimiento\n• Procesadas solo para tu análisis nutricional personal\n\nPuedes eliminar tu cuenta y todos los datos asociados en cualquier momento contactando al soporte.'
      },
      {
        question: '¿La app funciona sin conexión?',
        answer: 'FoodSnap requiere conexión a internet para:\n• Analizar fotos de comida (requiere IA)\n• Generar sugerencias de recetas\n• Sincronizar datos\n\nPuedes ver datos previamente cargados sin conexión, pero las funciones de análisis requieren conexión.'
      },
      {
        question: '¿Cómo contacto al soporte?',
        answer: 'Puedes contactarnos de varias maneras:\n\nEmail: support@foodsnap.app\n\nRedes Sociales:\n• Twitter/X: @FoodSnapApp\n• Instagram: @foodsnap_official\n\nGeneralmente respondemos dentro de 24-48 horas en días laborables.'
      }
    ],
    contactSection: {
      title: '¿Aún necesitas ayuda?',
      description: 'Si tu pregunta no está respondida arriba, contáctanos directamente:',
      email: 'support@foodsnap.app',
      responseTime: 'Tiempo de respuesta típico: 24-48 horas'
    }
  } : {
    title: 'Help & Support',
    intro: 'Find answers to the most frequently asked questions about FoodSnap.',
    faqs: [
      {
        question: 'How does food analysis work?',
        answer: 'FoodSnap uses advanced artificial intelligence (OpenAI\'s GPT-4 Vision) to analyze photos of your meals. The AI identifies foods, estimates portions, and calculates approximate nutritional values.\n\nAnalysis typically takes 2-5 seconds. Results include calories, protein, carbohydrates, fats, and relevant health warnings.'
      },
      {
        question: 'Why might estimates vary?',
        answer: 'Nutritional estimates are approximations based on:\n\n• Visual food recognition\n• Portion size estimation\n• Nutritional databases\n• Visible cooking methods\n\nValues may vary by ±10-20% depending on photo quality, angle, and actual food preparation. For better accuracy, take clear photos with good lighting.'
      },
      {
        question: 'How do I cancel my Premium subscription?',
        answer: 'For iOS (Apple):\n1. Open Settings app on your iPhone\n2. Tap your name at the top\n3. Tap "Subscriptions"\n4. Select FoodSnap\n5. Tap "Cancel Subscription"\n\nFor Android (Google Play):\n1. Open Google Play Store app\n2. Tap profile icon\n3. Tap "Payments & subscriptions" > "Subscriptions"\n4. Select FoodSnap\n5. Tap "Cancel subscription"\n\nYour subscription will remain active until the end of the current billing period.'
      },
      {
        question: 'What does the free version include?',
        answer: 'The FREE version includes:\n• 1 food photo per day\n• Full nutritional analysis of that meal\n• Calorie and macronutrient estimates\n• Health warnings\n\nLimitations are:\n• No nutrition history\n• No recipe suggestions\n• No notifications\n• Ads displayed'
      },
      {
        question: 'What do I get with Premium?',
        answer: 'PREMIUM INCLUDES:\n• Unlimited food photos per day\n• Full nutrition history\n• Dashboard with daily totals\n• Ingredient-based recipe suggestions\n• Complete step-by-step recipes\n• Smart evening notifications\n• Personalized goal calculations\n• No ads\n• All features unlocked\n\nPRICING:\n• Monthly: $5.99/month\n• Annual: $49.99/year (save 30%)'
      },
      {
        question: 'How do recipe suggestions work?',
        answer: 'Recipe suggestions (Premium feature) work two ways:\n\n1. INGREDIENT PHOTO: Take a photo of your fridge/pantry and AI will identify available ingredients.\n\n2. MANUAL SELECTION: Choose ingredients from a list of common items.\n\nThen, AI suggests 3 recipes you can make, each with:\n• Step-by-step instructions\n• Cooking time\n• Nutritional information\n• Healthier options'
      },
      {
        question: 'Is the nutrition data accurate?',
        answer: 'FoodSnap provides AI-generated ESTIMATES. While we strive for accuracy, values are approximate and should not be used for:\n\n• Medical diagnosis\n• Strict medical diet planning\n• Managing serious health conditions\n\nFor precise nutritional needs, consult a registered dietitian or nutritionist. FoodSnap is best for general tracking and nutritional awareness.'
      },
      {
        question: 'Are my photos private?',
        answer: 'YES. Your food photos are private and secure:\n\n• Stored securely on encrypted servers\n• NOT shared publicly\n• NOT used to train third-party AI models without consent\n• Processed only for your personal nutrition analysis\n\nYou can delete your account and all associated data anytime by contacting support.'
      },
      {
        question: 'Does the app work offline?',
        answer: 'FoodSnap requires internet connection for:\n• Analyzing food photos (requires AI)\n• Generating recipe suggestions\n• Syncing data\n\nYou can view previously loaded data offline, but analysis features require connection.'
      },
      {
        question: 'How do I contact support?',
        answer: 'You can reach us in several ways:\n\nEmail: support@foodsnap.app\n\nSocial Media:\n• Twitter/X: @FoodSnapApp\n• Instagram: @foodsnap_official\n\nWe typically respond within 24-48 hours on business days.'
      }
    ],
    contactSection: {
      title: 'Still need help?',
      description: 'If your question isn\'t answered above, contact us directly:',
      email: 'support@foodsnap.app',
      responseTime: 'Typical response time: 24-48 hours'
    }
  };

  const handleEmailContact = () => {
    Linking.openURL(`mailto:${content.contactSection.email}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{content.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.intro}>{content.intro}</Text>

        {content.faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <View style={styles.questionContainer}>
              <Ionicons name="help-circle" size={24} color="#FF6B6B" />
              <Text style={styles.question}>{faq.question}</Text>
            </View>
            <Text style={styles.answer}>{faq.answer}</Text>
          </View>
        ))}

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>{content.contactSection.title}</Text>
          <Text style={styles.contactDescription}>{content.contactSection.description}</Text>
          
          <TouchableOpacity style={styles.emailButton} onPress={handleEmailContact}>
            <Ionicons name="mail" size={20} color="#fff" />
            <Text style={styles.emailButtonText}>{content.contactSection.email}</Text>
          </TouchableOpacity>
          
          <Text style={styles.responseTime}>{content.contactSection.responseTime}</Text>
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
  intro: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 24,
  },
  faqItem: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  answer: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 22,
  },
  contactCard: {
    backgroundColor: '#FF6B6B20',
    padding: 24,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  contactDescription: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  emailButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  responseTime: {
    fontSize: 12,
    color: '#aaa',
  },
});