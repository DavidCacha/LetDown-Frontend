import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AppHeader from '../../components/AppHeader';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import {
  SpotifyPlaylist,
  SpotifyShow,
  spotifyService,
  SpotifyStatus,
} from '../../services/spotify';

const TABS = ['Para tu estado actual', 'Tus Playlists', 'Podcasts'] as const;
type Tab = (typeof TABS)[number];

const RECOMMENDED = [
  { title: 'Descompresión de Ansiedad', desc: 'Sonidos binaurales 432Hz • 25 min', tag: 'Alivia tensión', tagBg: colors.surfaceGreen, tagColor: colors.textGreen },
  { title: 'Respiración Profunda 4-7-8', desc: 'Piano minimalista & oleaje • 18 min', tag: 'Ritmo cardíaco', tagBg: colors.surfacePurpleSoft, tagColor: '#4C3D78' },
  { title: 'Noche sin Sobrepensamiento', desc: 'Lofi sutil & white noise • 45 min', tag: 'Descanso mental', tagBg: '#FFD9DD', tagColor: '#623C42' },
];

export default function SpotifyPlaylistsScreen({ navigation }: any) {
  const { accessToken } = useAuth();
  const [tab, setTab] = useState<Tab>('Tus Playlists');
  const [status, setStatus] = useState<SpotifyStatus>({ connected: false });
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [shows, setShows] = useState<SpotifyShow[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [loadingShows, setLoadingShows] = useState(true);

  const loadAll = useCallback(async () => {
    if (!accessToken) return;
    try {
      const st = await spotifyService.getStatus(accessToken);
      setStatus(st);
      if (!st.connected) {
        setLoadingPlaylists(false);
        setLoadingShows(false);
        return;
      }
    } catch (err) {
      console.log('[Spotify] error consultando estado', err);
    }

    spotifyService
      .getPlaylists(accessToken)
      .then(setPlaylists)
      .catch((err) => console.log('[Spotify] error playlists', err))
      .finally(() => setLoadingPlaylists(false));

    spotifyService
      .getSavedShows(accessToken)
      .then(setShows)
      .catch((err) => console.log('[Spotify] error shows', err))
      .finally(() => setLoadingShows(false));
  }, [accessToken]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onTabPress = (t: Tab) => setTab(t);

  return (
    <View style={styles.screen}>
      <AppHeader onOpenMenu={() => navigation?.openDrawer?.()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.accountBar}>
          <View style={styles.accountLeft}>
            <View style={styles.accountIcon}>
              <Icon name="music" size={14} color={colors.textGreen} />
            </View>
            <View>
              <Text style={styles.accountName}>
                {status.connected ? status.displayName ?? 'Cuenta de Spotify' : 'Spotify no conectado'}
              </Text>
              <Text style={styles.accountStatus}>
                {status.connected ? 'Conectado' : 'Conecta tu cuenta para ver tu música real'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => navigation?.navigate?.('SpotifyConnect')}
          >
            <Text style={styles.manageText}>{status.connected ? 'Gestionar' : 'Conectar'}</Text>
            <Icon name="chevron-down" size={12} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
          {TABS.map((t) => {
            const active = t === tab;
            return (
              <TouchableOpacity key={t} style={[styles.tab, active && styles.tabActive]} onPress={() => onTabPress(t)}>
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {tab === 'Para tu estado actual' && (
          <>
            <View style={styles.diagnosisCard}>
              <View style={styles.diagnosisHeader}>
                <View style={styles.diagnosisIcon}>
                  <Icon name="activity" size={18} color={colors.surface} />
                </View>
                <View style={styles.diagnosisTextWrap}>
                  <View style={styles.diagnosisLabelRow}>
                    <Text style={styles.diagnosisLabel}>DIAGNÓSTICO EMOCIONAL RECIENTE</Text>
                    <View style={styles.diagnosisDot} />
                  </View>
                  <Text style={styles.diagnosisBody}>
                    Detectamos agobio y ritmo cardíaco elevado en tu última charla. Te sugerimos frecuencias de{' '}
                    <Text style={{ fontWeight: '600' }}>432 Hz</Text> y lluvia serena.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recomendadas para este momento</Text>
              <Text style={styles.sectionTag}>Terapia acústica</Text>
            </View>
            {RECOMMENDED.map((r) => (
              <View key={r.title} style={styles.recCard}>
                <View style={styles.recLeft}>
                  <View style={styles.recThumb}>
                    <Icon name="play" size={18} color={colors.surface} />
                  </View>
                  <View style={styles.recTextWrap}>
                    <Text style={styles.recTitle}>{r.title}</Text>
                    <Text style={styles.recDesc}>{r.desc}</Text>
                    <View style={[styles.recTag, { backgroundColor: r.tagBg }]}>
                      <Text style={[styles.recTagText, { color: r.tagColor }]}>{r.tag}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {tab === 'Tus Playlists' && (
          <>
            <Text style={[styles.sectionTitle, styles.playlistsTitle]}>Tus Playlists de Spotify</Text>
            <Text style={styles.sectionSubtitle}>
              {status.connected
                ? 'Directo de tu cuenta real de Spotify'
                : 'Conecta tu cuenta para ver tus playlists reales'}
            </Text>

            {!status.connected ? (
              <TouchableOpacity
                style={styles.connectPrompt}
                onPress={() => navigation?.navigate?.('SpotifyConnect')}
              >
                <Icon name="music" size={18} color={colors.primaryDark} />
                <Text style={styles.connectPromptText}>Conectar mi cuenta de Spotify</Text>
              </TouchableOpacity>
            ) : loadingPlaylists ? (
              <ActivityIndicator style={{ marginVertical: spacing.lg }} color={colors.primaryDark} />
            ) : playlists.length === 0 ? (
              <Text style={styles.emptyText}>No encontramos playlists en tu cuenta todavía.</Text>
            ) : (
              playlists.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.playlistCard}
                  onPress={() => p.externalUrl && Linking.openURL(p.externalUrl)}
                >
                  <View style={styles.playlistCover}>
                    {p.imageUrl ? (
                      <Image source={{ uri: p.imageUrl }} style={styles.playlistCoverImage} />
                    ) : null}
                    <View style={styles.playlistCoverOverlay}>
                      <View style={styles.playlistCoverBadge}>
                        <Text style={styles.playlistCoverBadgeText}>{p.owner ?? 'Spotify'}</Text>
                      </View>
                      <Text style={styles.playlistCoverCount}>{p.tracksTotal} canciones</Text>
                    </View>
                  </View>
                  <View style={styles.playlistFooter}>
                    <View style={styles.playlistTextWrap}>
                      <Text style={styles.playlistTitle}>{p.name}</Text>
                      {!!p.description && <Text style={styles.playlistDesc}>{p.description}</Text>}
                    </View>
                    <View style={styles.playButton}>
                      <Icon name="external-link" size={14} color={colors.surface} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        {tab === 'Podcasts' && (
          <>
            <Text style={[styles.sectionTitle, styles.playlistsTitle]}>Tus Podcasts guardados</Text>
            <Text style={styles.sectionSubtitle}>
              {status.connected
                ? 'Programas que sigues en tu cuenta real de Spotify'
                : 'Conecta tu cuenta para ver tus podcasts reales'}
            </Text>

            {!status.connected ? (
              <TouchableOpacity
                style={styles.connectPrompt}
                onPress={() => navigation?.navigate?.('SpotifyConnect')}
              >
                <Icon name="mic" size={18} color={colors.primaryDark} />
                <Text style={styles.connectPromptText}>Conectar mi cuenta de Spotify</Text>
              </TouchableOpacity>
            ) : loadingShows ? (
              <ActivityIndicator style={{ marginVertical: spacing.lg }} color={colors.primaryDark} />
            ) : shows.length === 0 ? (
              <Text style={styles.emptyText}>No tienes podcasts guardados todavía en Spotify.</Text>
            ) : (
              shows.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.recCard}
                  onPress={() => s.externalUrl && Linking.openURL(s.externalUrl)}
                >
                  <View style={styles.recLeft}>
                    {s.imageUrl ? (
                      <Image source={{ uri: s.imageUrl }} style={styles.showThumbImage} />
                    ) : (
                      <View style={styles.recThumb}>
                        <Icon name="mic" size={18} color={colors.surface} />
                      </View>
                    )}
                    <View style={styles.recTextWrap}>
                      <Text style={styles.recTitle}>{s.name}</Text>
                      <Text style={styles.recDesc}>
                        {s.publisher} • {s.totalEpisodes} episodios
                      </Text>
                    </View>
                  </View>
                  <Icon name="external-link" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        <View style={styles.privacyCard}>
          <View style={styles.privacyIcon}>
            <Icon name="lock" size={16} color={colors.textGreen} />
          </View>
          <View style={styles.privacyTextWrap}>
            <Text style={styles.privacyTitle}>Privacidad Acústica Garantizada</Text>
            <Text style={styles.privacyBody}>
              Tus hábitos de escucha nunca se comparten con terceros ni alimentan perfiles de publicidad.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
  accountBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: spacing.md, marginTop: spacing.sm, marginBottom: spacing.md },
  accountLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  accountIcon: { width: 28, height: 28, borderRadius: radii.pill, backgroundColor: colors.surfaceGreen, alignItems: 'center', justifyContent: 'center' },
  accountName: { ...typography.caption, color: colors.textPrimary },
  accountStatus: { ...typography.small, color: colors.textGreen },
  manageButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.disabled, borderRadius: radii.pill, height: 32, paddingHorizontal: spacing.md },
  manageText: { ...typography.caption, color: colors.textSecondary },
  tabsRow: { flexGrow: 0, marginBottom: spacing.lg },
  tab: { backgroundColor: colors.surfaceMuted, borderRadius: radii.pill, height: 40, paddingHorizontal: spacing.lg, justifyContent: 'center', marginRight: spacing.sm },
  tabActive: { backgroundColor: colors.primaryDark },
  tabText: { ...typography.label, color: colors.textSecondary },
  tabTextActive: { color: colors.surface },
  diagnosisCard: { backgroundColor: colors.primaryDark, borderRadius: radii.md, padding: spacing.lg, gap: spacing.sm, marginBottom: spacing.xl },
  diagnosisHeader: { flexDirection: 'row', gap: spacing.md },
  diagnosisIcon: { width: 40, height: 40, borderRadius: radii.pill, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  diagnosisTextWrap: { flex: 1 },
  diagnosisLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  diagnosisLabel: { ...typography.caption, color: colors.surfaceMuted, letterSpacing: 0.6 },
  diagnosisDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.surfaceGreen },
  diagnosisBody: { ...typography.body, color: colors.surface, marginTop: 4 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  sectionTitle: { ...typography.label, fontSize: 20, color: colors.textPrimary },
  sectionTag: { ...typography.caption, color: colors.textGreen, textAlign: 'right' },
  recCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md },
  recLeft: { flexDirection: 'row', gap: spacing.md, flex: 1 },
  recThumb: { width: 64, height: 64, borderRadius: radii.md, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  showThumbImage: { width: 64, height: 64, borderRadius: radii.md },
  recTextWrap: { flex: 1 },
  recTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  recDesc: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  recTag: { alignSelf: 'flex-start', borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 2, marginTop: spacing.xs },
  recTagText: { fontSize: 11, fontWeight: '600' },
  playlistsTitle: { marginTop: spacing.sm },
  sectionSubtitle: { ...typography.small, color: colors.textSecondary, marginBottom: spacing.md },
  connectPrompt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: spacing.lg, marginBottom: spacing.lg },
  connectPromptText: { ...typography.label, color: colors.primaryDark },
  emptyText: { ...typography.small, color: colors.textSecondary, marginBottom: spacing.lg },
  playlistCard: { backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.lg, marginBottom: spacing.md },
  playlistCover: { height: 144, borderRadius: radii.md, backgroundColor: colors.surfaceLavender, justifyContent: 'flex-end', padding: spacing.md, marginBottom: spacing.md, overflow: 'hidden' },
  playlistCoverImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  playlistCoverOverlay: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  playlistCoverBadge: { backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  playlistCoverBadgeText: { ...typography.caption, color: colors.surface },
  playlistCoverCount: { ...typography.small, color: colors.surface },
  playlistFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  playlistTextWrap: { flex: 1, paddingRight: spacing.sm },
  playlistTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  playlistDesc: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  playButton: { width: 44, height: 44, borderRadius: radii.pill, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  privacyCard: { flexDirection: 'row', gap: spacing.md, backgroundColor: 'rgba(199,231,214,0.4)', borderRadius: radii.md, padding: spacing.lg, marginTop: spacing.sm },
  privacyIcon: { width: 36, height: 36, borderRadius: radii.pill, backgroundColor: colors.surfaceGreen, alignItems: 'center', justifyContent: 'center' },
  privacyTextWrap: { flex: 1 },
  privacyTitle: { ...typography.label, fontSize: 17, color: colors.textGreen },
  privacyBody: { ...typography.small, color: colors.textGreen },
});
