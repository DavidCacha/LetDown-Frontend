import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AppHeader from '../../components/AppHeader';
import Chip from '../../components/Chip';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, radii, spacing, typography } from '../../constants/theme';

const GOALS = [
  { key: 'vent', title: 'Desahogarme', desc: 'Expresar lo que siento libremente, sin filtros, consejos impositivos ni interrupciones.', icon: 'message-circle', bg: colors.surfacePurpleSoft },
  { key: 'anxiety', title: 'Ansiedad o pánico', desc: 'Regenerar la calma, anclar el cuerpo y disminuir los pensamientos acelerados.', icon: 'wind', bg: colors.surfaceGreen },
  { key: 'sadness', title: 'Tristeza o soledad', desc: 'Sentirme en compañía cálida, convalidar mi dolor y recibir palabras de consuelo genuino.', icon: 'cloud-rain', bg: '#FFD9DD' },
  { key: 'doubts', title: 'Dudas y sobrepensamiento', desc: 'Separar hechos de interpretaciones, ordenar el caos mental y ganar perspectiva suave.', icon: 'help-circle', bg: colors.surfaceLavender },
  { key: 'crisis', title: 'Contención urgente', desc: 'Protocolo de acompañamiento continuo, desescalamiento emocional y plan de seguridad activo.', icon: 'alert-triangle', bg: 'rgba(186,26,26,0.15)', priority: true },
];

const TONES = [
  { key: 'silent', title: 'Escucha silenciosa y empática', desc: 'Prioriza la validación pura, sin abrumar con muchas preguntas.', icon: 'ear' },
  { key: 'guided', title: 'Ejercicios guiados paso a paso', desc: 'Técnicas somáticas, 5-4-3-2-1 y anclaje físico guiado.', icon: 'list' },
  { key: 'reflective', title: 'Diálogo reflexivo', desc: 'Preguntas suaves y profundas para explorar lo que estás sintiendo.', icon: 'message-square' },
];

const ICEBREAKERS = [
  'No sé por dónde empezar, pero me siento desbordado/a.',
  'Necesito ayuda para respirar y calmarme ahora mismo.',
  'Algo dolió mucho hoy y necesito sacarlo sin que me juzguen.',
];

export default function NewChatScreen({ navigation }: any) {
  const [goal, setGoal] = useState('vent');
  const [tone, setTone] = useState('silent');
  const [note, setNote] = useState('');

  const handleStart = () => {
    navigation?.navigate?.('Chat', {
      objectiveKey: goal,
      toneKey: tone,
      icebreaker: note.trim() ? note.trim() : undefined,
    });
  };

  return (
    <View style={styles.screen}>
      <AppHeader onOpenMenu={() => navigation?.openDrawer?.()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>NUEVO ESPACIO DE ESCUCHA</Text>
        <Text style={styles.title}>Iniciar conversación</Text>
        <Text style={styles.sectionTitle}>1. Elige el objetivo de esta sesión</Text>
        <Text style={styles.sectionSubtitle}>¿En qué te gustaría que nos enfoquemos hoy?</Text>
        {GOALS.map((g) => {
          const selected = goal === g.key;
          return (
            <TouchableOpacity
              key={g.key}
              style={[styles.optionCard, g.priority && styles.optionCardPriority]}
              onPress={() => setGoal(g.key)}
            >
              <View style={[styles.optionIcon, { backgroundColor: g.bg }]}>
                <Icon name={g.icon} size={19} color={colors.primaryDark} />
              </View>
              <View style={styles.optionTextWrap}>
                <View style={styles.optionTitleRow}>
                  <Text style={styles.optionTitle}>{g.title}</Text>
                  {g.priority ? (
                    <View style={styles.priorityTag}>
                      <Text style={styles.priorityTagText}>Prioridad</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.optionDesc}>{g.desc}</Text>
              </View>
              <Icon name={selected ? 'check-circle' : 'circle'} size={17} color={selected ? colors.primaryDark : colors.textSecondary50 as string} />
            </TouchableOpacity>
          );
        })}

        <Text style={[styles.sectionTitle, styles.sectionSpacing]}>2. Tono y ritmo de respuesta</Text>
        <Text style={styles.sectionSubtitle}>¿Cómo prefieres que interactúe la IA contigo?</Text>
        {TONES.map((t) => {
          const selected = tone === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.toneCard, selected && styles.toneCardSelected]}
              onPress={() => setTone(t.key)}
            >
              <View style={styles.toneLeft}>
                <Icon name={t.icon} size={18} color={colors.textPrimary} />
                <View>
                  <Text style={styles.toneTitle}>{t.title}</Text>
                  <Text style={styles.toneDesc}>{t.desc}</Text>
                </View>
              </View>
              <Icon   style={styles.selectIcon} name={selected ? 'check-circle' : 'circle'} size={17} color={selected ? colors.primaryDark : colors.textSecondary50 as string} />
            </TouchableOpacity>
          );
        })}

        <Text style={[styles.sectionTitle, styles.sectionSpacing]}>3. Romper el hielo (opcional)</Text>
        <Text style={styles.sectionSubtitle}>Toca un mensaje inicial o escribe el tuyo abajo.</Text>
        {ICEBREAKERS.map((line) => (
          <TouchableOpacity key={line} style={styles.icebreaker} onPress={() => setNote(line)}>
            <Text style={styles.icebreakerText}>«{line}»</Text>
            <Icon name="arrow-up-right" size={13} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}

        <View style={styles.customNoteCard}>
          <Text style={styles.customNoteLabel}>O escribe cómo te sientes en tus palabras:</Text>
          <TextInput
            style={styles.customNoteInput}
            placeholder={"Por ejemplo: 'Tengo un nudo en el pecho y no puedo concentrarme...'"}
            placeholderTextColor={colors.textSecondary50}
            value={note}
            onChangeText={setNote}
            multiline
          />
        </View>

        <PrimaryButton
          label="Comenzar conversación"
          icon="zap"
          style={styles.startButton}
          onPress={handleStart}
        />
        <View style={styles.footnoteRow}>
          <Icon name="info" size={13} color={colors.textSecondary} />
          <Text style={styles.footnoteText}>
            Puedes pausar, borrar todo el historial o salir en cualquier momento con un solo toque.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  selectIcon: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
  iconButton: { width: 44, height: 44, borderRadius: radii.pill, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { ...typography.label, color: colors.primaryDark, letterSpacing: 0.35 },
  title: { ...typography.h1, color: colors.textPrimary, marginTop: 4 },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
  crisisBox: { backgroundColor: '#FFDAD6', borderRadius: radii.md, padding: spacing.lg, gap: spacing.sm, marginBottom: spacing.lg },
  crisisRow: { flexDirection: 'row', gap: spacing.sm },
  crisisTextWrap: { flex: 1 },
  crisisTitle: { ...typography.label, fontSize: 17, color: '#93000A' },
  crisisBody: { ...typography.small, color: '#93000A', marginTop: 2 },
  crisisActions: { flexDirection: 'row', gap: spacing.sm },
  crisisCallButton: { flex: 1, height: 44 },
  crisisNetworkButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface, height: 44, paddingHorizontal: spacing.md, borderRadius: radii.pill },
  crisisNetworkText: { ...typography.label, color: '#93000A' },
  presenceCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.lg, marginBottom: spacing.xl },
  presenceIcon: { width: 64, height: 64, borderRadius: radii.md, backgroundColor: colors.surfaceLavender, alignItems: 'center', justifyContent: 'center' },
  presenceTextWrap: { flex: 1 },
  presenceLabel: { ...typography.caption, color: colors.primaryDark, letterSpacing: 0.6 },
  presenceBody: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  sectionSubtitle: { ...typography.small, color: colors.textSecondary, marginBottom: spacing.md },
  sectionSpacing: { marginTop: spacing.xl },
  optionCard: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.lg, marginBottom: spacing.sm, alignItems: 'center' },
  optionCardPriority: { backgroundColor: 'rgba(238,185,191,0.2)' },
  optionIcon: { width: 44, height: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  optionTextWrap: { flex: 1 },
  optionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  optionTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  optionDesc: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  priorityTag: { backgroundColor: '#BA1A1A', borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  priorityTagText: { ...typography.caption, color: colors.surface },
  toneCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.lg, marginBottom: spacing.sm },
  toneCardSelected: { backgroundColor: colors.surfaceLavender },
  toneLeft: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', flex: 1 },
  toneTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  toneDesc: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  icebreaker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm },
  icebreakerText: { ...typography.small, color: colors.textSecondary, flex: 1, marginRight: spacing.sm },
  customNoteCard: { backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.lg, marginTop: spacing.sm, marginBottom: spacing.xl, gap: spacing.sm },
  customNoteLabel: { ...typography.caption, color: colors.textSecondary },
  customNoteInput: { backgroundColor: colors.inputBg, borderRadius: radii.md, padding: spacing.md, minHeight: 80, fontSize: 15, color: colors.textPrimary, textAlignVertical: 'top' },
  startButton: { marginBottom: spacing.sm },
  footnoteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  footnoteText: { ...typography.small, color: colors.textSecondary, textAlign: 'center', flexShrink: 1 },
});
