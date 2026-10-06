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
import { spotifyService, SpotifyStatus, SpotifyTrack } from '../../services/spotify';

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function SpotifyFavoritesScreen({ navigation }: any) {
  const { accessToken } = useAuth();
  const [status, setStatus] = useState<SpotifyStatus>({ connected: false });
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!accessToken) return;
    try {
      const st = await spotifyService.getStatus(accessToken);
      setStatus(st);
      if (!st.connected) {
        setLoading(false);
        return;
      }
      const result = await spotifyService.getSavedTracks(accessToken);
      setTracks(result);
    } catch (err) {
      console.log('[Spotify] error cargando favoritos', err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.screen}>
      <AppHeader onOpenMenu={() => navigation?.openDrawer?.()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusRow}>
          <View style={styles.statusChip}>
            <Icon
              name={status.connected ? 'check-circle' : 'alert-circle'}
              size={13}
              color={status.connected ? colors.textGreen : colors.textSecondary}
            />
            <Text style={styles.statusChipText}>
              {status.connected ? 'Spotify Conectado · Privado' : 'Spotify no conectado'}
            </Text>
          </View>
        </View>

        <View style={styles.headerCard}>
          <View style={styles.headerThumb}>
            <Icon name="music" size={22} color={colors.primaryDark} />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerEyebrow}>REFUGIO ACÚSTICO</Text>
            <Text style={styles.headerTitle}>Música que sana</Text>
            <Text style={styles.headerSubtitle}>Tus canciones guardadas, directo de tu cuenta de Spotify</Text>
          </View>
        </View>

        {!status.connected ? (
          <TouchableOpacity
            style={styles.connectPrompt}
            onPress={() => navigation?.navigate?.('SpotifyConnect')}
          >
            <Icon name="music" size={18} color={colors.primaryDark} />
            <Text style={styles.connectPromptText}>Conectar mi cuenta de Spotify</Text>
          </TouchableOpacity>
        ) : loading ? (
          <ActivityIndicator style={{ marginVertical: spacing.lg }} color={colors.primaryDark} />
        ) : tracks.length === 0 ? (
          <Text style={styles.emptyText}>Todavía no tienes canciones guardadas en Spotify.</Text>
        ) : (
          <>
            <View style={styles.tracksHeader}>
              <Text style={styles.tracksTitle}>Pistas Guardadas</Text>
              <Text style={styles.tracksSubtitle}>{tracks.length} canciones</Text>
            </View>

            {tracks.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={styles.trackCard}
                onPress={() => t.externalUrl && Linking.openURL(t.externalUrl)}
              >
                <View style={styles.trackRow}>
                  {t.albumImageUrl ? (
                    <Image source={{ uri: t.albumImageUrl }} style={styles.trackThumbImage} />
                  ) : (
                    <View style={styles.trackThumb}>
                      <Icon name="play" size={16} color={colors.surface} />
                    </View>
                  )}
                  <View style={styles.trackTextWrap}>
                    <View style={styles.trackTitleRow}>
                      <Text style={styles.trackTitle}>{t.name}</Text>
                      <Text style={styles.trackTime}>{formatDuration(t.durationMs)}</Text>
                    </View>
                    <Text style={styles.trackArtist}>{t.artist}</Text>
                  </View>
                  <Icon name="external-link" size={16} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceGreen, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: 4 },
  statusChipText: { ...typography.caption, color: colors.textGreen },
  headerCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, backgroundColor: colors.surfaceMuted, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.lg },
  headerThumb: { width: 56, height: 56, borderRadius: radii.md, backgroundColor: colors.surfaceLavender, alignItems: 'center', justifyContent: 'center' },
  headerTextWrap: { flex: 1 },
  headerEyebrow: { ...typography.caption, color: colors.primaryDark, letterSpacing: 0.6 },
  headerTitle: { ...typography.label, fontSize: 20, color: colors.textPrimary },
  headerSubtitle: { ...typography.small, color: colors.textSecondary },
  connectPrompt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: spacing.lg, marginBottom: spacing.lg },
  connectPromptText: { ...typography.label, color: colors.primaryDark },
  emptyText: { ...typography.small, color: colors.textSecondary, marginBottom: spacing.lg },
  tracksHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  tracksTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  tracksSubtitle: { ...typography.caption, color: colors.primaryDark },
  trackCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.md, gap: spacing.sm },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  trackThumb: { width: 48, height: 48, borderRadius: radii.md, backgroundColor: colors.surfaceLavender, alignItems: 'center', justifyContent: 'center' },
  trackThumbImage: { width: 48, height: 48, borderRadius: radii.md },
  trackTextWrap: { flex: 1 },
  trackTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trackTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  trackTime: { ...typography.caption, color: colors.textSecondary },
  trackArtist: { ...typography.small, color: colors.textSecondary },
});
