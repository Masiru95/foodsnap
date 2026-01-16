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

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const content = i18n.language === 'es' ? {
    title: 'Política de Privacidad',
    lastUpdated: 'Última actualización: Enero 2026',
    intro: 'En Snapfood, respetamos tu privacidad y nos comprometemos a proteger tus datos personales. Esta Política de Privacidad explica qué información recopilamos, cómo la usamos y tus derechos.',
    sections: [
      {
        title: '1. Información que Recopilamos',
        content: 'Recopilamos la siguiente información cuando usas Snapfood:\n\n• Fotos de Comida: Las imágenes que tomas de tus comidas se almacenan de forma segura en nuestros servidores para proporcionar el análisis nutricional. Puedes optar por no guardar las fotos en la galería de tu dispositivo.\n\n• Datos Nutricionales: Guardamos las estimaciones de calorías, proteínas, carbohidratos y grasas de tus comidas para proporcionarte un historial de nutrición.\n\n• Información de Perfil: Tu edad, altura, peso, nivel de actividad y objetivos de salud se almacenan para personalizar tus recomendaciones diarias.\n\n• Datos de Uso: Información sobre cómo usas la aplicación, incluidas las funciones que utilizas y el tiempo dedicado.'
      },
      {
        title: '2. Cómo Usamos Tu Información',
        content: 'Utilizamos tus datos para:\n\n• Proporcionar análisis nutricional de tus comidas usando inteligencia artificial.\n\n• Crear un historial de nutrición personalizado (función Premium).\n\n• Generar sugerencias de recetas basadas en tus ingredientes disponibles (función Premium).\n\n• Calcular tus necesidades calóricas y de proteínas diarias.\n\n• Enviar notificaciones sobre tu progreso nutricional (función Premium).\n\n• Mejorar nuestros servicios y algoritmos de IA.'
      },
      {
        title: '3. Servicios de Terceros',
        content: 'Snapfood utiliza los siguientes servicios de terceros:\n\n• OpenAI (GPT-4 Vision): Para analizar fotos de comida y generar estimaciones nutricionales. Las imágenes se envían de forma segura a la API de OpenAI.\n\n• Bases de Datos Nutricionales Públicas: Utilizamos USDA FoodData Central y Open Food Facts para mejorar la precisión de los datos nutricionales.\n\n• Google AdMob: Para mostrar anuncios en la versión gratuita. AdMob puede recopilar identificadores de dispositivos y datos de uso para publicidad personalizada.\n\nEstos servicios tienen sus propias políticas de privacidad que debes revisar.'
      },
      {
        title: '4. Almacenamiento de Datos',
        content: 'Tus fotos y datos nutricionales se almacenan de forma segura en nuestros servidores en la nube. Implementamos medidas de seguridad estándar de la industria para proteger tus datos contra acceso no autorizado.\n\nTus fotos NO se comparten públicamente ni se utilizan para entrenar modelos de IA de terceros sin tu consentimiento explícito.'
      },
      {
        title: '5. Tus Derechos',
        content: 'Tienes derecho a:\n\n• Acceder a tus datos personales.\n• Solicitar la eliminación de tu cuenta y todos los datos asociados.\n• Desactivar el guardado de fotos en tu dispositivo.\n• Optar por no recibir notificaciones push.\n• Exportar tu historial de nutrición.\n\nPara ejercer estos derechos, contáctanos a través de la sección de Ayuda y Soporte.'
      },
      {
        title: '6. Privacidad de Menores',
        content: 'Snapfood no está diseñado para menores de 13 años. No recopilamos intencionalmente información personal de niños menores de 13 años.'
      },
      {
        title: '7. Cambios a esta Política',
        content: 'Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre cambios significativos a través de la aplicación o por correo electrónico.'
      },
      {
        title: '8. Contacto',
        content: 'Si tienes preguntas sobre esta Política de Privacidad, contáctanos a través de:\n\nEmail: privacy@foodsnap.app\nSección de Ayuda y Soporte en la aplicación'
      }
    ]
  } : {
    title: 'Privacy Policy',
    lastUpdated: 'Last Updated: January 2026',
    intro: 'At Snapfood, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains what information we collect, how we use it, and your rights.',
    sections: [
      {
        title: '1. Information We Collect',
        content: 'We collect the following information when you use Snapfood:\n\n• Food Photos: Images you take of your meals are stored securely on our servers to provide nutrition analysis. You can opt out of saving photos to your device gallery.\n\n• Nutrition Data: We save calorie, protein, carbohydrate, and fat estimates from your meals to provide you with a nutrition history.\n\n• Profile Information: Your age, height, weight, activity level, and health goals are stored to personalize your daily recommendations.\n\n• Usage Data: Information about how you use the app, including features you access and time spent.'
      },
      {
        title: '2. How We Use Your Information',
        content: 'We use your data to:\n\n• Provide nutritional analysis of your meals using artificial intelligence.\n\n• Create a personalized nutrition history (Premium feature).\n\n• Generate recipe suggestions based on your available ingredients (Premium feature).\n\n• Calculate your daily calorie and protein needs.\n\n• Send notifications about your nutrition progress (Premium feature).\n\n• Improve our services and AI algorithms.'
      },
      {
        title: '3. Third-Party Services',
        content: 'Snapfood uses the following third-party services:\n\n• OpenAI (GPT-4 Vision): To analyze food photos and generate nutrition estimates. Images are sent securely to OpenAI\'s API.\n\n• Public Nutrition Databases: We use USDA FoodData Central and Open Food Facts to improve nutrition data accuracy.\n\n• Google AdMob: To display ads in the free version. AdMob may collect device identifiers and usage data for personalized advertising.\n\nThese services have their own privacy policies that you should review.'
      },
      {
        title: '4. Data Storage',
        content: 'Your photos and nutrition data are stored securely on our cloud servers. We implement industry-standard security measures to protect your data from unauthorized access.\n\nYour photos are NOT shared publicly or used to train third-party AI models without your explicit consent.'
      },
      {
        title: '5. Your Rights',
        content: 'You have the right to:\n\n• Access your personal data.\n• Request deletion of your account and all associated data.\n• Disable photo saving to your device.\n• Opt out of push notifications.\n• Export your nutrition history.\n\nTo exercise these rights, contact us through the Help & Support section.'
      },
      {
        title: '6. Children\'s Privacy',
        content: 'Snapfood is not designed for children under 13. We do not knowingly collect personal information from children under 13.'
      },
      {
        title: '7. Changes to This Policy',
        content: 'We may update this Privacy Policy occasionally. We will notify you of significant changes through the app or via email.'
      },
      {
        title: '8. Contact',
        content: 'If you have questions about this Privacy Policy, contact us at:\n\nEmail: privacy@foodsnap.app\nHelp & Support section in the app'
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