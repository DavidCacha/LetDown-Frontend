import React, { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import TopBar from '../../components/TopBar';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/api';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 44;

export default function OtpVerificationScreen({ navigation, route }: any) {
  const { confirmAccount, resendCode } = useAuth();
  const email: string = route?.params?.email ?? '';

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputs = useRef<Array<TextInput | null>>([]);
  const [confirming, setConfirming] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const code = digits.join('');

  const handleConfirm = async () => {
    if (code.length !== OTP_LENGTH) {
      Alert.alert('Código incompleto', 'Ingresa los 6 dígitos que recibiste por correo.');
      return;
    }
    setConfirming(true);
    try {
      await confirmAccount(email, code);
      Alert.alert('Cuenta confirmada', 'Ya puedes iniciar sesión.', [
        { text: 'OK', onPress: () => navigation?.navigate?.('Login') },
      ]);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'No se pudo confirmar el código.';
      Alert.alert('Error', message);
    } finally {
      setConfirming(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendCode(email);
      setSecondsLeft(RESEND_SECONDS);
      Alert.alert('Código reenviado', 'Revisa tu correo nuevamente.');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'No se pudo reenviar el código.';
      Alert.alert('Error', message);
    } finally {
      setResending(false);
    }
  };

  const handleChange = (value: string, index: number) => {
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TopBar onBack={() => navigation?.goBack?.()} rightChip="Línea de crisis 24/7 disponible" />

      <View style={styles.body}>
        <View style={styles.brand}>
          <View style={styles.iconWrapper}>
            <Icon name="mail" size={32} color={colors.primary} />
            <View style={styles.badge}>
              <Icon name="check" size={12} color={colors.surface} />
            </View>
          </View>
          <View style={styles.verifiedChip}>
            <Icon name="shield" size={12} color={colors.textGreen} />
            <Text style={styles.verifiedText}>Espacio seguro verificado</Text>
          </View>
          <Text style={styles.title}>Verifica tu cuenta</Text>
          <Text style={styles.subtitle}>
            Hemos enviado un código de seguridad de 6 dígitos a tu correo electrónico:
          </Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>CÓDIGO DE CONFIRMACIÓN</Text>
            <View style={styles.digitsChip}>
              <Icon name="hash" size={12} color={colors.textGreen} />
              <Text style={styles.digitsChipText}>6 dígitos</Text>
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
                onChangeText={(v) => handleChange(v, index)}
              />
            ))}
          </View>

          {secondsLeft > 0 ? (
            <View style={styles.resendRow}>
              <Icon name="clock" size={13} color={colors.textSecondary} />
              <Text style={styles.resendText}>
                Reenviar código en{' '}
                <Text style={styles.resendTime}>
                  00:{secondsLeft.toString().padStart(2, '0')}
                </Text>
              </Text>
            </View>
          ) : null}
          <TouchableOpacity
            disabled={secondsLeft > 0 || resending}
            style={styles.resendButton}
            onPress={handleResend}
          >
            <Icon
              name="refresh-cw"
              size={12}
              color={secondsLeft > 0 ? (colors.textSecondary50 as string) : colors.primaryDark}
            />
            <Text
              style={[
                styles.resendButtonText,
                secondsLeft <= 0 && { color: colors.primaryDark },
              ]}
            >
              {resending ? 'Reenviando...' : '¿No recibiste el código? Reenviar'}
            </Text>
          </TouchableOpacity>
        </View>

        <PrimaryButton
          label="Confirmar y continuar"
          icon="check-circle"
          style={styles.confirmButton}
          loading={confirming}
          onPress={handleConfirm}
        />

        <PrimaryButton label="Modificar dirección de correo" icon="edit-2" variant="neutral" style={styles.editButton} />

        <View style={styles.noticeCard}>
          <View style={styles.noticeIcon}>
            <Icon name="lock" size={15} color={colors.textGreen} />
          </View>
          <View style={styles.noticeTextWrap}>
            <Text style={styles.noticeTitle}>Protección de tu santuario</Text>
            <Text style={styles.noticeBody}>
              Este paso garantiza que tu espacio personal, reflexiones y conversaciones de acompañamiento
              permanezcan completamente privados y bajo tu control.
            </Text>
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
  brand: { alignItems: 'center', marginBottom: spacing.xl, gap: spacing.sm },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  badge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.textGreen,
    borderRadius: radii.pill,
    padding: 4,
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceGreen,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  verifiedText: { ...typography.caption, color: colors.textGreen },
  title: { ...typography.h1, color: colors.textPrimary, marginTop: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', maxWidth: 300 },
  email: { ...typography.label, color: colors.textPrimary, letterSpacing: 0.35 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.lg,
  },
  cardLabel: { ...typography.caption, color: colors.textSecondary, letterSpacing: 0.6 },
  digitsChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  digitsChipText: { ...typography.caption, color: colors.textGreen },
  otpRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  otpInput: {
    width: 44,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.inputBg,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  resendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs },
  resendText: { ...typography.caption, color: colors.textSecondary },
  resendTime: { fontWeight: '600', color: colors.textPrimary },
  resendButton: { flexDirection: 'row', alignItems: 'center', gap: 6, opacity: 0.4, padding: spacing.sm },
  resendButtonText: { ...typography.label, color: colors.textSecondary50 },
  confirmButton: { marginBottom: spacing.md },
  editButton: { marginBottom: spacing.lg },
  noticeCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  noticeIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeTextWrap: { flex: 1 },
  noticeTitle: { ...typography.label, color: colors.textPrimary, marginBottom: 2 },
  noticeBody: { ...typography.small, color: colors.textSecondary },
});
