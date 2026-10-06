import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AppHeader from '../../components/AppHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { getDisplayName, isProfileEmpty } from '../../services/auth';

function calcAge(birthDate?: string | null): number | null {
  if (!birthDate) return null;
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const notYetHadBirthdayThisYear =
    today.getMonth() < d.getMonth() ||
    (today.getMonth() === d.getMonth() && today.getDate() < d.getDate());
  if (notYetHadBirthdayThisYear) age -= 1;
  return age;
}

function formatBirthDate(birthDate?: string | null): string {
  if (!birthDate) return 'No registrada';
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return 'No registrada';
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value || '—'}</Text>
    </View>
  );
}

export default function PersonalDataScreen({ navigation }: any) {
  const { user } = useAuth();
  const profile = user?.profile;

 
  useEffect(() => {
    if (isProfileEmpty(user)) {
      navigation?.replace?.('EditPersonalData');
    }
  }, [user, navigation]);

  const displayName = getDisplayName(user) || 'Usuario';
  const age = calcAge(profile?.birthDate);
  const phone =
    profile?.phoneNumber ? `${profile?.phoneCountryCode ?? ''} ${profile.phoneNumber}`.trim() : 'No registrado';

  const NATIONALITY_LABELS: Record<string, string> = {
    MEX: 'Mexicana',
    USA: 'Estadounidense',
  };

  return (
    <View style={styles.screen}>
      <AppHeader onOpenMenu={() => navigation?.openDrawer?.()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
            <Icon name="chevron-left" size={18} color={colors.primaryDark} />
            <Text style={styles.backText}>Volver a Perfil</Text>
          </TouchableOpacity>
          <View style={styles.encryptedChip}>
            <Icon name="shield" size={12} color={colors.textGreen} />
            <Text style={styles.encryptedChipText}>Cifrado de extremo a extremo</Text>
          </View>
        </View>

        <View style={styles.identityCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Icon name="user" size={32} color={colors.primaryDark} />
            </View>
            {user?.emailVerified ? (
              <View style={styles.avatarBadge}>
                <Icon name="check" size={12} color={colors.surface} />
              </View>
            ) : null}
          </View>

          {user?.emailVerified ? (
            <View style={styles.verifiedChip}>
              <Icon name="lock" size={12} color={colors.textGreen} />
              <Text style={styles.verifiedChipText}>Identidad Verificada</Text>
            </View>
          ) : null}

          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.subId}>Expediente de Acompañamiento #{user?.id?.slice(0, 8).toUpperCase() ?? '—'}</Text>

          <View style={styles.chipRow}>
            {profile?.curp ? (
              <View style={styles.pillChip}>
                <Icon name="fingerprint" size={12} color={colors.textGreen} />
                <Text style={styles.pillChipText}>CURP Validada</Text>
              </View>
            ) : null}
            <View style={styles.pillChip}>
              <Icon name="shield" size={12} color={colors.textGreen} />
              <Text style={styles.pillChipText}>Titular del Santuario</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Icon name="briefcase" size={16} color={colors.primaryDark} />
            <Text style={styles.sectionTitle}>Desglose de Identidad Nominal</Text>
          </View>
          <View style={styles.grid2}>
            <Field label="Primer Nombre" value={profile?.firstName ?? ''} />
            <Field label="Segundo Nombre" value={profile?.middleName ?? ''} />
            <Field label="Primer Apellido" value={profile?.lastName ?? ''} />
            <Field label="Segundo Apellido" value={profile?.secondLastName ?? ''} />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Icon name="credit-card" size={16} color={colors.primaryDark} />
            <Text style={styles.sectionTitle}>Documento y Registro Civil</Text>
          </View>
          <View style={styles.curpBox}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Clave Única (CURP)</Text>
              <Text style={styles.curpValue}>{profile?.curp ?? 'No registrada'}</Text>
            </View>
          </View>
          <View style={styles.grid2}>
            <Field label="Fecha de Nacimiento" value={`${formatBirthDate(profile?.birthDate)}${age !== null ? `\n${age} años cumplidos` : ''}`} />
            <Field label="Nacionalidad" value={
              profile?.nationality
                ? NATIONALITY_LABELS[profile.nationality] ?? profile.nationality
                : 'No registrada'
             } 
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Icon name="phone" size={16} color={colors.primaryDark} />
            <Text style={styles.sectionTitle}>Contacto y Alertas de Crisis</Text>
          </View>
          <View style={styles.contactRow}>
            <Icon name="phone" size={16} color={colors.primaryDark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Móvil Principal (Alertas SOS)</Text>
              <Text style={styles.fieldValue}>{phone}</Text>
            </View>
          </View>
          <View style={styles.contactRow}>
            <Icon name="at-sign" size={16} color={colors.primaryDark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Correo Institucional Seguro</Text>
              <Text style={styles.fieldValue}>{user?.email ?? '—'}</Text>
            </View>
            {user?.emailVerified ? <Icon name="check-circle" size={16} color={colors.textGreen} /> : null}
          </View>
        </View>

        <View style={styles.privacyNote}>
          <Icon name="lock" size={16} color={colors.textSecondary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.privacyTitle}>Protección Legal de Datos Clínicos y Emocionales</Text>
            <Text style={styles.privacyBody}>
              Tu información está estrictamente protegida bajo la Ley Federal de Protección de Datos Personales.
              Tus registros no se comercializan ni son accesibles para terceros sin tu autorización expresa.
            </Text>
          </View>
        </View>

        <PrimaryButton
          label="Modificar información personal"
          icon="edit-3"
          onPress={() => navigation?.navigate?.('EditPersonalData')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { ...typography.label, color: colors.primaryDark, marginLeft: 2 },
  encryptedChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceGreen, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  encryptedChipText: { ...typography.caption, color: colors.textGreen },
  identityCard: { backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  avatarWrap: { marginBottom: spacing.xs },
  avatar: { width: 80, height: 80, borderRadius: radii.pill, backgroundColor: colors.surfaceLavender, alignItems: 'center', justifyContent: 'center' },
  avatarBadge: { position: 'absolute', bottom: -4, right: -4, width: 26, height: 26, borderRadius: radii.pill, backgroundColor: colors.textGreen, alignItems: 'center', justifyContent: 'center' },
  verifiedChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceGreen, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  verifiedChipText: { ...typography.caption, color: colors.textGreen },
  name: { ...typography.h1, color: colors.textPrimary, textAlign: 'center' },
  subId: { ...typography.small, color: colors.textSecondary, textAlign: 'center' },
  chipRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  pillChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceLavender, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  pillChipText: { ...typography.caption, color: colors.textGreen },
  sectionCard: { backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.xl, gap: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionTitle: { ...typography.label, fontSize: 16, color: colors.primaryDark },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  field: { flexBasis: '47%', flexGrow: 1, backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: spacing.md },
  fieldLabel: { ...typography.caption, color: colors.textSecondary },
  fieldValue: { ...typography.label, color: colors.textPrimary, marginTop: 2 },
  curpBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: spacing.md },
  curpValue: { ...typography.label, fontSize: 16, letterSpacing: 1, color: colors.textPrimary, marginTop: 2 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: spacing.md },
  privacyNote: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.surfaceLavender, borderRadius: radii.md, padding: spacing.lg },
  privacyTitle: { ...typography.label, color: colors.textPrimary },
  privacyBody: { ...typography.small, color: colors.textSecondary, marginTop: 4 },
});
