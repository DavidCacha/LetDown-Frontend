import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AppHeader from '../../components/AppHeader';
import Chip from '../../components/Chip';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, radii, spacing, typography } from '../../constants/theme';

const DISTANCES = ['< 2 km', '5 km', '10 km'];
const FILTERS = ['Abierto ahora 24h', 'Atención gratuita', 'Urgencias psiquiátricas'];

const CENTERS = [
  {
    name: 'Centro de Salud Mental Comunitario Norte',
    tags: ['850 m · 11 min a pie', 'Abierto 24/7', '100% Gratuito'],
    desc: 'Guardia de crisis activa con psicólogos y psiquiatras residentes.',
    note: 'Camas de estabilización y protocolo de desescalada suave sin internación involuntaria',
    icon: 'activity',
    iconBg: colors.surfacePurpleSoft,
    action: 'Cómo llegar (11 min)',
  },
  {
    name: 'Hospital General de Urgencias San Lucas',
    tags: ['1.8 km', 'Abierto 24h', 'Nivel Hospitalario'],
    desc: 'Urgencias psiquiátricas especializadas, farmacología de rescate y triage médico integral.',
    icon: 'plus-square',
    iconBg: colors.surfaceMuted,
    action: 'Ruta vehículo (4 min)',
  },
  {
    name: 'Estación de Seguridad y Punto Púrpura',
    tags: ['400 m · 5 min a pie', 'Punto Seguro 24h'],
    desc: 'Asistencia inmediata ante peligro físico, agresión, pánico extremo o desorientación.',
    icon: 'shield',
    iconBg: colors.surfaceGreen,
    action: 'Caminar ahora (5 min)',
  },
  {
    name: 'Espacio de Escucha y Acompañamiento Joven',
    tags: ['2.3 km', 'Hoy de 8:00 a 20:00', 'Gratis'],
    desc: 'Atención especializada en crisis de ansiedad, angustia vital y aislamiento social.',
    icon: 'users',
    iconBg: colors.surfaceMuted,
    action: 'Reservar hora',
  },
];

export default function NearbyHelpScreen({ navigation }: any) {
  const [distance, setDistance] = useState(DISTANCES[0]);

  return (
    <View style={styles.screen}>
      <AppHeader onOpenMenu={() => navigation?.openDrawer?.()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <Chip icon="lock" label="Ubicación cifrada · Confidencial" tone="green" />
          <TouchableOpacity style={styles.quickExit}>
            <Icon name="log-out" size={12} color={colors.textSecondary} />
            <Text style={styles.quickExitText}>Salida Rápida</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.lifelineBar}>
          <View style={styles.lifelineLeft}>
            <View style={styles.lifelineIcon}>
              <Icon name="phone" size={19} color={colors.surface} />
            </View>
            <View>
              <Text style={styles.lifelineTitle}>Línea Nacional 988</Text>
              <Text style={styles.lifelineDesc}>Si estás en peligro inminente, llama ya.</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.lifelineButton} onPress={() => Linking.openURL('tel:988')}>
            <Text style={styles.lifelineButtonText}>Llamar Gratis</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Ayuda cercana y centros de atención inmediata</Text>
        <Text style={styles.subtitle}>
          Espacios físicos verificados para recibir acompañamiento, refugio o atención de urgencia.
        </Text>

        <View style={styles.mapPlaceholder}>
          <Icon name="map" size={26} color={colors.primaryDark} />
          <View style={styles.mapFooter}>
            <View style={styles.mapFooterChip}>
              <Icon name="map-pin" size={13} color={colors.textPrimary} />
              <Text style={styles.mapFooterChipText}>4 centros a tu alrededor</Text>
            </View>
            <TouchableOpacity style={styles.mapFooterButton}>
              <Icon name="maximize-2" size={12} color={colors.surface} />
              <Text style={styles.mapFooterButtonText}>Ver mapa completo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.filterLabel}>RADIO DE DISTANCIA</Text>
        <View style={styles.chipsRow}>
          {DISTANCES.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.distanceChip, distance === d && styles.distanceChipActive]}
              onPress={() => setDistance(d)}
            >
              <Text style={[styles.distanceChipText, distance === d && styles.distanceChipTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.filterLabel, styles.filterLabelSpacing]}>FILTROS DE URGENCIA</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRowScroll}>
          {FILTERS.map((f) => (
            <TouchableOpacity key={f} style={styles.filterPill}>
              <Text style={styles.filterPillText}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.routeCard}>
          <View style={styles.routeHeader}>
            <View style={styles.routeIcon}>
              <Icon name="navigation" size={18} color={colors.textGreen} />
            </View>
            <View style={styles.routeTextWrap}>
              <View style={styles.routeTitleRow}>
                <Text style={styles.routeTitle}>Ruta Segura Guiada</Text>
                <View style={styles.routeBadge}>
                  <Text style={styles.routeBadgeText}>Activo</Text>
                </View>
              </View>
              <Text style={styles.routeDesc}>
                Calculamos senderos prioritarios con iluminación vial continua, patrullaje y comercio abierto.
              </Text>
            </View>
          </View>
          <View style={styles.routeStatsRow}>
            <View style={styles.routeStatsLeft}>
              <Icon name="sun" size={16} color={colors.textPrimary} />
              <Text style={styles.routeStatsText}>98% Iluminado y vigilado</Text>
            </View>
            <Text style={styles.routeStatsRight}>Trazado adaptativo</Text>
          </View>
          <PrimaryButton label="Iniciar navegación protegida" icon="compass" variant="primary" style={{ backgroundColor: colors.textGreen }} />
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Centros disponibles ordenados por cercanía</Text>
          <Text style={styles.listGps}>GPS Activo</Text>
        </View>

        {CENTERS.map((c) => (
          <View key={c.name} style={styles.centerCard}>
            <View style={styles.centerHeader}>
              <View style={styles.centerTextWrap}>
                <View style={styles.centerTagsRow}>
                  {c.tags.map((t) => (
                    <View key={t} style={styles.centerTag}>
                      <Text style={styles.centerTagText}>{t}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.centerName}>{c.name}</Text>
                <Text style={styles.centerDesc}>{c.desc}</Text>
              </View>
              <View style={[styles.centerIcon, { backgroundColor: c.iconBg }]}>
                <Icon name={c.icon} size={18} color={colors.primaryDark} />
              </View>
            </View>
            {c.note ? (
              <View style={styles.centerNoteBox}>
                <Icon name="info" size={14} color={colors.textSecondary} />
                <Text style={styles.centerNoteText}>{c.note}</Text>
              </View>
            ) : null}
            <View style={styles.centerActions}>
              <TouchableOpacity style={styles.centerCallButton} onPress={() => Linking.openURL('tel:988')}>
                <Icon name="phone" size={14} color={colors.primaryDark} />
                <Text style={styles.centerCallText}>Llamar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.centerRouteButton}>
                <Icon name="navigation" size={13} color={colors.surface} />
                <Text style={styles.centerRouteText}>{c.action}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.trustCard}>
          <Icon name="check-circle" size={20} color={colors.textPrimary} />
          <View style={styles.trustTextWrap}>
            <Text style={styles.trustTitle}>Red Auditada de Salud y Contención</Text>
            <Text style={styles.trustBody}>
              Todos los centros listados han sido validados por redes oficiales de salud y contención emocional. Tu
              geolocalización solo se procesa de manera efímera en tu dispositivo y nunca se asocia a tu historial o
              nombre.
            </Text>
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
  quickExit: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceLavender, borderRadius: radii.pill, height: 32, paddingHorizontal: spacing.md },
  quickExitText: { ...typography.caption, color: colors.textSecondary },
  lifelineBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFDAD6', borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.lg },
  lifelineLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  lifelineIcon: { width: 48, height: 48, borderRadius: radii.md, backgroundColor: '#BA1A1A', alignItems: 'center', justifyContent: 'center' },
  lifelineTitle: { ...typography.label, fontSize: 17, fontWeight: '700', color: '#93000A' },
  lifelineDesc: { ...typography.small, color: '#93000A' },
  lifelineButton: { backgroundColor: '#BA1A1A', borderRadius: radii.pill, height: 44, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  lifelineButtonText: { ...typography.label, color: colors.surface, fontWeight: '700' },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  mapPlaceholder: { height: 176, borderRadius: radii.lg, backgroundColor: colors.surfaceLavender, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg, padding: spacing.md },
  mapFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: spacing.md },
  mapFooterChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: 6 },
  mapFooterChipText: { ...typography.caption, color: colors.textPrimary },
  mapFooterButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primaryDark, borderRadius: radii.pill, height: 36, paddingHorizontal: spacing.md },
  mapFooterButtonText: { ...typography.caption, color: colors.surface },
  filterLabel: { ...typography.caption, color: colors.textSecondary, letterSpacing: 0.6, marginBottom: spacing.sm },
  filterLabelSpacing: { marginTop: spacing.md },
  chipsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  distanceChip: { backgroundColor: colors.surfaceMuted, borderRadius: radii.pill, height: 40, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  distanceChipActive: { backgroundColor: colors.primaryDark },
  distanceChipText: { ...typography.label, color: colors.textSecondary },
  distanceChipTextActive: { color: colors.surface },
  chipsRowScroll: { flexGrow: 0, marginBottom: spacing.xl },
  filterPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surfaceMuted, borderRadius: radii.pill, height: 36, paddingHorizontal: spacing.md, marginRight: spacing.sm },
  filterPillText: { ...typography.caption, color: colors.textSecondary },
  routeCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.md, marginBottom: spacing.xl },
  routeHeader: { flexDirection: 'row', gap: spacing.md },
  routeIcon: { width: 40, height: 40, borderRadius: radii.md, backgroundColor: colors.surfaceGreen, alignItems: 'center', justifyContent: 'center' },
  routeTextWrap: { flex: 1 },
  routeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  routeTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  routeBadge: { backgroundColor: colors.surfaceGreen, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  routeBadgeText: { fontSize: 11, fontWeight: '700', color: '#032016' },
  routeDesc: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  routeStatsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: spacing.md },
  routeStatsLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  routeStatsText: { ...typography.label, color: colors.textPrimary },
  routeStatsRight: { ...typography.label, color: colors.textGreen },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  listTitle: { ...typography.caption, fontWeight: '700', color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  listGps: { ...typography.caption, color: colors.primaryDark },
  centerCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.md, gap: spacing.md },
  centerHeader: { flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between' },
  centerTextWrap: { flex: 1 },
  centerTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.xs },
  centerTag: { backgroundColor: colors.surfaceMuted, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  centerTagText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  centerName: { ...typography.label, fontSize: 20, color: colors.textPrimary },
  centerDesc: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  centerIcon: { width: 40, height: 40, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  centerNoteBox: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: spacing.md },
  centerNoteText: { ...typography.small, color: colors.textSecondary, flex: 1 },
  centerActions: { flexDirection: 'row', gap: spacing.sm },
  centerCallButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.surfaceMuted, borderRadius: radii.pill, height: 44 },
  centerCallText: { ...typography.label, color: colors.primaryDark },
  centerRouteButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.primaryDark, borderRadius: radii.pill, height: 44 },
  centerRouteText: { ...typography.label, color: colors.surface },
  trustCard: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surfaceMuted, borderRadius: radii.lg, padding: spacing.lg, marginTop: spacing.sm },
  trustTextWrap: { flex: 1 },
  trustTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  trustBody: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
});
