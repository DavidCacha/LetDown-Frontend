import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import TopBar from '../../components/TopBar';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';
import Chip from '../../components/Chip';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { authService } from '../../services/auth';
import { ApiError } from '../../services/api';

const sanctuaryLogo = require('../../assets/images/letdown_logo.png');
const OTP_LENGTH = 6;
const CODE_TTL_SECONDS = 15 * 60;

function maskEmail(email: string) {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  const visible = user.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(user.length - 2, 1))}@${domain}`;
}

function formatMMSS(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ResetPasswordScreen({ navigation, route }: any) {
  const email: string = route?.params?.email ?? '';

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputs = useRef<Array<TextInput | null>>([]);
  const code = digits.join('');

  const [secondsLeft, setSecondsLeft] = useState(CODE_TTL_SECONDS);
  const [resending, setResending] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleDigitChange = (value: string, index: number) => {
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const checks = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    numberOrSymbol: /[0-9^$*.[\]{}()?"!@#%&/,><':;|_~`+=\\-]/.test(newPassword),
    match: newPassword.length > 0 && newPassword === confirmPassword,
  };
  const passedCount = Object.values(checks).filter(Boolean).length;
  const strengthLabel =
    passedCount <= 1 ? 'Débil' : passedCount === 2 ? 'Regular' : passedCount === 3 ? 'Buena' : 'Fuerte y serena';

  const canSubmit = code.length === OTP_LENGTH && checks.length && checks.upper && checks.numberOrSymbol && checks.match;

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.forgotPassword(email);
      setSecondsLeft(CODE_TTL_SECONDS);
      Alert.alert('Código reenviado', 'Revisa tu correo nuevamente.');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'No se pudo reenviar el código.';
      Alert.alert('Error', message);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async () => {
    setTouched(true);
    if (!canSubmit) {
      if (code.length !== OTP_LENGTH) {
        Alert.alert('Código incompleto', 'Ingresa los 6 dígitos que recibiste.');
      }
      return;
    }

    setSubmitting(true);
    try {
      await authService.confirmForgotPassword(email, code, newPassword);
      Alert.alert('Contraseña actualizada', 'Ya puedes iniciar sesión con tu nueva clave.', [
        { text: 'OK', onPress: () => navigation?.navigate?.('Login') },
      ]);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'No se pudo restablecer la contraseña.';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TopBar onBack={() => navigation?.goBack?.()} rightChip="Línea de crisis 24/7 disponible" />

      <View style={styles.body}>
        <View style={styles.stepRow}>
          <View style={styles.stepChip}>
            <View style={styles.stepDot} />
            <Text style={styles.stepChipText}>Paso 2 de 2 · Restablecer clave</Text>
          </View>
          <Chip icon="shield" label="Espacio seguro" tone="lavender" />
        </View>

        <View style={styles.brand}>
          <View style={styles.logoWrapper}>
            <Image source={sanctuaryLogo} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.title}>Crea tu nueva clave</Text>
          <Text style={styles.subtitle}>
            Ingresa el código temporal de 6 dígitos que enviamos a tu correo y define una contraseña que te resulte
            fácil y segura.
          </Text>
        </View>

        <View style={styles.sentToRow}>
          <View style={styles.sentToLeft}>
            <View style={styles.sentToIcon}>
              <Icon name="mail" size={16} color={colors.textGreen} />
            </View>
            <View>
              <Text style={styles.sentToLabel}>Código enviado a</Text>
              <Text style={styles.sentToEmail}>{maskEmail(email)}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.changeButton} onPress={() => navigation?.goBack?.()}>
            <Text style={styles.changeButtonText}>Cambiar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.otpHeader}>
            <Text style={styles.otpTitle}>Código de 6 dígitos</Text>
            <View style={styles.expiryRow}>
              <Icon name="clock" size={12} color={colors.textSecondary} />
              <Text style={styles.expiryText}>
                {secondsLeft > 0 ? `Expira en ${formatMMSS(secondsLeft)}` : 'Código expirado'}
              </Text>
            </View>
          </View>

          <View style={styles.otpRow}>
            {digits.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(v) => handleDigitChange(v, index)}
              />
            ))}
          </View>

          <View style={styles.resendRow}>
            <Text style={styles.resendHint}>¿No recibiste el correo?</Text>
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              <View style={styles.resendLinkRow}>
                <Icon name="refresh-cw" size={12} color={colors.primaryDark} />
                <Text style={styles.resendLink}>{resending ? 'Reenviando...' : 'Reenviar código'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <TextField
            label="Nueva contraseña"
            placeholder="Mínimo 8 caracteres conscientes"
            secure
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextField
            label="Confirmar nueva contraseña"
            placeholder="Repite tu contraseña"
            secure
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={touched && confirmPassword.length > 0 && !checks.match}
            errorMessage="Las contraseñas no coinciden"
          />

          <View style={styles.strengthHeader}>
            <Text style={styles.strengthLabel}>Nivel de protección:</Text>
            <View style={styles.strengthValueRow}>
              <View style={styles.strengthDot} />
              <Text style={styles.strengthValue}>{strengthLabel}</Text>
            </View>
          </View>
          <View style={styles.strengthBarsRow}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[styles.strengthBar, i < passedCount && styles.strengthBarFilled]}
              />
            ))}
          </View>

          <View style={styles.checklist}>
            {[
              { key: 'length', label: 'Mínimo 8 caracteres' },
              { key: 'upper', label: '1 letra mayúscula' },
              { key: 'numberOrSymbol', label: '1 número o símbolo' },
              { key: 'match', label: 'Claves coinciden' },
            ].map((item) => {
              const passed = (checks as any)[item.key];
              return (
                <View key={item.key} style={[styles.checkItem, passed && styles.checkItemActive]}>
                  <Icon
                    name={passed ? 'check-circle' : 'circle'}
                    size={15}
                    color={passed ? colors.textGreen : (colors.textSecondary50 as string)}
                  />
                  <Text style={[styles.checkText, passed && styles.checkTextActive]}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <PrimaryButton
          label="Restablecer y acceder a mi cuenta"
          icon="unlock"
          style={styles.submitButton}
          loading={submitting}
          onPress={handleSubmit}
        />

        <View style={styles.badgesRow}>
          <View style={styles.badge}>
            <Icon name="shield" size={12} color={colors.textSecondary} />
            <Text style={styles.badgeText}>100% Cifrado seguro</Text>
          </View>
          <View style={styles.badge}>
            <Icon name="lock" size={12} color={colors.textSecondary} />
            <Text style={styles.badgeText}>Tus datos siempre a salvo</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Necesitas ayuda adicional? </Text>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Contactar a soporte o de guardia →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  body: { paddingHorizontal: spacing.md },
  stepRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  stepChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primaryDark },
  stepChipText: { ...typography.caption, color: colors.textSecondary },
  brand: { alignItems: 'center', marginBottom: spacing.lg, gap: spacing.xs },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  logo: { width: 48, height: 48 },
  title: { ...typography.h1, color: colors.textPrimary, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
  sentToRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  sentToLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  sentToIcon: { width: 36, height: 36, borderRadius: radii.pill, backgroundColor: colors.surfaceGreen, alignItems: 'center', justifyContent: 'center' },
  sentToLabel: { ...typography.caption, color: colors.textSecondary },
  sentToEmail: { ...typography.label, color: colors.textPrimary },
  changeButton: { backgroundColor: colors.surfaceLavender, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: 6 },
  changeButtonText: { ...typography.caption, color: colors.primaryDark, fontWeight: '600' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    shadowColor: '#7868A6',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  otpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  otpTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  expiryRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  expiryText: { ...typography.caption, color: colors.textSecondary },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xs, marginBottom: spacing.lg },
  otpInput: {
    flex: 1,
    height: 52,
    borderRadius: 8,
    backgroundColor: colors.inputBg,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  resendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resendHint: { ...typography.small, color: colors.textSecondary },
  resendLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  resendLink: { ...typography.label, color: colors.primaryDark },
  strengthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  strengthLabel: { ...typography.small, color: colors.textSecondary },
  strengthValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  strengthDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textGreen },
  strengthValue: { ...typography.label, color: colors.textGreen },
  strengthBarsRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.lg },
  strengthBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.disabled },
  strengthBarFilled: { backgroundColor: colors.textGreen },
  checklist: { gap: spacing.xs },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: spacing.sm },
  checkItemActive: { backgroundColor: colors.surfaceGreenSoft },
  checkText: { ...typography.small, color: colors.textSecondary },
  checkTextActive: { color: colors.textGreen, fontWeight: '600' },
  submitButton: { marginBottom: spacing.lg },
  badgesRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceMuted, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: 6 },
  badgeText: { ...typography.caption, color: colors.textSecondary },
  footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  footerText: { ...typography.small, color: colors.textSecondary },
  footerLink: { ...typography.small, color: colors.primaryDark, fontWeight: '600' },
});
