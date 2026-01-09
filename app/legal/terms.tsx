import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function TermsScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();

  const content = i18n.language === 'es' ? {
    title: 'Términos de Servicio',
    lastUpdated: 'Última actualización: Enero 2026',
    intro: 'Bienvenido a FoodSnap. Al usar nuestra aplicación, aceptas los siguientes Términos de Servicio. Por favor léelos cuidadosamente.',
    sections: [
      {
        title: '1. Aceptación de los Términos',
        content: 'Al acceder y usar FoodSnap, aceptas estar sujeto a estos Términos de Servicio y todas las leyes y regulaciones aplicables. Si no estás de acuerdo con estos términos, no uses la aplicación.'
      },
      {
        title: '2. Descripción del Servicio',
        content: 'FoodSnap es una aplicación móvil que proporciona:\n\n• Análisis nutricional de fotos de comida usando inteligencia artificial\n• Seguimiento del historial de nutrición\n• Sugerencias de recetas basadas en ingredientes\n• Cálculo de necesidades calóricas y de proteínas\n• Notificaciones de progreso nutricional\n\nLa aplicación está disponible en versión gratuita (limitada) y versión Premium (sin restricciones).'
      },
      {
        title: '3. Modelo Freemium',
        content: 'VERSIÓN GRATUITA:\n• 1 foto de comida por día\n• Análisis básico de nutrición\n• Sin historial completo\n• Anuncios mostrados\n• Sin sugerencias de recetas\n• Sin notificaciones\n\nVERSIÓN PREMIUM:\n• Fotos ilimitadas por día\n• Historial nutricional completo\n• Sugerencias de recetas\n• Notificaciones inteligentes\n• Sin anuncios\n• Todas las funciones desbloqueadas'
      },
      {
        title: '4. Precios y Suscripciones',
        content: 'PREMIUM - PRECIOS:\n• Mensual: $5.99 USD/mes\n• Anual: $49.99 USD/año (30% de ahorro)\n\nLas suscripciones se renuevan automáticamente a menos que se cancelen al menos 24 horas antes del final del período actual.\n\nLos pagos se procesan a través de la App Store de Apple o Google Play Store. Las políticas de reembolso están sujetas a los términos de cada plataforma.\n\nPuedes cancelar tu suscripción en cualquier momento a través de la configuración de tu cuenta de Apple o Google.'
      },
      {
        title: '5. Limitaciones de Responsabilidad',
        content: 'IMPORTANTE: FoodSnap proporciona ESTIMACIONES de información nutricional generadas por IA. Esta información es sólo para propósitos informativos y NO debe considerarse como consejo médico o nutricional profesional.\n\nNO GARANTIZAMOS:\n• La precisión absoluta de las estimaciones calóricas\n• La precisión de los valores de macronutrientes\n• La idoneidad de las sugerencias de recetas para condiciones de salud específicas\n\nConsulta siempre a un profesional de la salud calificado antes de hacer cambios significativos en tu dieta o estilo de vida.'
      },
      {
        title: '6. Uso Aceptable',
        content: 'Al usar FoodSnap, aceptas NO:\n\n• Usar la aplicación para propósitos ilegales\n• Intentar hackear o comprometer la seguridad de la aplicación\n• Abusar del servicio al cliente o soporte\n• Compartir contenido inapropiado u ofensivo\n• Intentar eludir las limitaciones de la versión gratuita\n• Usar la aplicación de maneras que puedan dañar a otros usuarios'
      },
      {
        title: '7. Propiedad Intelectual',
        content: 'Todo el contenido, diseño, código y marcas comerciales en FoodSnap son propiedad de FoodSnap Inc. o sus licenciantes.\n\nLas fotos que tomas permanecen siendo tuyas, pero nos otorgas una licencia para procesarlas y analizarlas para proporcionar el servicio.'
      },
      {
        title: '8. Terminación',
        content: 'Podemos suspender o terminar tu acceso a FoodSnap si:\n\n• Violas estos Términos de Servicio\n• Usas la aplicación de manera fraudulenta\n• No pagas las tarifas de suscripción (Premium)\n• Participas en actividades dañinas\n\nPuedes terminar tu cuenta en cualquier momento eliminando la aplicación y contactándonos para solicitar la eliminación de datos.'
      },
      {
        title: '9. Cambios a los Términos',
        content: 'Nos reservamos el derecho de modificar estos Términos en cualquier momento. Te notificaremos sobre cambios significativos. El uso continuo de la aplicación después de los cambios constituye tu aceptación de los nuevos términos.'
      },
      {
        title: '10. Ley Aplicable',
        content: 'Estos Términos se rigen por las leyes de [Tu Jurisdicción]. Cualquier disputa se resolverá en los tribunales de [Tu Jurisdicción].'
      },
      {
        title: '11. Contacto',
        content: 'Para preguntas sobre estos Términos de Servicio:\n\nEmail: legal@foodsnap.app\nSección de Ayuda y Soporte en la aplicación'
      }
    ]
  } : {
    title: 'Terms of Service',
    lastUpdated: 'Last Updated: January 2026',
    intro: 'Welcome to FoodSnap. By using our application, you agree to the following Terms of Service. Please read them carefully.',
    sections: [
      {
        title: '1. Acceptance of Terms',
        content: 'By accessing and using FoodSnap, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with these terms, do not use the application.'
      },
      {
        title: '2. Service Description',
        content: 'FoodSnap is a mobile application that provides:\n\n• Nutritional analysis of food photos using artificial intelligence\n• Nutrition history tracking\n• Recipe suggestions based on ingredients\n• Calorie and protein needs calculation\n• Nutrition progress notifications\n\nThe app is available in Free version (limited) and Premium version (unrestricted).'
      },
      {
        title: '3. Freemium Model',
        content: 'FREE VERSION:\n• 1 food photo per day\n• Basic nutrition analysis\n• No full history\n• Ads displayed\n• No recipe suggestions\n• No notifications\n\nPREMIUM VERSION:\n• Unlimited photos per day\n• Full nutrition history\n• Recipe suggestions\n• Smart notifications\n• No ads\n• All features unlocked'
      },
      {
        title: '4. Pricing and Subscriptions',
        content: 'PREMIUM - PRICING:\n• Monthly: $5.99 USD/month\n• Annual: $49.99 USD/year (30% savings)\n\nSubscriptions automatically renew unless canceled at least 24 hours before the end of the current period.\n\nPayments are processed through Apple App Store or Google Play Store. Refund policies are subject to each platform\'s terms.\n\nYou can cancel your subscription anytime through your Apple or Google account settings.'
      },
      {
        title: '5. Limitation of Liability',
        content: 'IMPORTANT: FoodSnap provides AI-generated ESTIMATES of nutritional information. This information is for informational purposes only and should NOT be considered as professional medical or nutritional advice.\n\nWE DO NOT GUARANTEE:\n• Absolute accuracy of calorie estimates\n• Accuracy of macronutrient values\n• Suitability of recipe suggestions for specific health conditions\n\nAlways consult a qualified healthcare professional before making significant changes to your diet or lifestyle.'
      },
      {
        title: '6. Acceptable Use',
        content: 'By using FoodSnap, you agree NOT to:\n\n• Use the app for illegal purposes\n• Attempt to hack or compromise app security\n• Abuse customer service or support\n• Share inappropriate or offensive content\n• Attempt to circumvent free version limitations\n• Use the app in ways that could harm other users'
      },
      {
        title: '7. Intellectual Property',
        content: 'All content, design, code, and trademarks in FoodSnap are owned by FoodSnap Inc. or its licensors.\n\nPhotos you take remain yours, but you grant us a license to process and analyze them to provide the service.'
      },
      {
        title: '8. Termination',
        content: 'We may suspend or terminate your access to FoodSnap if you:\n\n• Violate these Terms of Service\n• Use the app fraudulently\n• Fail to pay subscription fees (Premium)\n• Engage in harmful activities\n\nYou can terminate your account anytime by deleting the app and contacting us to request data deletion.'
      },
      {
        title: '9. Changes to Terms',
        content: 'We reserve the right to modify these Terms at any time. We will notify you of significant changes. Continued use of the app after changes constitutes your acceptance of the new terms.'
      },
      {
        title: '10. Governing Law',
        content: 'These Terms are governed by the laws of [Your Jurisdiction]. Any disputes will be resolved in the courts of [Your Jurisdiction].'
      },
      {
        title: '11. Contact',
        content: 'For questions about these Terms of Service:\n\nEmail: legal@foodsnap.app\nHelp & Support section in the app'
      }
    ]
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
        <Text style={styles.lastUpdated}>{content.lastUpdated}</Text>
        <Text style={styles.intro}>{content.intro}</Text>

        {content.sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}
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
  lastUpdated: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 20,
  },
  intro: {
    fontSize: 16,
    color: '#ddd',
    lineHeight: 24,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 24,
  },
});