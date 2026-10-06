import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TopBar from '../../components/TopBar';
import Chip from '../../components/Chip';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';
import CrisisPanel from '../../components/CrisisPanel';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/api';

const sanctuaryLogo = require('../../assets/images/letdown_logo.png');

export default function RegisterScreen({ navigation }: any) {
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      Alert.alert('Faltan datos', 'Ingresa tu correo y una contraseña.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Contraseña muy corta', 'Debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Las contraseñas no coinciden', 'Revisa ambos campos.');
      return;
    }
    if (!accepted) {
      Alert.alert('Falta tu consentimiento', 'Acepta el aviso de privacidad para continuar.');
      return;
    }

    setLoading(true);
    try {
      await signUp(trimmedEmail, password);
      navigation?.navigate?.('OtpVerification', { email: trimmedEmail });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'No se pudo crear la cuenta.';
      Alert.alert('Error al registrar', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TopBar onBack={() => navigation?.goBack?.()} rightChip="Línea de crisis 24/7 disponible" />

      <View style={styles.body}>
        <View style={styles.statusRow}>
          <Chip style={styles.statusRow_shield} icon="shield" label={'Cifrado de grado médico • 100% Anónimo'} tone="green" />
        </View>

        <View style={styles.brand}>
          <View style={styles.logoWrapper}>
            <Image source={sanctuaryLogo} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.title}>Crea tu Santuario</Text>
          <Text style={styles.subtitle}>
            Tu espacio seguro para sanar, respirar y encontrar calma sin juicios.
          </Text>
        </View>

        <View style={styles.card}>
          <TextField
            label="¿Cómo te gustaría que te llamemos?"
            helperText="Puedes usar tu nombre o un seudónimo protector"
            placeholder="Ej. Mar, Luz o tu nombre real"
            icon="feather"
            value={name}
            onChangeText={setName}
          />
          <TextField
            label="Correo electrónico"
            placeholder="tu_refugio@ejemplo.com"
            icon="mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label="Contraseña personal"
            placeholder="Mínimo 8 caracteres conscientes"
            secure
            value={password}
            onChangeText={setPassword}
          />
          <Text style={styles.strengthHint}>Combina letras y números para mayor calma</Text>
          <TextField
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            secure
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity style={styles.consentRow} onPress={() => setAccepted((v) => !v)}>
            <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
              {accepted ? <Icon name="check" size={14} color={colors.surface} /> : null}
            </View>
            <Text style={styles.consentText}>
              Acepto el tratamiento seguro y ético de mis datos conforme al{' '}
              <Text style={styles.consentLink}>aviso de privacidad</Text> y los estándares de{' '}
              <Text style={styles.consentLink}>confidencialidad de salud emocional</Text> (RB-034).
            </Text>
          </TouchableOpacity>

          <PrimaryButton
            label="Crear mi cuenta segura"
            icon="shield"
            style={styles.submitButton}
            loading={loading}
            onPress={handleRegister}
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => navigation?.navigate?.('Login')}>
              <Text style={styles.loginLink}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.pillarsRow}>
          <View style={styles.pillar}>
            <View style={[styles.pillarIcon, { backgroundColor: colors.surfaceGreen }]}>
              <Icon name="lock" size={16} color={colors.textGreen} />
            </View>
            <View>
              <Text style={styles.pillarTitle}>Cero venta</Text>
              <Text style={styles.pillarSubtitle}>Tus notas son tuyas</Text>
            </View>
          </View>
          <View style={styles.pillar}>
            <View style={[styles.pillarIcon, { backgroundColor: colors.surfacePurpleSoft }]}>
              <Icon name="heart" size={16} color={colors.primaryDark} />
            </View>
            <View>
              <Text style={styles.pillarTitle}>Sin juicios</Text>
              <Text style={styles.pillarSubtitle}>A tu propio ritmo</Text>
            </View>
          </View>
        </View>

        <CrisisPanel />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  body: {
    paddingHorizontal: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statusRow_shield: {
    width: 240,
  },
  statusRow_logout: {
    width: 80
  },
  brand: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    paddingVertical: 60
  },
  logo: {
    width: 170,
    height: 170,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: 280,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    shadowColor: '#7868A6',
    shadowOpacity: 0.09,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  strengthHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: colors.surfaceLavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  consentText: {
    ...typography.small,
    color: colors.textSecondary,
    flex: 1,
  },
  consentLink: {
    fontWeight: '600',
    color: colors.primaryDark,
  },
  submitButton: {
    marginBottom: spacing.lg,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  loginLink: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  pillarsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  pillar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  pillarIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarTitle: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  pillarSubtitle: {
    ...typography.small,
    color: colors.textSecondary,
  },
});
