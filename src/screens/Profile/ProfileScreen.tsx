import React, { useState } from 'react';
import { Alert, Image, Linking, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AppHeader from '../../components/AppHeader';
import PrimaryButton from '../../components/PrimaryButton';
import Chip from '../../components/Chip';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { getDisplayName, isProfileEmpty } from '../../services/auth';

const sanctuaryLogo = require('../../assets/images/letdown_logo.png');

const MENU_ITEMS = [
  { key: 'personal-data', icon: 'user', label: 'Datos personales' },
  { key: 'edit-profile', icon: 'edit-2', label: 'Editar perfil' },
  { key: 'settings', icon: 'settings', label: 'Configuración' },
  { key: 'notifications', icon: 'bell', label: 'Notificaciones' },
  { key: 'logout', icon: 'log-out', label: 'Cerrar sesión', danger: true },
  { key: 'delete-account', icon: 'trash-2', label: 'Eliminar cuenta', danger: true },
];

function ToggleRow({ title, desc, value, onChange }: { title: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleTextWrap}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleDesc}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primaryDark, false: colors.disabled }}
        thumbColor={colors.surface}
      />
    </View>
  );
}

export default function ProfileScreen({ navigation }: any) {
  const { signOut, user } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const displayName = getDisplayName(user) || 'Usuario';
  const memberSince = (() => {
    const createdAt = user?.profile?.createdAt;
    if (!createdAt) return '';
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return '';
    const formatted = date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    return `Miembro desde ${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}`;
  })();

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);

      navigation?.navigate?.('Login');
    }
  };

  const confirmSignOut = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir de tu espacio seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: handleSignOut },
    ]);
  };

  const [pace, setPace] = useState<'Pausado' | 'Reflexivo' | 'Inmediato'>('Reflexivo');
  const [breathReminders, setBreathReminders] = useState(true);
  const [doNotDisturb, setDoNotDisturb] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);
  const [discreetMode, setDiscreetMode] = useState(true);
  const [biometric, setBiometric] = useState(true);
  const [lockTime, setLockTime] = useState<'Inmediato al salir' | 'Tras 1 minuto'>('Inmediato al salir');

  return (
    <View style={styles.screen}>
      <AppHeader onOpenMenu={() => navigation?.openDrawer?.()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.privacyBar}>
          <View style={styles.privacyBarLeft}>
            <Icon name="shield" size={17} color={colors.textGreen} />
            <Text style={styles.privacyBarText}>Tu refugio está cifrado bajo protocolo clínico</Text>
          </View>
          <TouchableOpacity style={styles.quickExit} onPress={confirmSignOut} disabled={signingOut}>
            <Icon name="log-out" size={12} color={colors.textGreen} />
            <Text style={styles.quickExitText}>{signingOut ? 'Saliendo...' : 'Cerrar sesión'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.identityCard}>
          <View style={styles.identityHeader}>
            <View style={styles.identityHeaderLeft}>
              <View style={styles.identityIcon}>
                <Icon name="user" size={16} color={colors.primaryDark} />
              </View>
              <View>
                <Text style={styles.identityTitle}>Datos personales</Text>
                <Text style={styles.identitySubtitle}>Identidad segura y confidencial</Text>
              </View>
            </View>
            <View style={styles.rbChip}>
              <Icon name="shield" size={12} color={colors.textGreen} />
              <Text style={styles.rbChipText}>RB-034</Text>
            </View>
          </View>

          <View style={styles.avatarRow}>
            <View>
              <Image source={sanctuaryLogo} style={styles.avatar} />
              <View style={styles.avatarBadge}>
                <Icon name="check" size={12} color={colors.surface} />
              </View>
            </View>
            <View style={styles.avatarTextWrap}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{displayName}</Text>
                <Icon name="edit-2" size={14} color={colors.textSecondary} />
              </View>
              <Text style={styles.email}>{user?.email}</Text>
              {memberSince ? <Text style={styles.memberSince}>{memberSince}</Text> : null}
            </View>
          </View>

          <PrimaryButton
            label="Editar perfil"
            icon="edit-2"
            variant="neutral"
            style={styles.editButton}
            onPress={() => navigation?.navigate?.('EditPersonalData')}
          />
          <Text style={styles.editHint}>Modifica tu seudónimo protector y claves de calma.</Text>
        </View>

        <View style={styles.menuCard}>
          <Text style={styles.menuLabel}>MENÚ DE CUENTA Y SEGURIDAD</Text>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.menuRow, i > 0 && styles.menuRowBorder]}
              disabled={item.key === 'logout' && signingOut}
              onPress={() => {
                if (item.key === 'logout') confirmSignOut();
                else if (item.key === 'personal-data') {
                  navigation?.navigate?.(isProfileEmpty(user) ? 'EditPersonalData' : 'PersonalData');
                } else if (item.key === 'edit-profile') navigation?.navigate?.('EditPersonalData');
              }}
            >
              <View style={styles.menuRowLeft}>
                <Icon name={item.icon} size={16} color={item.danger ? '#BA1A1A' : colors.textPrimary} />
                <Text style={[styles.menuRowText, item.danger && styles.menuRowTextDanger]}>
                  {item.key === 'logout' && signingOut ? 'Saliendo...' : item.label}
                </Text>
              </View>
              <Icon name="chevron-right" size={14} color={item.danger ? '#BA1A1A' : colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  privacyBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceGreen, borderRadius: radii.md, padding: spacing.lg, marginTop: spacing.sm },
  privacyBarLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  privacyBarText: { ...typography.caption, color: colors.textGreen, flex: 1 },
  quickExit: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface, borderRadius: radii.pill, paddingHorizontal: spacing.md, height: 36 },
  quickExitText: { ...typography.caption, color: colors.textGreen },
  identityCard: { backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.xl, gap: spacing.md },
  identityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  identityHeaderLeft: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  identityIcon: { width: 36, height: 36, borderRadius: radii.pill, backgroundColor: colors.surfacePurpleSoft, alignItems: 'center', justifyContent: 'center' },
  identityTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  identitySubtitle: { ...typography.small, color: colors.textSecondary },
  rbChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceLavender, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  rbChipText: { ...typography.caption, color: colors.textGreen },
  avatarRow: { flexDirection: 'row', gap: spacing.lg, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: radii.pill, backgroundColor: colors.surfaceLavender },
  avatarBadge: { position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: radii.pill, backgroundColor: colors.textGreen, alignItems: 'center', justifyContent: 'center' },
  avatarTextWrap: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { ...typography.h1, color: colors.textPrimary },
  email: { ...typography.small, color: colors.textSecondary },
  memberSince: { ...typography.caption, color: colors.textSecondary },
  editButton: { marginTop: spacing.sm },
  editHint: { ...typography.small, color: colors.textSecondary, textAlign: 'center' },
  menuCard: { backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.lg },
  menuLabel: { ...typography.caption, color: colors.textSecondary, letterSpacing: 0.7, marginBottom: spacing.sm },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  menuRowBorder: { borderTopWidth: 1, borderTopColor: colors.surfaceMuted },
  menuRowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menuRowText: { ...typography.label, color: colors.textPrimary },
  menuRowTextDanger: { color: '#BA1A1A' },
  settingsCard: { backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.xl, gap: spacing.md },
  discreetCard: { backgroundColor: colors.surfaceMuted },
  sectionHeader: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  sectionIcon: { width: 36, height: 36, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  sectionSubtitle: { ...typography.small, color: colors.textSecondary },
  dangerText: { color: '#BA1A1A' },
  fieldLabel: { ...typography.label, color: colors.textPrimary },
  fieldSpacing: { marginTop: spacing.sm },
  segmentRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  segment: { backgroundColor: colors.surfaceMuted, borderRadius: radii.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  segmentActive: { backgroundColor: colors.primaryDark },
  segmentText: { ...typography.caption, color: colors.textPrimary },
  segmentTextActive: { color: colors.surface },
  fieldHint: { ...typography.small, color: colors.textSecondary },
  soundRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: spacing.md },
  soundRowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  soundTitle: { ...typography.label, color: colors.textPrimary },
  soundDesc: { ...typography.small, color: colors.textSecondary },
  soundButton: { width: 36, height: 36, borderRadius: radii.pill, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleTextWrap: { flex: 1, paddingRight: spacing.md },
  toggleTitle: { ...typography.label, color: colors.textPrimary },
  toggleDesc: { ...typography.small, color: colors.textSecondary },
  discreetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.lg },
  discreetTextWrap: { flex: 1, paddingRight: spacing.md },
  quickExitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  quickExitDesc: { ...typography.small, color: colors.textSecondary, flex: 1 },
  activeLabel: { ...typography.caption, color: colors.textGreen, fontWeight: '700', letterSpacing: 0.6 },
  pinRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: spacing.md },
  pinRowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pinLabel: { ...typography.label, color: colors.textPrimary },
  pinChange: { ...typography.label, color: colors.primaryDark },
  downloadButton: {},
  purgeBox: { backgroundColor: 'rgba(255,218,214,0.4)', borderRadius: radii.md, padding: spacing.lg, gap: spacing.md },
  purgeHeader: { flexDirection: 'row', gap: spacing.sm },
  purgeTextWrap: { flex: 1 },
  purgeTitle: { ...typography.label, color: '#BA1A1A' },
  purgeBody: { ...typography.small, color: colors.textSecondary },
  crisisFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFD9DD', borderRadius: radii.md, padding: spacing.lg },
  crisisFooterLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  crisisFooterIcon: { width: 32, height: 32, borderRadius: radii.pill, backgroundColor: '#BA1A1A', alignItems: 'center', justifyContent: 'center' },
  crisisFooterTitle: { ...typography.label, fontSize: 14, color: '#301217' },
  crisisFooterSubtitle: { ...typography.small, color: '#623C42' },
  crisisFooterButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#BA1A1A', borderRadius: radii.pill, paddingHorizontal: spacing.lg, height: 40 },
  crisisFooterButtonText: { ...typography.label, color: colors.surface },
});
