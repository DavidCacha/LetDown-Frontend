import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AppHeader from '../../components/AppHeader';
import BottomNav from '../../components/BottomNav';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, radii, spacing, typography } from '../../constants/theme';

const MOODS = [
  { key: 'calm', label: 'En calma', icon: 'sun' },
  { key: 'anxious', label: 'Con ansiedad', icon: 'wind' },
  { key: 'overwhelmed', label: 'Abrumada', icon: 'cloud-rain' },
  { key: 'sad', label: 'Triste', icon: 'cloud' },
  { key: 'hopeful', label: 'Esperanzada', icon: 'sunrise' },
];

const WEEK = [
  { day: 'L', height: 32, color: colors.surfaceGreen },
  { day: 'M', height: 48, color: colors.surfaceGreen },
  { day: 'X', height: 40, color: colors.surfacePurpleSoft },
  { day: 'J', height: 56, color: colors.textGreen, active: true },
  { day: 'V', height: 16, color: colors.surfaceLavender },
  { day: 'S', height: 16, color: colors.surfaceLavender },
  { day: 'D', height: 16, color: colors.surfaceLavender },
];

const QUICK_ACCESS = [
  { key: 'Chat', title: 'Chat con IA', desc: 'Escucha activa y desahogo empático', icon: 'message-circle', bg: colors.surfacePurpleSoft, tag: 'Detección activa', tagIcon: 'check' },
  { key: 'Spotify', title: 'Spotify Calma', desc: 'Frecuencias 432Hz y meditación guiada', icon: 'music', bg: colors.surfaceGreen, tag: 'Playlist sincro', tagIcon: 'link' },
  { key: 'Location', title: 'Ubicación Segura', desc: 'Espacios protegidos y hospitales amigos', icon: 'map-pin', bg: colors.surfaceLavender, tag: '3 centros libres', tagIcon: 'map' },
  { key: 'Contacts', title: 'Red de Apoyo', desc: 'Contacto con un toque a tus seres elegidos', icon: 'users', bg: '#FFD9DD', tag: '2 listos', tagIcon: 'user-check' },
];

const RECOMMENDATIONS = [
  { title: 'Técnica 4-7-8 para calmar el cuerpo', desc: 'Disminuye la frecuencia cardíaca al instante.', tag: 'EJERCICIO SOMÁTICO • 3 min', icon: 'wind', bg: colors.surfaceGreen, action: 'Iniciar ahora' },
  { title: 'Espacio sin juicios', desc: 'Voz compasiva y texturas sonoras…', tag: 'CÁPSULA DE AUDIO • 8 min', icon: 'headphones', bg: colors.surfacePurpleSoft, action: 'Escuchar cápsula' },
  { title: 'Escribe lo que sientes', desc: 'Modo desvanecer activable: tus palabras no se guardan.', tag: 'ESCRITURA SEGURA • Libre', icon: 'edit-3', bg: '#FFD9DD', action: 'Abrir hoja en blanco' },
];

export default function DashboardScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState('Home');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  return (
    <View style={styles.screen}>
      <AppHeader onOpenMenu={() => navigation?.openDrawer?.()} />
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.crisisBanner}>
          <View style={styles.crisisIcon}>
            <Icon name="alert-circle" size={17} color={colors.surface} />
          </View>
          <View style={styles.crisisTextWrap}>
            <Text style={styles.crisisLabel}>ESPACIO SEGURO ACTIVO</Text>
            <Text style={styles.crisisTitle}>¿Sientes que es demasiado hoy?</Text>
            <Text style={styles.crisisBody}>
              Estamos aquí para acompañarte sin juicios, paso a paso.
            </Text>
            <View style={styles.crisisActions}>
              <TouchableOpacity style={styles.crisisPrimary} onPress={() => Linking.openURL('tel:988')}>
                <Icon name="phone" size={14} color={colors.surface} />
                <Text style={styles.crisisPrimaryText}>Hablar con alguien</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.crisisSecondary}>
                <Icon name="wind" size={14} color={colors.textPrimary} />
                <Text style={styles.crisisSecondaryText}>Respirar (4-7-8)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.greeting}>Hola, Mar ●</Text>
          <Text style={styles.question}>¿Cómo te sientes en este instante?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodRow}>
            {MOODS.map((mood) => {
              const isActive = selectedMood === mood.key;
              return (
                <TouchableOpacity
                  key={mood.key}
                  style={[styles.moodPill, isActive && styles.moodPillActive]}
                  onPress={() => setSelectedMood(mood.key)}
                >
                  <Icon name={mood.icon} size={15} color={colors.textPrimary} />
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.streakCard}>
            <View style={styles.streakHeader}>
              <View>
                <Text style={styles.streakLabel}>SEMANA CONSCIENTE</Text>
                <Text style={styles.streakTitle}>4 días registrando tu calma</Text>
              </View>
              <View style={styles.streakBadge}>
                <Icon name="award" size={11} color={colors.textGreen} />
                <Text style={styles.streakBadgeText}>Constancia</Text>
              </View>
            </View>
            <View style={styles.weekChart}>
              {WEEK.map((d) => (
                <View key={d.day} style={styles.weekBarWrap}>
                  <View style={[styles.weekBar, { height: d.height, backgroundColor: d.color }]}>
                    {d.active ? <View style={styles.weekDot} /> : null}
                  </View>
                  <Text style={styles.weekDay}>{d.day}</Text>
                </View>
              ))}
            </View>
            <View style={styles.quoteBox}>
              <Icon name="feather" size={12} color={colors.textSecondary} />
              <Text style={styles.quoteText}>
                "No tienes que resolver todo hoy. Respirar ya es suficiente."
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
            <Text style={styles.sectionSubtitle}>Tu red disponible 24/7</Text>
          </View>
          <View style={styles.quickGrid}>
            {QUICK_ACCESS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.quickCard}
                onPress={() => navigation?.navigate?.(item.key)}
              >
                <View style={[styles.quickIcon, { backgroundColor: item.bg }]}>
                  <Icon name={item.icon} size={18} color={colors.primaryDark} />
                </View>
                <Text style={styles.quickTitle}>{item.title}</Text>
                <Text style={styles.quickDesc}>{item.desc}</Text>
                <View style={styles.quickTagRow}>
                  <Icon name={item.tagIcon} size={11} color={colors.textGreen} />
                  <Text style={styles.quickTag}>{item.tag}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cuidado Consciente Hoy</Text>
            <Text style={styles.sectionSubtitle}>Personalizado</Text>
          </View>
          {RECOMMENDATIONS.map((rec) => (
            <TouchableOpacity key={rec.title} style={styles.recCard}>
              <View style={[styles.recIcon, { backgroundColor: rec.bg }]}>
                <Icon name={rec.icon} size={20} color={colors.primaryDark} />
              </View>
              <View style={styles.recTextWrap}>
                <Text style={styles.recTag}>{rec.tag}</Text>
                <Text style={styles.recTitle}>{rec.title}</Text>
                <Text style={styles.recDesc}>{rec.desc}</Text>
                <Text style={styles.recAction}>{rec.action} →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.privacyFooter}>
          <View style={styles.privacyIcon}>
            <Icon name="lock" size={16} color={colors.textGreen} />
          </View>
          <View style={styles.privacyTextWrap}>
            <Text style={styles.privacyTitle}>Tu privacidad es sagrada</Text>
            <Text style={styles.privacyBody}>
              Tus registros están 100% cifrados. No almacenamos conversaciones en modo discreto ni
              compartimos tus datos jamás.
            </Text>
          </View>
        </View>
      </ScrollView>
      <BottomNav
        active={activeTab}
        onPress={(key) => {
          setActiveTab(key);
          navigation?.navigate?.(key);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xl },
  crisisBanner: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: '#FFDAD6',
    borderRadius: radii.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  crisisIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: '#BA1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crisisTextWrap: { flex: 1 },
  crisisLabel: { ...typography.caption, color: '#BA1A1A', letterSpacing: 0.6 },
  crisisTitle: { ...typography.label, fontSize: 17, color: '#93000A', marginTop: 2 },
  crisisBody: { ...typography.small, color: 'rgba(147,0,10,0.8)', marginTop: 2 },
  crisisActions: { gap: spacing.xs, marginTop: spacing.sm },
  crisisPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: '#BA1A1A',
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-start',
  },
  crisisPrimaryText: { ...typography.label, color: colors.surface },
  crisisSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-start',
  },
  crisisSecondaryText: { ...typography.label, color: colors.textPrimary },
  section: { gap: spacing.md },
  greeting: { ...typography.body, color: colors.textSecondary },
  question: { ...typography.h1, color: colors.textPrimary, marginTop: -4 },
  moodRow: { flexGrow: 0 },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceLavender,
    borderRadius: radii.pill,
    height: 40,
    paddingHorizontal: spacing.lg,
    marginRight: spacing.sm,
  },
  moodPillActive: { backgroundColor: colors.primary },
  moodLabel: { ...typography.label, color: colors.textPrimary },
  streakCard: { backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.lg, gap: spacing.md },
  streakHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  streakLabel: { ...typography.caption, color: colors.textGreen, letterSpacing: 0.3 },
  streakTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary, marginTop: 2 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceGreen, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: 4 },
  streakBadgeText: { ...typography.caption, color: colors.textGreen },
  weekChart: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs },
  weekBarWrap: { flex: 1, alignItems: 'center', gap: spacing.xs },
  weekBar: { width: '100%', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  weekDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.surface },
  weekDay: { ...typography.caption, color: colors.textSecondary },
  quoteBox: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.surfaceMuted, borderRadius: 8, padding: spacing.sm },
  quoteText: { ...typography.small, color: colors.textSecondary, fontStyle: 'italic', flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  sectionTitle: { ...typography.label, fontSize: 20, color: colors.textPrimary },
  sectionSubtitle: { ...typography.caption, color: colors.textGreen },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  quickCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  quickIcon: { width: 40, height: 40, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  quickTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  quickDesc: { ...typography.small, color: colors.textSecondary },
  quickTagRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  quickTag: { ...typography.caption, color: colors.textGreen },
  recCard: { flexDirection: 'row', gap: spacing.lg, backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.lg, marginBottom: spacing.sm },
  recIcon: { width: 64, height: 64, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  recTextWrap: { flex: 1 },
  recTag: { ...typography.caption, color: colors.textGreen, letterSpacing: 0.24 },
  recTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary, marginTop: 2 },
  recDesc: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  recAction: { ...typography.label, color: colors.primaryDark, marginTop: spacing.xs },
  privacyFooter: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: spacing.lg },
  privacyIcon: { width: 36, height: 36, borderRadius: radii.pill, backgroundColor: colors.surfaceGreen, alignItems: 'center', justifyContent: 'center' },
  privacyTextWrap: { flex: 1 },
  privacyTitle: { ...typography.caption, color: colors.textPrimary, fontWeight: '600' },
  privacyBody: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
});
