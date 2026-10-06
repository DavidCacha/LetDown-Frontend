import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AppHeader from '../../components/AppHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/api';
import { ROLE_TO_RELATIONSHIP, TrustedContact, contactsService, relationshipToRoleKey } from '../../services/contact';

const ROLES = [
  { key: 'family', label: 'Familiar', icon: 'home' },
  { key: 'partner', label: 'Pareja', icon: 'heart' },
  { key: 'therapist', label: 'Terapeuta / Profesional', icon: 'briefcase' },
  { key: 'friend', label: 'Amistad íntima', icon: 'smile' },
  { key: 'neighbor', label: 'Vecino / Cercano', icon: 'map-pin' },
];

export default function EditContactScreen({ navigation, route }: any) {
  const { accessToken } = useAuth();
  const existing: TrustedContact | undefined = route?.params?.contact;
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.fullName ?? '');
  const [countryCode, setCountryCode] = useState(existing?.phoneCountryCode ?? '+52');
  const [phone, setPhone] = useState(existing?.phoneNumber ?? '');
  const [email, setEmail] = useState(existing?.email ?? '');
  const [role, setRole] = useState(relationshipToRoleKey(existing?.relationship ?? null));
  const [primary, setPrimary] = useState(existing?.isPrimary ?? false);
  const [alertsPermission, setAlertsPermission] = useState(existing?.canReceiveAlerts ?? true);
  const [gpsPermission, setGpsPermission] = useState(existing?.canReceiveLocation ?? true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!accessToken) return;

    if (!name.trim()) {
      Alert.alert('Falta el nombre', 'Escribe un nombre o alias para este contacto.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Falta el teléfono', 'Escribe el número de teléfono de este contacto.');
      return;
    }

    const payload = {
      fullName: name.trim(),
      relationship: ROLE_TO_RELATIONSHIP[role],
      phoneCountryCode: countryCode.trim() || undefined,
      phoneNumber: phone.trim(),
      email: email.trim() ? email.trim() : undefined,
      isPrimary: primary,
      canReceiveAlerts: alertsPermission,
      canReceiveLocation: gpsPermission,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await contactsService.update(accessToken, existing!.id, payload);
      } else {
        await contactsService.create(accessToken, payload);
      }
      navigation?.goBack?.();
    } catch (err) {
      Alert.alert(
        isEdit ? 'No se pudo actualizar el contacto' : 'No se pudo guardar el contacto',
        err instanceof ApiError ? err.message : 'Intenta de nuevo en un momento.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert(
      'Eliminar de mi círculo de emergencia',
      `¿Seguro que quieres eliminar a ${existing.fullName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (!accessToken) return;
            setDeleting(true);
            try {
              await contactsService.remove(accessToken, existing.id);
              navigation?.goBack?.();
            } catch (err) {
              Alert.alert(
                'No se pudo eliminar',
                err instanceof ApiError ? err.message : 'Intenta de nuevo en un momento.',
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader onOpenMenu={() => navigation?.openDrawer?.()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backLink} onPress={() => navigation?.goBack?.()}>
            <Icon name="arrow-left" size={16} color={colors.textSecondary} />
            <Text style={styles.backLinkText}>Contactos</Text>
          </TouchableOpacity>
          <View style={styles.circleChip}>
            <Icon name="shield" size={13} color={colors.textGreen} />
            <Text style={styles.circleChipText}>Círculo Confiable</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroTextWrap}>
              <View style={styles.heroLabelRow}>
                <Icon name="link" size={12} color={colors.textGreen} />
                <Text style={styles.heroLabel}>VÍNCULO DE SEGURIDAD</Text>
              </View>
              <Text style={styles.heroTitle}>{isEdit ? 'Editar contacto protector' : 'Añadir contacto protector'}</Text>
            </View>
            <View style={styles.heroIcon}>
              <Icon name="user-plus" size={22} color={colors.primaryDark} />
            </View>
          </View>
          <Text style={styles.heroDesc}>
            Crea un lazo de apoyo seguro. Define qué permisos tendrá esta persona durante un momento vulnerable o
            crisis.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Icon name="user" size={18} color={colors.textPrimary} />
            <Text style={styles.sectionTitle}>1. Datos del protector</Text>
          </View>

          <View style={styles.fieldLabelRow}>
            <Text style={styles.fieldLabel}>Nombre o Alias de calma</Text>
            <Text style={styles.fieldRequired}>Requerido</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Ej. Mamá, Hermano Carlos, Sofía terapeuta"
            placeholderTextColor={colors.textSecondary50}
            value={name}
            onChangeText={setName}
          />
          <Text style={styles.fieldHint}>Usa un nombre que te transmita paz inmediata al leerlo en pantalla.</Text>

          <View style={[styles.fieldLabelRow, styles.fieldSpacing]}>
            <Text style={styles.fieldLabel}>Teléfono móvil para emergencias</Text>
            <Text style={styles.fieldRequired}>SMS / Llamada</Text>
          </View>
          <View style={styles.phoneRow}>
            <TextInput
              style={[styles.input, styles.countryInput]}
              placeholder="+52"
              placeholderTextColor={colors.textSecondary50}
              value={countryCode}
              onChangeText={setCountryCode}
            />
            <TextInput
              style={[styles.input, styles.phoneInput]}
              placeholder="612 345 678"
              placeholderTextColor={colors.textSecondary50}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
          <Text style={styles.fieldHint}>Este número recibirá tu alerta instantánea ante un aviso de crisis.</Text>

          <View style={[styles.fieldLabelRow, styles.fieldSpacing]}>
            <Text style={styles.fieldLabel}>Correo (opcional)</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            placeholderTextColor={colors.textSecondary50}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[styles.fieldLabel, styles.fieldSpacing]}>Vínculo o Rol emocional</Text>
          <View style={styles.rolesRow}>
            {ROLES.map((r) => {
              const selected = role === r.key;
              return (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.roleChip, selected && styles.roleChipActive]}
                  onPress={() => setRole(r.key)}
                >
                  <Icon name={r.icon} size={14} color={selected ? colors.surface : colors.textSecondary} />
                  <Text style={[styles.roleChipText, selected && styles.roleChipTextActive]}>{r.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.primaryRow}>
            <View style={styles.primaryLeft}>
              <View style={styles.primaryIcon}>
                <Icon name="star" size={18} color={colors.surface} />
              </View>
              <View style={styles.primaryTextWrap}>
                <Text style={styles.primaryTitle}>Contacto Principal de Emergencia</Text>
                <Text style={styles.primaryDesc}>Se notificará de primero ante cualquier alerta. Solo puede haber uno.</Text>
              </View>
            </View>
            <Switch value={primary} onValueChange={setPrimary} trackColor={{ true: colors.primaryDark, false: colors.disabled }} thumbColor={colors.surface} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Icon name="key" size={17} color={colors.textPrimary} />
            <Text style={styles.sectionTitle}>2. Permisos para momentos de crisis</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Controla con total autonomía qué acciones podrá ejecutar Sanctuary hacia este protector.
          </Text>

          <View style={styles.permissionRow}>
            <View style={styles.permissionLeft}>
              <Icon name="alert-circle" size={17} color={colors.textSecondary} />
              <View style={styles.permissionTextWrap}>
                <Text style={styles.permissionTitle}>Recibir alertas de crisis</Text>
                <Text style={styles.permissionDesc}>Se le notifica si activas una alerta o el botón SOS.</Text>
              </View>
            </View>
            <Switch value={alertsPermission} onValueChange={setAlertsPermission} trackColor={{ true: colors.textGreen, false: colors.disabled }} thumbColor={colors.surface} />
          </View>
          <View style={styles.permissionRow}>
            <View style={styles.permissionLeft}>
              <Icon name="map-pin" size={17} color={colors.textSecondary} />
              <View style={styles.permissionTextWrap}>
                <Text style={styles.permissionTitle}>Recibir ubicación GPS en tiempo real</Text>
                <Text style={styles.permissionDesc}>Envía tus coordenadas seguras para que puedan localizarte.</Text>
              </View>
            </View>
            <Switch value={gpsPermission} onValueChange={setGpsPermission} trackColor={{ true: colors.textGreen, false: colors.disabled }} thumbColor={colors.surface} />
          </View>
        </View>

        <PrimaryButton
          label="Guardar contacto seguro"
          icon="check"
          style={styles.saveButton}
          loading={saving}
          disabled={saving}
          onPress={handleSave}
        />
        <PrimaryButton label="Cancelar y volver" variant="neutral" style={styles.cancelButton} onPress={() => navigation?.goBack?.()} />
        {isEdit ? (
          <TouchableOpacity style={styles.deleteButton} disabled={deleting} onPress={handleDelete}>
            <Icon name="trash-2" size={14} color="#BA1A1A" />
            <Text style={styles.deleteButtonText}>
              {deleting ? 'Eliminando...' : 'Eliminar de mi círculo de emergencia'}
            </Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.privacyCard}>
          <View style={styles.privacyIcon}>
            <Icon name="lock" size={16} color={colors.textGreen} />
          </View>
          <Text style={styles.privacyText}>
            <Text style={styles.privacyBold}>Privacidad estricta: </Text>
            Tus contactos de confianza se guardan de forma cifrada en el servidor de Sanctuary y solo tú puedes
            verlos, editarlos o eliminarlos.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backLinkText: { ...typography.label, color: colors.textSecondary },
  circleChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceGreen, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: 4 },
  circleChipText: { ...typography.caption, color: colors.textGreen },
  heroCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.xl, marginBottom: spacing.lg, gap: spacing.md },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroTextWrap: { flex: 1, paddingRight: spacing.md },
  heroLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroLabel: { fontSize: 12, fontWeight: '700', color: colors.textGreen, letterSpacing: 0.6 },
  heroTitle: { ...typography.h1, color: colors.textPrimary, marginTop: 4 },
  heroIcon: { width: 48, height: 48, borderRadius: radii.pill, backgroundColor: colors.surfacePurpleSoft, alignItems: 'center', justifyContent: 'center' },
  heroDesc: { ...typography.body, color: colors.textSecondary },
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.xl, marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  sectionTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary, flex: 1 },
  sectionSubtitle: { ...typography.small, color: colors.textSecondary, marginBottom: spacing.md },
  fieldLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  fieldLabel: { ...typography.label, color: colors.textPrimary },
  fieldRequired: { ...typography.small, color: colors.textSecondary },
  fieldSpacing: { marginTop: spacing.lg },
  input: { backgroundColor: colors.inputBg, borderRadius: radii.md, height: 48, paddingHorizontal: spacing.lg, fontSize: 15, color: colors.textPrimary, marginTop: spacing.xs },
  fieldHint: { ...typography.small, color: colors.textSecondary, marginTop: spacing.xs },
  phoneRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  countryInput: { width: 80, marginTop: 0, textAlign: 'center' },
  phoneInput: { flex: 1, marginTop: 0 },
  rolesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  roleChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surfaceMuted, borderRadius: radii.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  roleChipActive: { backgroundColor: colors.primaryDark },
  roleChipText: { ...typography.label, color: colors.textSecondary },
  roleChipTextActive: { color: colors.surface },
  primaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(232,221,255,0.4)', borderRadius: radii.md, padding: spacing.lg, marginTop: spacing.lg },
  primaryLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  primaryIcon: { width: 40, height: 40, borderRadius: radii.pill, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  primaryTextWrap: { flex: 1 },
  primaryTitle: { ...typography.label, color: colors.textPrimary },
  primaryDesc: { ...typography.small, color: colors.textSecondary },
  permissionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm },
  permissionLeft: { flexDirection: 'row', gap: spacing.md, flex: 1 },
  permissionTextWrap: { flex: 1 },
  permissionTitle: { ...typography.label, color: colors.textPrimary },
  permissionDesc: { ...typography.small, color: colors.textSecondary },
  saveButton: { marginBottom: spacing.md },
  cancelButton: { marginBottom: spacing.md },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, marginBottom: spacing.lg },
  deleteButtonText: { ...typography.label, color: '#BA1A1A' },
  privacyCard: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: spacing.lg },
  privacyIcon: { width: 36, height: 36, borderRadius: radii.pill, backgroundColor: colors.surfaceGreen, alignItems: 'center', justifyContent: 'center' },
  privacyText: { ...typography.small, color: colors.textSecondary, flex: 1 },
  privacyBold: { fontWeight: '700', color: colors.textPrimary },
});
