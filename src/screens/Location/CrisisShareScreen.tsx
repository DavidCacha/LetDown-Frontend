import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/Feather';
import AppHeader from '../../components/AppHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/api';
import { TrustedContact, contactsService } from '../../services/contact';
import { LocationShare, locationShareService } from '../../services/locationShare';

const PING_INTERVAL_MS = 15000;
const DURATIONS = [30, 60, 120];

function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return Promise.resolve(true);
  return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
    title: 'Permiso de ubicación',
    message: 'Sanctuary necesita tu ubicación para compartirla con tus contactos de confianza durante una crisis.',
    buttonPositive: 'Permitir',
    buttonNegative: 'Cancelar',
  }).then((result) => result === PermissionsAndroid.RESULTS.GRANTED);
}

function getCurrentPosition(): Promise<{ latitude: number; longitude: number; accuracy?: number }> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? undefined,
        }),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
    );
  });
}

function formatRemaining(expiresAt: string): string {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return '0:00';
  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function CrisisShareScreen({ navigation }: any) {
  const { accessToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [share, setShare] = useState<LocationShare | null>(null);
  const [recipients, setRecipients] = useState<TrustedContact[]>([]);

  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [duration, setDuration] = useState(DURATIONS[1]);
  const [startingDiscreet, setStartingDiscreet] = useState(false);
  const [starting, setStarting] = useState(false);

  const [remaining, setRemaining] = useState('--:--');
  const [stopping, setStopping] = useState(false);
  const [extending, setExtending] = useState(false);

  const pingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadActive = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const result = await locationShareService.getActive(accessToken);
      setShare(result.share);
      setRecipients(result.recipients);
      if (!result.share) {
        const myContacts = await contactsService.getAll(accessToken);
        setContacts(myContacts);
        setSelectedIds(myContacts.filter((c) => c.isPrimary).map((c) => c.id));
      }
    } catch (err) {
      Alert.alert(
        'No se pudo cargar tu estado de ubicación',
        err instanceof ApiError ? err.message : 'Intenta de nuevo en un momento.',
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadActive();
  }, [loadActive]);

  useEffect(() => {
    if (!share) {
      setRemaining('--:--');
      if (countdownTimer.current) clearInterval(countdownTimer.current);
      return;
    }
    setRemaining(formatRemaining(share.expiresAt));
    countdownTimer.current = setInterval(() => {
      setRemaining(formatRemaining(share.expiresAt));
    }, 1000);
    return () => {
      if (countdownTimer.current) clearInterval(countdownTimer.current);
    };
  }, [share]);

  useEffect(() => {
    if (!share || !accessToken) {
      if (pingTimer.current) clearInterval(pingTimer.current);
      return;
    }

    const sendPing = async () => {
      try {
        const pos = await getCurrentPosition();
        await locationShareService.addPing(accessToken, share.id, pos.latitude, pos.longitude, pos.accuracy);
      } catch {
      }
    };

    pingTimer.current = setInterval(sendPing, PING_INTERVAL_MS);
    return () => {
      if (pingTimer.current) clearInterval(pingTimer.current);
    };
  }, [share, accessToken]);

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleStart = async () => {
    if (!accessToken) return;
    if (selectedIds.length === 0) {
      Alert.alert('Elige al menos un contacto', 'Selecciona a quién avisar antes de iniciar.');
      return;
    }

    setStarting(true);
    try {
      const granted = await requestLocationPermission();
      if (!granted) {
        Alert.alert('Permiso necesario', 'Sin permiso de ubicación no podemos compartir tu posición.');
        return;
      }
      const pos = await getCurrentPosition();
      const result = await locationShareService.start(accessToken, {
        recipientContactIds: selectedIds,
        durationMinutes: duration,
        discreetMode: startingDiscreet,
        latitude: pos.latitude,
        longitude: pos.longitude,
      });
      setShare(result.share);
      setRecipients(result.recipients);
    } catch (err) {
      Alert.alert(
        'No se pudo iniciar la transmisión',
        err instanceof ApiError ? err.message : 'Revisa que tu GPS esté activo e intenta de nuevo.',
      );
    } finally {
      setStarting(false);
    }
  };

  const handleExtend = async () => {
    if (!accessToken || !share) return;
    setExtending(true);
    try {
      const result = await locationShareService.extend(accessToken, share.id, 30);
      setShare(result.share);
    } catch (err) {
      Alert.alert('No se pudo extender', err instanceof ApiError ? err.message : 'Intenta de nuevo.');
    } finally {
      setExtending(false);
    }
  };

  const handleToggleDiscreet = async (value: boolean) => {
    if (!accessToken || !share) return;
    setShare({ ...share, discreetMode: value });
    try {
      await locationShareService.setDiscreetMode(accessToken, share.id, value);
    } catch (err) {
      Alert.alert('No se pudo cambiar el modo discreto', err instanceof ApiError ? err.message : 'Intenta de nuevo.');
    }
  };

  const handleStop = async () => {
    if (!accessToken || !share) return;
    setStopping(true);
    try {
      await locationShareService.stop(accessToken, share.id);
      setShare(null);
      loadActive();
    } catch (err) {
      Alert.alert('No se pudo detener', err instanceof ApiError ? err.message : 'Intenta de nuevo.');
    } finally {
      setStopping(false);
    }
  };

  const handleNotify = () => {
    const body =
      'Me encuentro en una situación difícil o crisis emocional. Necesito tu presencia o apoyo ahora mismo.';
    const numbers = recipients.map((c) => `${c.phoneCountryCode ?? ''}${c.phoneNumber}`.replace(/\s/g, ''));
    if (numbers.length === 0) return;
    Linking.openURL(`sms:${numbers.join(',')}?body=${encodeURIComponent(body)}`);
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <AppHeader onOpenMenu={() => navigation?.openDrawer?.()} />
        <View style={styles.loadingScreen}>
          <ActivityIndicator color={colors.primaryDark} size="large" />
        </View>
      </View>
    );
  }

  if (!share) {
    return (
      <View style={styles.screen}>
        <AppHeader onOpenMenu={() => navigation?.openDrawer?.()} />
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
            <Icon name="arrow-left" size={16} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.startTitle}>Compartir ubicación en crisis</Text>
          <Text style={styles.startSubtitle}>
            Al iniciar, tu ubicación en vivo se envía a los contactos que elijas hasta que la detengas o se acabe el
            tiempo.
          </Text>

          <Text style={styles.sectionLabel}>¿A quién avisamos?</Text>
          {contacts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Icon name="users" size={20} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                No tienes contactos de confianza guardados todavía. Agrega al menos uno desde Contactos.
              </Text>
            </View>
          ) : (
            contacts.map((c) => {
              const selected = selectedIds.includes(c.id);
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.contactPickRow, selected && styles.contactPickRowActive]}
                  onPress={() => toggleSelected(c.id)}
                >
                  <View style={styles.contactPickLeft}>
                    <Icon name="user" size={16} color={colors.primaryDark} />
                    <View>
                      <Text style={styles.contactPickName}>{c.fullName}</Text>
                      <Text style={styles.contactPickPhone}>{c.phoneCountryCode} {c.phoneNumber}</Text>
                    </View>
                  </View>
                  <Icon
                    name={selected ? 'check-circle' : 'circle'}
                    size={18}
                    color={selected ? colors.primaryDark : colors.textSecondary50 as string}
                  />
                </TouchableOpacity>
              );
            })
          )}

          <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>Duración</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.durationChip, duration === d && styles.durationChipActive]}
                onPress={() => setDuration(d)}
              >
                <Text style={[styles.durationChipText, duration === d && styles.durationChipTextActive]}>
                  {d} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.discreetCard}>
            <View style={styles.discreetLeft}>
              <View style={styles.discreetIcon}>
                <Icon name="eye-off" size={18} color={colors.textGreen} />
              </View>
              <View>
                <Text style={styles.discreetTitle}>Modo discreto</Text>
                <Text style={styles.discreetDesc}>Silencia alertas, vibración y atenuación de pantalla</Text>
              </View>
            </View>
            <Switch
              value={startingDiscreet}
              onValueChange={setStartingDiscreet}
              trackColor={{ true: colors.textGreen, false: colors.disabled }}
              thumbColor={colors.surface}
            />
          </View>

          <PrimaryButton
            label="Iniciar transmisión de ubicación"
            icon="map-pin"
            variant="danger"
            style={{ marginTop: spacing.lg, marginBottom: spacing.md }}
            loading={starting}
            disabled={starting || contacts.length === 0}
            onPress={handleStart}
          />
          <PrimaryButton
            label="LLAMAR 988 LÍNEA DE CRISIS 24/7"
            icon="phone-call"
            variant="neutral"
            onPress={() => Linking.openURL('tel:988')}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AppHeader onOpenMenu={() => navigation?.openDrawer?.()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
            <Icon name="arrow-left" size={16} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.protocolChip}>
            <Icon name="alert-triangle" size={13} color="#301217" />
            <Text style={styles.protocolChipText}>TRANSMITIENDO EN VIVO</Text>
          </View>
          <View style={styles.e2eChip}>
            <Icon name="lock" size={13} color={colors.textGreen} />
            <Text style={styles.e2eChipText}>E2E</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroLiveRow}>
            <View style={styles.heroLiveDot} />
            <Text style={styles.heroLiveText}>SEÑAL GPS EN VIVO</Text>
          </View>
          <Text style={styles.heroTitle}>Transmisión de Geoseguridad</Text>
          <Text style={styles.heroDesc}>
            Tus coordenadas se actualizan cada 15s. Solo tus contactos elegidos pueden ver tu ubicación.
          </Text>

          <View style={styles.mapPlaceholder}>
            <Icon name="map-pin" size={24} color={colors.primaryDark} />
            <View style={styles.mapBadge}>
              <Icon name="target" size={13} color={colors.textPrimary} />
              <Text style={styles.mapBadgeText}>
                {share.lastLatitude != null
                  ? `${Number(share.lastLatitude).toFixed(4)}, ${Number(share.lastLongitude).toFixed(4)}`
                  : 'Esperando señal GPS...'}
              </Text>
            </View>
          </View>

          <View style={styles.expiryRow}>
            <View style={styles.expiryLeft}>
              <Icon name="clock" size={16} color={colors.textPrimary} />
              <View>
                <Text style={styles.expiryTitle}>Vigencia del enlace</Text>
                <Text style={styles.expiryDesc}>Activo por los próximos {remaining} min</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.expiryButton} disabled={extending} onPress={handleExtend}>
              {extending ? (
                <ActivityIndicator size="small" color={colors.primaryDark} />
              ) : (
                <Text style={styles.expiryButtonText}>+30 min</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.discreetCard}>
          <View style={styles.discreetLeft}>
            <View style={styles.discreetIcon}>
              <Icon name="eye-off" size={18} color={colors.textGreen} />
            </View>
            <View>
              <Text style={styles.discreetTitle}>Modo discreto</Text>
              <Text style={styles.discreetDesc}>Silencia alertas, vibración y atenuación de pantalla</Text>
            </View>
          </View>
          <Switch
            value={share.discreetMode}
            onValueChange={handleToggleDiscreet}
            trackColor={{ true: colors.textGreen, false: colors.disabled }}
            thumbColor={colors.surface}
          />
        </View>

        <View style={styles.contactsHeader}>
          <Text style={styles.contactsTitle}>Destinatarios de confianza</Text>
          <Text style={styles.contactsCount}>{recipients.length} vinculados</Text>
        </View>
        {recipients.map((c) => (
          <View key={c.id} style={styles.contactCard}>
            <View style={styles.contactLeft}>
              <View style={styles.contactAvatar}>
                <Icon name="user" size={18} color={colors.primaryDark} />
              </View>
              <View style={styles.contactTextWrap}>
                <Text style={styles.contactName}>{c.fullName}</Text>
                <Text style={styles.contactDetail}>{c.phoneCountryCode} {c.phoneNumber}</Text>
              </View>
            </View>
            <View style={styles.contactCheck}>
              <Icon name="check" size={14} color={colors.surface} />
            </View>
          </View>
        ))}

        <PrimaryButton
          label="LLAMAR 988 LÍNEA DE CRISIS 24/7"
          icon="phone-call"
          variant="danger"
          style={styles.primaryAction}
          onPress={() => Linking.openURL('tel:988')}
        />
        <PrimaryButton
          label="Notificar a los contactos por SMS"
          icon="send"
          variant="primary"
          style={[styles.primaryAction, { backgroundColor: colors.textGreen }]}
          onPress={handleNotify}
        />
        <PrimaryButton
          label="Estoy a salvo, detener compartir ubicación"
          icon="check-circle"
          variant="neutral"
          style={styles.tertiaryAction}
          loading={stopping}
          disabled={stopping}
          onPress={handleStop}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backButton: { width: 44, height: 44, borderRadius: radii.pill, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
  startTitle: { ...typography.h1, color: colors.textPrimary },
  startSubtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
  sectionLabel: { ...typography.label, fontSize: 17, color: colors.textPrimary, marginBottom: spacing.sm },
  emptyCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.lg, marginBottom: spacing.lg },
  emptyText: { ...typography.small, color: colors.textSecondary, flex: 1 },
  contactPickRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.lg, marginBottom: spacing.sm },
  contactPickRowActive: { backgroundColor: colors.surfaceLavender },
  contactPickLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  contactPickName: { ...typography.label, color: colors.textPrimary },
  contactPickPhone: { ...typography.small, color: colors.textSecondary },
  durationRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  durationChip: { flex: 1, backgroundColor: colors.surfaceMuted, borderRadius: radii.pill, height: 44, alignItems: 'center', justifyContent: 'center' },
  durationChipActive: { backgroundColor: colors.primaryDark },
  durationChipText: { ...typography.label, color: colors.textSecondary },
  durationChipTextActive: { color: colors.surface },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },
  protocolChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFD9DD', borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: 6 },
  protocolChipText: { fontSize: 11, fontWeight: '700', color: '#301217', letterSpacing: 0.3 },
  e2eChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceGreen, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  e2eChipText: { ...typography.caption, color: colors.textGreen },
  heroCard: { backgroundColor: '#FFF0F1', borderRadius: radii.lg, padding: spacing.xl, gap: spacing.md, marginBottom: spacing.lg },
  heroLiveRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroLiveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#774E54' },
  heroLiveText: { fontSize: 12, fontWeight: '700', color: '#774E54', letterSpacing: 0.6 },
  heroTitle: { ...typography.h1, color: colors.textPrimary, marginTop: 4 },
  heroDesc: { ...typography.body, color: colors.textSecondary },
  mapPlaceholder: { height: 144, borderRadius: radii.md, backgroundColor: colors.surfaceLavender, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  mapBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  mapBadgeText: { ...typography.caption, color: colors.textPrimary },
  expiryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: radii.md, padding: spacing.md },
  expiryLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  expiryTitle: { ...typography.caption, color: colors.textPrimary, fontWeight: '600' },
  expiryDesc: { ...typography.small, color: colors.textSecondary },
  expiryButton: { backgroundColor: colors.surfaceMuted, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: 6, minWidth: 64, alignItems: 'center' },
  expiryButtonText: { ...typography.caption, color: colors.primaryDark },
  discreetCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.lg, marginBottom: spacing.lg },
  discreetLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  discreetIcon: { width: 44, height: 44, borderRadius: radii.pill, backgroundColor: colors.surfaceGreen, alignItems: 'center', justifyContent: 'center' },
  discreetTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  discreetDesc: { ...typography.small, color: colors.textSecondary },
  contactsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  contactsTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  contactsCount: { ...typography.caption, color: colors.primaryDark },
  contactCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.lg, marginBottom: spacing.sm },
  contactLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  contactAvatar: { width: 44, height: 44, borderRadius: radii.pill, backgroundColor: colors.surfaceLavender, alignItems: 'center', justifyContent: 'center' },
  contactTextWrap: { flex: 1 },
  contactName: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  contactDetail: { ...typography.small, color: colors.textSecondary },
  contactCheck: { width: 24, height: 24, borderRadius: 4, backgroundColor: colors.textGreen, alignItems: 'center', justifyContent: 'center' },
  primaryAction: { marginBottom: spacing.md },
  tertiaryAction: { marginBottom: spacing.md },
});
