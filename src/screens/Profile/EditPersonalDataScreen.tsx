import React, { useState } from 'react';
import { Alert, Platform, PermissionsAndroid, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import Icon from 'react-native-vector-icons/Feather';
import AppHeader from '../../components/AppHeader';
import PrimaryButton from '../../components/PrimaryButton';
import TextField from '../../components/TextField';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { authService, isProfileEmpty as isProfileEmptyCheck } from '../../services/auth';
import { ApiError } from '../../services/api';
import { parseIneText } from '../../utils/ineParser';

function isoToDisplayDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function displayDateToIso(value: string): string | null {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
}

export default function EditPersonalDataScreen({ navigation }: any) {
  const { user, accessToken, updateUser } = useAuth();
  const profile = user?.profile;

  const [firstName, setFirstName] = useState(profile?.firstName ?? '');
  const [middleName, setMiddleName] = useState(profile?.middleName ?? '');
  const [lastName, setLastName] = useState(profile?.lastName ?? '');
  const [secondLastName, setSecondLastName] = useState(profile?.secondLastName ?? '');
  const [phoneCountryCode, setPhoneCountryCode] = useState(profile?.phoneCountryCode ?? '+52');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber ?? '');
  const [birthDate, setBirthDate] = useState(isoToDisplayDate(profile?.birthDate));
  const [curp, setCurp] = useState(profile?.curp ?? '');
  const [nationality, setNationality] = useState(profile?.nationality ?? 'MEX');
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);

  const isProfileEmpty = isProfileEmptyCheck(user);

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
      title: 'Permiso de cámara',
      message: 'Sanctuary necesita la cámara para escanear tu INE. La foto no se guarda ni se sube a ningún servidor.',
      buttonPositive: 'Permitir',
      buttonNegative: 'Cancelar',
    });
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const handleScanIne = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permiso necesario', 'Sin acceso a la cámara no se puede escanear la INE.');
      return;
    }

    const response = await launchCamera({
      mediaType: 'photo',
      cameraType: 'back',
      quality: 0.8,
      saveToPhotos: false, 
    });

    if (response.didCancel || !response.assets?.[0]?.uri) return;

    setScanning(true);
    try {
      const ocrResult = await TextRecognition.recognize(response.assets[0].uri!);
      const parsed = parseIneText(ocrResult.text);

      if (!parsed.curp && !parsed.firstName && !parsed.lastName) {
        Alert.alert(
          'No se detectaron datos',
          'No pudimos leer la credencial. Intenta de nuevo con mejor luz y enfoque, o captura los datos a mano.',
        );
        return;
      }

      if (parsed.firstName) setFirstName(parsed.firstName);
      if (parsed.lastName) setLastName(parsed.lastName);
      if (parsed.secondLastName) setSecondLastName(parsed.secondLastName);
      if (parsed.curp) setCurp(parsed.curp);
      if (parsed.birthDate) setBirthDate(isoToDisplayDate(parsed.birthDate));
      if (parsed.nationality) setNationality(parsed.nationality);

      Alert.alert(
        'Datos detectados',
        'Revisa que todo esté correcto antes de guardar. Puedes corregir cualquier campo a mano.',
      );
    } catch {
      Alert.alert('Error al escanear', 'No se pudo procesar la imagen. Intenta de nuevo.');
    } finally {
      setScanning(false);
    }
  };

  const hasChanges =
    firstName !== (profile?.firstName ?? '') ||
    middleName !== (profile?.middleName ?? '') ||
    lastName !== (profile?.lastName ?? '') ||
    secondLastName !== (profile?.secondLastName ?? '') ||
    phoneCountryCode !== (profile?.phoneCountryCode ?? '+52') ||
    phoneNumber !== (profile?.phoneNumber ?? '') ||
    birthDate !== isoToDisplayDate(profile?.birthDate) ||
    curp !== (profile?.curp ?? '') ||
    nationality !== (profile?.nationality ?? 'MEX');

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Faltan datos', 'Nombre y primer apellido son obligatorios.');
      return;
    }
    if (birthDate && !displayDateToIso(birthDate)) {
      Alert.alert('Fecha inválida', 'Usa el formato DD/MM/AAAA.');
      return;
    }
    if (!accessToken || !user) return;

    setSaving(true);
    try {
      const updatedProfile = await authService.updateProfile(accessToken, {
        firstName: firstName.trim(),
        middleName: middleName.trim() || null,
        lastName: lastName.trim(),
        secondLastName: secondLastName.trim() || null,
        phoneCountryCode: phoneNumber.trim() ? phoneCountryCode.trim() : null,
        phoneNumber: phoneNumber.trim() || null,
        birthDate: displayDateToIso(birthDate),
        curp: curp.trim() || null,
        nationality: nationality.trim() || null,
      });

      await updateUser({ ...user, profile: updatedProfile });
      Alert.alert('Datos actualizados', 'Tu información personal se guardó correctamente.', [
        { text: 'OK', onPress: () => navigation?.goBack?.() },
      ]);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'No se pudieron guardar los cambios.';
      Alert.alert('Error al guardar', message);
    } finally {
      setSaving(false);
    }
  };

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
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
          <View style={styles.encryptedChip}>
            <Icon name="shield" size={12} color={colors.textGreen} />
            <Text style={styles.encryptedChipText}>Cifrado de extremo a extremo</Text>
          </View>
        </View>

        <Text style={styles.title}>Editar Datos Personales</Text>
        <Text style={styles.subtitle}>
          Mantener tus datos al día nos permite resguardar tu identidad y activar asistencias seguras sin fricción.
        </Text>

        {hasChanges ? (
          <View style={styles.modeBanner}>
            <Icon name="edit-3" size={14} color={colors.primaryDark} />
            <Text style={styles.modeBannerText}>Modo edición activo • Cambios listos para guardar</Text>
          </View>
        ) : null}

        {isProfileEmpty ? (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Icon name="camera" size={16} color={colors.primaryDark} />
              <Text style={styles.sectionTitle}>Llenado rápido con tu INE</Text>
            </View>
            <Text style={styles.hint}>
              Escanea el frente de tu credencial para llenar nombre, apellidos, CURP y fecha de nacimiento al
              instante. La foto se procesa en tu teléfono y nunca se guarda ni se sube a ningún servidor.
            </Text>
            <PrimaryButton
              label={scanning ? 'Escaneando...' : 'Escanear INE'}
              icon="camera"
              variant="neutral"
              loading={scanning}
              onPress={handleScanIne}
            />
          </View>
        ) : null}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Icon name="briefcase" size={16} color={colors.primaryDark} />
            <Text style={styles.sectionTitle}>Identidad del usuario</Text>
          </View>
          <TextField label="Nombre(s) *" value={firstName} onChangeText={setFirstName} placeholder="Primer nombre" />
          <TextField
            label="Segundo nombre (opcional)"
            value={middleName}
            onChangeText={setMiddleName}
            placeholder="Opcional (segundo nombre)"
          />
          <TextField label="Primer apellido *" value={lastName} onChangeText={setLastName} placeholder="Primer apellido" />
          <TextField
            label="Segundo apellido (opcional)"
            value={secondLastName}
            onChangeText={setSecondLastName}
            placeholder="Opcional (segundo apellido)"
          />
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Icon name="smartphone" size={16} color={colors.primaryDark} />
            <Text style={styles.sectionTitle}>Contacto directo seguro</Text>
          </View>
          <View style={styles.phoneRow}>
            <View style={styles.phoneCode}>
              <TextField label="Lada" value={phoneCountryCode} onChangeText={setPhoneCountryCode} placeholder="+52" />
            </View>
            <View style={{ flex: 1 }}>
              <TextField
                label="Teléfono móvil de contacto"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Ej. 55 1234 5678"
                keyboardType="phone-pad"
              />
            </View>
          </View>
          <Text style={styles.hint}>
            Solo se compartirá si activas explícitamente el protocolo de resguardo o enlace a contactos de confianza.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Icon name="shield" size={16} color={colors.primaryDark} />
            <Text style={styles.sectionTitle}>Validación oficial y registro</Text>
          </View>
          <TextField
            label="Fecha de nacimiento"
            helperText="Formato: DD/MM/AAAA"
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="20/03/1995"
            keyboardType="numbers-and-punctuation"
          />
          <TextField
            label="CURP (Clave Única de Registro)"
            value={curp}
            onChangeText={(v) => setCurp(v.toUpperCase())}
            placeholder="Clave de 18 caracteres"
            maxLength={18}
            autoCapitalize="characters"
          />
          <TextField label="Nacionalidad" value={
            nationality
              ? NATIONALITY_LABELS[nationality] ?? nationality
              : 'No registrada'
          } onChangeText={setNationality} placeholder="MEX" />
        </View>

        <View style={styles.privacyNote}>
          <Icon name="shield" size={16} color={colors.textGreen} />
          <Text style={styles.privacyText}>
            Tu información personal nunca se vende ni se comparte con terceros. Estos datos sirven para brindarte un
            entorno de auxilio fidedigno y seguro.
          </Text>
        </View>

        <PrimaryButton
          label="Guardar y actualizar datos"
          icon="check"
          loading={saving}
          disabled={!hasChanges}
          onPress={handleSave}
        />
        <PrimaryButton
          label="Cancelar cambios"
          variant="neutral"
          disabled={saving}
          onPress={() => navigation?.goBack?.()}
          style={styles.cancelButton}
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
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.small, color: colors.textSecondary },
  modeBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surfacePurpleSoft, borderRadius: radii.md, padding: spacing.md },
  modeBannerText: { ...typography.caption, color: colors.primaryDark },
  sectionCard: { backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.sm, gap: spacing.xs },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  sectionTitle: { ...typography.label, fontSize: 16, color: colors.primaryDark },
  phoneRow: { flexDirection: 'row', gap: spacing.sm },
  phoneCode: { width: 92 },
  hint: { ...typography.small, color: colors.textSecondary },
  privacyNote: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.surfaceGreenSoft, borderRadius: radii.md, padding: spacing.lg },
  privacyText: { ...typography.small, color: colors.textGreen, flex: 1 },
  cancelButton: { marginTop: -spacing.sm },
});
