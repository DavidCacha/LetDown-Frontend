import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import TopBar from '../../components/TopBar';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { authService } from '../../services/auth';
import { ApiError } from '../../services/api';

const sanctuaryLogo = require('../../assets/images/letdown_logo.png');

export default function ForgotPasswordScreen({ navigation }: any) {
  const [method, setMethod] = useState<'email' | 'sms'>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const trimmedEmail = email.trim();

    if (method === 'sms') {
      Alert.alert('Próximamente', 'La recuperación por SMS aún no está disponible. Usa tu correo por ahora.');
      return;
    }

    if (!trimmedEmail) {
      Alert.alert('Falta tu correo', 'Ingresa el correo con el que te registraste.');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(trimmedEmail);
      navigation?.navigate?.('ResetPassword', { email: trimmedEmail });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'No se pudo enviar el código.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TopBar onBack={() => navigation?.goBack?.()} rightChip="Línea de crisis 24/7 disponible" />

      <View style={styles.body}>
        <View style={styles.brand}>
          <View style={styles.logoWrapper}>
            <Image source={sanctuaryLogo} style={styles.logo} resizeMode="contain" />
          </View>
          <View style={styles.brandRow}>
            <Text style={styles.brandName}>letDown</Text>
            <View style={styles.brandDot} />
          </View>
          <Text style={styles.title}>¿No recuerdas tu clave?</Text>
          <Text style={styles.subtitle}>
            Tómate una pausa. Respira hondo e ingresa tus datos de acceso; te guiaremos paso a paso a tu ritmo.
          </Text>
        </View>

        <TouchableOpacity style={styles.crisisBanner}>
          <View style={styles.crisisIconWrap}>
            <Icon name="heart" size={16} color={colors.textGreen} />
          </View>
          <View style={styles.crisisTextWrap}>
            <Text style={styles.crisisTitle}>¿En crisis ahora mismo?</Text>
            <Text style={styles.crisisBody}>
              No necesitas iniciar sesión para recibir contención humana y segura.
            </Text>
            <View style={styles.crisisLinkRow}>
              <Text style={styles.crisisLink}>Hablar con un especialista de guardia</Text>
              <Icon name="arrow-right" size={13} color={colors.textGreen} />
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>¿Cómo prefieres recibir tu código seguro?</Text>
          <View style={styles.segmentRow}>
            <TouchableOpacity
              style={[styles.segment, method === 'email' && styles.segmentActive]}
              onPress={() => setMethod('email')}
            >
              <Icon name="at-sign" size={14} color={method === 'email' ? colors.primaryDark : colors.textSecondary} />
              <Text style={[styles.segmentText, method === 'email' && styles.segmentTextActive]}>Por Correo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segment, method === 'sms' && styles.segmentActive]}
              onPress={() => setMethod('sms')}
            >
              <Icon name="smartphone" size={14} color={method === 'sms' ? colors.primaryDark : colors.textSecondary} />
              <Text style={[styles.segmentText, method === 'sms' && styles.segmentTextActive]}>Por SMS</Text>
            </TouchableOpacity>
          </View>

          <TextField
            label="Correo electrónico registrado"
            placeholder="tu.refugio@ejemplo.com"
            icon="mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={method === 'email'}
          />

          <View style={styles.noticeBox}>
            <Icon name="shield" size={15} color={colors.textGreen} style={styles.noticeIcon} />
            <Text style={styles.noticeText}>
              Generaremos un código numérico temporal de un solo uso que expirará en 15 minutos para salvaguardar tu
              intimidad.
            </Text>
          </View>

          <PrimaryButton
            label="Enviar código de restauración"
            icon="rotate-ccw"
            loading={loading}
            onPress={handleSend}
          />
        </View>

        <View style={styles.badgesRow}>
          <View style={styles.badge}>
            <Icon name="shield" size={12} color={colors.textSecondary} />
            <Text style={styles.badgeText}>100% Confidencial y Cifrado</Text>
          </View>
          <View style={styles.badge}>
            <Icon name="feather" size={12} color={colors.textSecondary} />
            <Text style={styles.badgeText}>Cero juicios · A tu compás</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Recordaste tu contraseña?</Text>
          <TouchableOpacity onPress={() => navigation?.navigate?.('Login')}>
            <View style={styles.footerLinkRow}>
              <Icon name="arrow-left" size={13} color={colors.primaryDark} />
              <Text style={styles.footerLink}>Volver e iniciar sesión</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.footnote}>Tu bienestar emocional es nuestra única prioridad</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  body: { paddingHorizontal: spacing.md },
  brand: { alignItems: 'center', marginBottom: spacing.lg, gap: spacing.xs },
  logoWrapper: {
    width: 96,
    height: 96,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  logo: { width: 56, height: 56 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandName: { ...typography.label, fontSize: 17, color: colors.primaryDark },
  brandDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textGreen },
  title: { ...typography.h1, color: colors.textPrimary, marginTop: spacing.sm, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
  crisisBanner: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surfaceGreen,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  crisisIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crisisTextWrap: { flex: 1 },
  crisisTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  crisisBody: { ...typography.small, color: colors.textGreen, marginTop: 2 },
  crisisLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  crisisLink: { ...typography.label, color: colors.textGreen, textDecorationLine: 'underline' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    shadowColor: '#7868A6',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardLabel: { ...typography.label, color: colors.textPrimary, marginBottom: spacing.sm },
  segmentRow: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: 4, marginBottom: spacing.lg },
  segment: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.sm, borderRadius: radii.sm },
  segmentActive: { backgroundColor: colors.surface },
  segmentText: { ...typography.label, color: colors.textSecondary },
  segmentTextActive: { color: colors.primaryDark },
  noticeBox: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.lg },
  noticeIcon: { marginTop: 2 },
  noticeText: { ...typography.small, color: colors.textSecondary, flex: 1 },
  badgesRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.lg, flexWrap: 'wrap' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceMuted, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: 6 },
  badgeText: { ...typography.caption, color: colors.textSecondary },
  footer: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.lg },
  footerText: { ...typography.body, color: colors.textPrimary },
  footerLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerLink: { ...typography.label, color: colors.primaryDark },
  footnote: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
});
