import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AppHeader from '../../components/AppHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import {
  buildSpotifyAuthRequest,
  parseSpotifyCallbackUrl,
  spotifyService,
  SpotifyStatus,
} from '../../services/spotify';

const BENEFITS = [
  { title: 'Sesiones guiadas con tu música', desc: 'Frecuencias binaurales, ambient y lofi sincronizadas en tiempo real con ejercicios somáticos de respiración.', icon: 'headphones', bg: colors.surfacePurpleSoft },
  { title: 'Listas curadas por psicólogos', desc: 'Acceso exclusivo a playlists diseñadas para desescalar la ansiedad aguda, regular el insomnio y acompañar crisis de pánico.', icon: 'list', bg: colors.surfaceGreen },
  { title: 'Privacidad protegida', desc: 'Sanctuary solo lee metadatos de audio en reposo. Jamás publicará en tu perfil ni compartirá tus hábitos con terceros.', icon: 'shield', bg: '#FFD9DD' },
];

const PERMISSIONS = [
  'Acceso de solo lectura a tus playlists, podcasts y biblioteca guardada',
  'Control de reproducción remota dentro de tus ejercicios guiados',
  'Registro privado de sesiones de calma (almacenamiento local)',
];

const SAMPLES = [
  { title: 'Viento Suave 432Hz', desc: 'Ansiedad aguda', icon: 'wind' },
  { title: 'Lluvia Nocturna', desc: 'Inducción al sueño', icon: 'cloud-rain' },
];

export default function SpotifyConnectScreen({ navigation }: any) {
  const { accessToken } = useAuth();
  const [status, setStatus] = useState<SpotifyStatus>({ connected: false });
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const codeVerifierRef = useRef<string | null>(null);

  const loadStatus = useCallback(async () => {
    if (!accessToken) return;
    try {
      const result = await spotifyService.getStatus(accessToken);
      setStatus(result);
    } catch (err) {
      console.log('[Spotify] error consultando estado', err);
    } finally {
      setLoadingStatus(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const finishConnection = useCallback(
    async (code: string) => {
      if (!accessToken || !codeVerifierRef.current) return;
      setConnecting(true);
      try {
        const result = await spotifyService.connect(accessToken, {
          code,
          codeVerifier: codeVerifierRef.current,
        });
        setStatus({ connected: true, displayName: result.displayName });
      } catch (err: any) {
        Alert.alert(
          'No se pudo conectar',
          err?.message ?? 'Intenta de nuevo en unos segundos.',
        );
      } finally {
        setConnecting(false);
        codeVerifierRef.current = null;
      }
    },
    [accessToken],
  );


  useEffect(() => {
    const handleUrl = ({ url }: { url: string }) => {
      if (!url.startsWith('letdownapp://spotify-callback')) return;
      const { code, error } = parseSpotifyCallbackUrl(url);
      if (error) {
        Alert.alert('Conexión cancelada', 'No se completó el acceso a Spotify.');
        return;
      }
      if (code) {
        finishConnection(code);
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    return () => subscription.remove();
  }, [finishConnection]);

  const handleConnectPress = async () => {
    const { url, codeVerifier } = buildSpotifyAuthRequest();
    codeVerifierRef.current = codeVerifier;

    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert('No se pudo abrir Spotify', 'Intenta de nuevo en unos segundos.');
    }
  };

  const handleDisconnect = async () => {
    if (!accessToken) return;
    try {
      await spotifyService.disconnect(accessToken);
      setStatus({ connected: false });
    } catch (err) {
      console.log('[Spotify] error desconectando', err);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader onOpenMenu={() => navigation?.openDrawer?.()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
            <Icon name="arrow-left" size={16} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.secureChip}>
            <Icon name="lock" size={13} color={colors.textGreen} />
            <Text style={styles.secureChipText}>Integración Segura</Text>
          </View>
        </View>

        <View style={styles.eyebrowRow}>
          <Icon name="music" size={16} color={colors.primaryDark} />
          <Text style={styles.eyebrow}>PASO 6.1 • SINCRONIZACIÓN SONORA</Text>
        </View>
        <Text style={styles.title}>Música & Calma Sonora</Text>
        <Text style={styles.subtitle}>
          Conecta tu cuenta de Spotify para personalizar tu experiencia sonora terapéutica y regular tu sistema
          nervioso.
        </Text>

        <View style={styles.bridgeCard}>
          <View style={styles.bridgeRow}>
            <View style={styles.nodeWrap}>
              <View style={[styles.node, { backgroundColor: colors.primaryDark }]}>
                <Icon name="feather" size={26} color={colors.surface} />
              </View>
              <Text style={styles.nodeLabel}>Sanctuary</Text>
            </View>
            <View style={styles.waveform}>
              {[12, 24, 32, 24, 12].map((h, i) => (
                <View key={i} style={[styles.waveBar, { height: h, backgroundColor: i === 2 ? colors.textGreen : colors.primaryDark }]} />
              ))}
            </View>
            <View style={styles.nodeWrap}>
              <View style={[styles.node, { backgroundColor: '#1DB954' }]}>
                <Icon name="music" size={26} color={colors.surface} />
              </View>
              <Text style={styles.nodeLabel}>Spotify</Text>
            </View>
          </View>
          <View style={styles.bridgeFooter}>
            <View style={styles.bridgeFooterLeft}>
              <Icon name="activity" size={14} color={colors.textPrimary} />
              <Text style={styles.bridgeFooterText}>Sonido restaurativo en 432 Hz y 528 Hz</Text>
            </View>
            <Text style={styles.readyLabel}>
              {loadingStatus ? '...' : status.connected ? 'Conectado' : 'Listo'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Beneficios de la vinculación</Text>
        {BENEFITS.map((b) => (
          <View key={b.title} style={styles.benefitCard}>
            <View style={[styles.benefitIcon, { backgroundColor: b.bg }]}>
              <Icon name={b.icon} size={19} color={colors.primaryDark} />
            </View>
            <View style={styles.benefitTextWrap}>
              <Text style={styles.benefitTitle}>{b.title}</Text>
              <Text style={styles.benefitDesc}>{b.desc}</Text>
            </View>
          </View>
        ))}

        <View style={styles.permissionsCard}>
          <View style={styles.permissionsHeader}>
            <Icon name="shield" size={16} color={colors.textPrimary} />
            <Text style={styles.permissionsTitle}>Permisos transparentes solicitados</Text>
          </View>
          {PERMISSIONS.map((p) => (
            <View key={p} style={styles.permissionRow}>
              <View style={styles.permissionCheck}>
                <Icon name="check" size={11} color={colors.surface} />
              </View>
              <Text style={styles.permissionText}>{p}</Text>
            </View>
          ))}
        </View>

        {status.connected ? (
          <View style={styles.connectedCard}>
            <View style={styles.connectedRow}>
              <View style={styles.connectedIcon}>
                <Icon name="check-circle" size={20} color={colors.textGreen} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.connectedTitle}>Spotify conectado</Text>
                {!!status.displayName && (
                  <Text style={styles.connectedSubtitle}>Cuenta: {status.displayName}</Text>
                )}
              </View>
            </View>
            <PrimaryButton
              label="Ver mi música y podcasts"
              style={styles.localButton}
              onPress={() => navigation?.navigate?.('SpotifyPlaylists')}
            />
            <TouchableOpacity onPress={handleDisconnect}>
              <Text style={styles.disconnectText}>Desconectar cuenta de Spotify</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.spotifyButton}
              onPress={handleConnectPress}
              disabled={connecting || loadingStatus}
            >
              {connecting ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <>
                  <Icon name="music" size={22} color={colors.surface} />
                  <Text style={styles.spotifyButtonText}>Conectar con Spotify</Text>
                </>
              )}
            </TouchableOpacity>
            <PrimaryButton
              label="Continuar con reproductor local gratuito de Sanctuary (Sin Spotify)"
              variant="neutral"
              style={styles.localButton}
              onPress={() => navigation?.navigate?.('SpotifyPlaylists')}
            />
          </>
        )}

        <View style={styles.samplesCard}>
          <View style={styles.samplesHeader}>
            <Text style={styles.samplesTitle}>Muestras clínicas predeterminadas</Text>
            <Text style={styles.samplesIncluded}>Incluidas</Text>
          </View>
          <View style={styles.samplesRow}>
            {SAMPLES.map((s) => (
              <View key={s.title} style={styles.sampleItem}>
                <Icon name={s.icon} size={14} color={colors.textPrimary} />
                <View>
                  <Text style={styles.sampleTitle}>{s.title}</Text>
                  <Text style={styles.sampleDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.crisisCard}>
          <View style={styles.crisisHeader}>
            <Icon name="alert-triangle" size={17} color="#BA1A1A" />
            <Text style={styles.crisisTitle}>¿Sientes abrumo o angustia intensa?</Text>
          </View>
          <Text style={styles.crisisBody}>
            La música es un ancla terapéutica, pero no estás solo si necesitas hablar con una persona capacitada en
            este instante.
          </Text>
          <View style={styles.crisisFooter}>
            <Text style={styles.crisisFooterText}>Línea directa y confidencial 24/7</Text>
            <TouchableOpacity style={styles.crisisButton} onPress={() => Linking.openURL('tel:988')}>
              <Icon name="phone" size={13} color={colors.surface} />
              <Text style={styles.crisisButtonText}>Llamar 988</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },
  backButton: { width: 40, height: 40, borderRadius: radii.pill, backgroundColor: colors.surfaceLavender, alignItems: 'center', justifyContent: 'center' },
  secureChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceGreen, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: 4 },
  secureChipText: { ...typography.caption, color: colors.textGreen },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  eyebrow: { ...typography.caption, color: colors.primaryDark, letterSpacing: 0.7 },
  title: { ...typography.h1, color: colors.textPrimary, marginTop: 4 },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
  bridgeCard: { backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: spacing.xl, gap: spacing.md, marginBottom: spacing.xl },
  bridgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  nodeWrap: { alignItems: 'center', gap: 4 },
  node: { width: 64, height: 64, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  nodeLabel: { ...typography.caption, color: colors.textPrimary },
  waveform: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  waveBar: { width: 5, borderRadius: radii.pill },
  bridgeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 8, padding: spacing.md },
  bridgeFooterLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  bridgeFooterText: { ...typography.small, color: colors.textPrimary, flex: 1 },
  readyLabel: { ...typography.caption, color: colors.primaryDark },
  sectionTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary, marginBottom: spacing.sm },
  benefitCard: { flexDirection: 'row', gap: spacing.lg, backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.lg, marginBottom: spacing.sm },
  benefitIcon: { width: 44, height: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  benefitTextWrap: { flex: 1 },
  benefitTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  benefitDesc: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  permissionsCard: { backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: spacing.lg, gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.xl },
  permissionsHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  permissionsTitle: { ...typography.label, color: colors.textPrimary },
  permissionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  permissionCheck: { width: 20, height: 20, borderRadius: radii.pill, backgroundColor: colors.textGreen, alignItems: 'center', justifyContent: 'center' },
  permissionText: { ...typography.small, color: colors.textPrimary, flex: 1 },
  spotifyButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, height: 56, borderRadius: radii.pill, backgroundColor: '#1DB954', marginBottom: spacing.sm },
  spotifyButtonText: { ...typography.label, fontSize: 17, color: colors.surface },
  localButton: { marginBottom: spacing.xl },
  connectedCard: { backgroundColor: colors.surfaceGreen, borderRadius: radii.md, padding: spacing.lg, gap: spacing.md, marginBottom: spacing.xl },
  connectedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  connectedIcon: { width: 40, height: 40, borderRadius: radii.pill, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  connectedTitle: { ...typography.label, fontSize: 17, color: colors.textGreen },
  connectedSubtitle: { ...typography.small, color: colors.textGreen },
  disconnectText: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  samplesCard: { backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.lg, gap: spacing.md, marginBottom: spacing.xl },
  samplesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  samplesTitle: { ...typography.label, color: colors.textPrimary },
  samplesIncluded: { ...typography.caption, color: colors.textGreen },
  samplesRow: { flexDirection: 'row', gap: spacing.sm },
  sampleItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surfaceMuted, borderRadius: 8, padding: spacing.sm },
  sampleTitle: { ...typography.caption, color: colors.textPrimary },
  sampleDesc: { ...typography.small, color: colors.textSecondary },
  crisisCard: { backgroundColor: colors.surfaceLavender, borderRadius: radii.md, padding: spacing.lg, gap: spacing.sm, marginBottom: spacing.xl },
  crisisHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  crisisTitle: { ...typography.label, fontSize: 17, color: '#BA1A1A', flex: 1 },
  crisisBody: { ...typography.small, color: colors.textSecondary },
  crisisFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  crisisFooterText: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  crisisButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#BA1A1A', borderRadius: radii.pill, height: 40, paddingHorizontal: spacing.lg },
  crisisButtonText: { ...typography.caption, color: colors.surface, fontWeight: '700' },
});
