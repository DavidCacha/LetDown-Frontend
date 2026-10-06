import React, { useState } from 'react';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import TopBar from '../../components/TopBar';
import Chip from '../../components/Chip';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/api';

const sanctuaryLogo = require('../../assets/images/letdown_logo.png');

export default function LoginScreen({ navigation }: any) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  const isEmailValid = emailRegex.test(email.trim());
  const isPasswordValid = passwordRegex.test(password);

  const emailError = emailTouched && !isEmailValid;
  const passwordError = passwordTouched && !isPasswordValid;

  const validateCredentials = isEmailValid && isPasswordValid && remember;

  const handleLogin = async () => {
    if (!validateCredentials) {
      setEmailTouched(true);
      setPasswordTouched(true);
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      setEmail('');
      setPassword('');
      setRemember(false);
      setEmailTouched(false);
      setPasswordTouched(false);

      navigation.navigate('App');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'No se pudo iniciar sesión.';
      Alert.alert('Error al iniciar sesión', message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.body}>
        <View style={styles.brand}>
          <View style={styles.logoWrapper}>
            <Image source={sanctuaryLogo} style={styles.logo} resizeMode="contain" />
          </View>
          <Chip icon="shield" label="Espacio protegido y cifrado" tone="green" />
          <Text style={styles.title}>Bienvenido de vuelta</Text>
          <Text style={styles.subtitle}>Tómate tu tiempo. Estamos aquí contigo.</Text>
        </View>

        <TouchableOpacity style={styles.crisisBanner}>
          <View style={styles.crisisBannerLeft}>
            <View style={styles.crisisIcon}>
              <Icon name="heart" size={15} color={colors.dangerText} />
            </View>
            <View>
              <Text style={styles.crisisTitle}>¿En crisis ahora mismo?</Text>
              <Text style={styles.crisisSubtitle}>Habla con un especialista sin iniciar sesión</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={18} color={colors.dangerSoftText} />
        </TouchableOpacity>

        <View style={styles.card}>
          <TextField
            label="Correo electrónico"
            placeholder="tu.refugio@ejemplo.com"
            icon="mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            onBlur={() => setEmailTouched(true)}
            error={emailError}
            errorMessage={
              emailError
                ? 'Ingresa un correo electrónico válido'
                : undefined
            }
            topRight={<Chip icon="lock" label="Privado" tone="green" />}
          />

          <View style={styles.passwordLabelRow}>
            <Text style={styles.label}>Contraseña</Text>
            <TouchableOpacity onPress={() => navigation?.navigate?.('ForgotPassword')}>
              <Text style={styles.forgotLink}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>
          <TextField
            label=""
            placeholder="Introduce tu clave segura"
            secure
            value={password}
            onChangeText={setPassword}
            onBlur={() => setPasswordTouched(true)}
            error={passwordError}
            errorMessage={
              passwordError
                ? 'La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo'
                : undefined
            }
            style={styles.noLabelSpacing}
          />

          <TouchableOpacity style={styles.rememberRow} onPress={() => setRemember((v) => !v)}>
            <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
              {remember ? <Icon name="check" size={14} color={colors.surface} /> : null}
            </View>
            <Text style={styles.rememberText}>Recordar este dispositivo seguro</Text>
          </TouchableOpacity>

          <PrimaryButton
            label="Entrar a mi espacio"
            icon="log-in"
            style={styles.submitButton}
            variant={validateCredentials ? 'primary' : 'neutral'}
            loading={loading}
            onPress={handleLogin}
          />
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O ingresa rápido y seguro</Text>
            <View style={styles.dividerLine} />
          </View>

          <PrimaryButton label="Huella dactilar / Face ID" icon="fingerprint" variant="neutral" />
        </View>

        <View style={styles.pillarsRow}>
          <View style={styles.pillar}>
            <Icon name="eye-off" size={18} color={colors.textSecondary} />
            <View>
              <Text style={styles.pillarTitle}>100% Confidencial</Text>
              <Text style={styles.pillarSubtitle}>Sin rastreo invasivo</Text>
            </View>
          </View>
          <View style={styles.pillar}>
            <Icon name="heart" size={18} color={colors.textSecondary} />
            <View>
              <Text style={styles.pillarTitle}>Cero Juicios</Text>
              <Text style={styles.pillarSubtitle}>A tu propio compás</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>¿Aún no tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => navigation?.navigate?.('Register')}>
              <Text style={styles.footerLink}>Regístrate aquí</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footerRow}>
            <Icon name="shield" size={12} color={colors.textSecondary50 as string} />
            <Text style={styles.footerSmall}> Tu bienestar emocional es nuestra única prioridad</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  body: { paddingHorizontal: spacing.md },
  quickExitRow: { alignItems: 'flex-end', marginBottom: spacing.sm },
  brand: { alignItems: 'center', marginBottom: spacing.lg, gap: spacing.xs },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(232,221,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    paddingVertical: 60
  },
  logo: { width: 170, height: 170,  },
  title: { ...typography.h1, color: colors.textPrimary, marginTop: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  crisisBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFD9DD',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  crisisBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  crisisIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crisisTitle: { ...typography.label, color: colors.dangerSoftText },
  crisisSubtitle: { ...typography.small, color: '#623C42' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#7868A6',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  label: { ...typography.label, color: colors.textPrimary },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  forgotLink: { ...typography.caption, color: colors.primaryDark },
  noLabelSpacing: {},
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: colors.textGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.textGreen },
  rememberText: { ...typography.caption, color: colors.textSecondary },
  submitButton: { marginBottom: spacing.md },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.disabled },
  dividerText: { ...typography.caption, color: colors.textSecondary },
  pillarsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  pillar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  pillarTitle: { ...typography.caption, color: colors.textPrimary },
  pillarSubtitle: { ...typography.small, color: colors.textSecondary },
  footer: { alignItems: 'center', gap: spacing.sm },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  footerText: { ...typography.small, color: colors.textSecondary },
  footerLink: { ...typography.label, color: colors.primaryDark },
  footerSmall: { ...typography.caption, color: colors.textSecondary50 },
});
