import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AppHeader from '../../components/AppHeader';
import Chip from '../../components/Chip';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/api';
import { TrustedContact, contactsService } from '../../services/contact';

const MAX_CONTACTS = 5;
console.log('[DEBUG] contactsService =', contactsService, '| ApiError =', ApiError);
function fullPhone(c: TrustedContact): string {
  return `${c.phoneCountryCode ?? ''} ${c.phoneNumber}`.trim();
}

function tagFor(c: TrustedContact): { label: string; bg: string; color: string } {
  if (c.isPrimary) return { label: 'Prioritaria', bg: colors.surfacePurpleSoft, color: '#4C3D78' };
  const r = (c.relationship ?? '').toLowerCase();
  if (r.includes('terapeuta') || r.includes('profesional')) {
    return { label: 'Clínico', bg: colors.surfaceGreen, color: colors.textGreen };
  }
  return { label: c.relationship ?? 'Contacto', bg: colors.surfaceMuted, color: colors.textSecondary };
}

export default function EmergencyContactsScreen({ navigation }: any) {
  const { accessToken } = useAuth();

  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadContacts = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const result = await contactsService.getAll(accessToken);
      setContacts(result);
    } catch (err) {
      Alert.alert(
        'No se pudo cargar tus contactos',
        err instanceof ApiError ? err.message : 'Intenta de nuevo en un momento.',
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', loadContacts);
    return unsubscribe;
  }, [navigation, loadContacts]);

  const handleDelete = (contact: TrustedContact) => {
    Alert.alert(
      'Eliminar contacto',
      `¿Seguro que quieres eliminar a ${contact.fullName} de tu círculo de confianza?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (!accessToken) return;
            setDeletingId(contact.id);
            try {
              await contactsService.remove(accessToken, contact.id);
              setContacts((prev) => prev.filter((c) => c.id !== contact.id));
            } catch (err) {
              Alert.alert(
                'No se pudo eliminar',
                err instanceof ApiError ? err.message : 'Intenta de nuevo en un momento.',
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  const handleCall = (contact: TrustedContact) => {
    Linking.openURL(`tel:${fullPhone(contact).replace(/\s/g, '')}`);
  };

  const handleMessage = (contact: TrustedContact) => {
    const body =
      'Hola, estoy pasando por un momento de crisis emocional intensa y necesito tu presencia o apoyo. Por favor contáctame o ven cuando veas esto.';
    Linking.openURL(`sms:${fullPhone(contact).replace(/\s/g, '')}?body=${encodeURIComponent(body)}`);
  };

  const filteredContacts = contacts.filter((c) => {
    if (!search.trim()) return true;
    const haystack = `${c.fullName} ${c.relationship ?? ''}`.toLowerCase();
    return haystack.includes(search.trim().toLowerCase());
  });

  return (
    <View style={styles.screen}>
      <AppHeader onOpenMenu={() => navigation?.openDrawer?.()} />
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.title}>Contactos de Confianza</Text>
        <Text style={styles.subtitle}>
          Tu círculo íntimo de contención y ayuda en momentos de crisis o desborde emocional.
        </Text>

        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Icon name="search" size={15} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre o rol..."
              placeholderTextColor={colors.textSecondary50}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity
            style={[styles.addButton, contacts.length >= MAX_CONTACTS && styles.addButtonDisabled]}
            disabled={contacts.length >= MAX_CONTACTS}
            onPress={() => navigation?.navigate?.('EditContact')}
          >
            <Icon name="user-plus" size={15} color={colors.surface} />
            <Text style={styles.addButtonText}>Agregar</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primaryDark} />
            <Text style={styles.loadingText}>Cargando tus contactos...</Text>
          </View>
        ) : filteredContacts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Icon name="users" size={22} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              {contacts.length === 0
                ? 'Todavía no has añadido contactos de confianza.'
                : 'No encontramos contactos que coincidan con tu búsqueda.'}
            </Text>
          </View>
        ) : (
          filteredContacts.map((c) => {
            const tag = tagFor(c);
            const isDeleting = deletingId === c.id;
            return (
              <View key={c.id} style={styles.contactCard}>
                <View style={styles.contactHeader}>
                  <View style={styles.contactLeft}>
                    <View style={styles.avatar}>
                      <Icon name="user" size={20} color={colors.primaryDark} />
                    </View>
                    <View style={styles.contactTextWrap}>
                      <View style={styles.contactTitleRow}>
                        <Text style={styles.contactName}>{c.fullName}</Text>
                        <View style={[styles.contactTag, { backgroundColor: tag.bg }]}>
                          <Text style={[styles.contactTagText, { color: tag.color }]}>{tag.label}</Text>
                        </View>
                      </View>
                      <Text style={styles.contactPhone}>{fullPhone(c)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    disabled={isDeleting}
                    onPress={() => navigation?.navigate?.('EditContact', { contact: c })}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color="#BA1A1A" />
                    ) : (
                      <Icon name="more-vertical" size={16} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleCall(c)}>
                    <Icon name="phone" size={13} color={colors.textPrimary} />
                    <Text style={styles.actionText}>Llamar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleMessage(c)}>
                    <Icon name="message-square" size={13} color={colors.textPrimary} />
                    <Text style={styles.actionText}>Mensaje</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteAction]}
                    disabled={isDeleting}
                    onPress={() => handleDelete(c)}
                  >
                    <Icon name="trash-2" size={13} color="#BA1A1A" />
                    <Text style={[styles.actionText, styles.deleteActionText]}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        <View style={styles.templateCard}>
          <View style={styles.templateHeader}>
            <View style={styles.templateHeaderLeft}>
              <Icon name="message-circle" size={17} color={colors.textPrimary} />
              <Text style={styles.templateTitle}>Mensaje Rápido Preconfigurado</Text>
            </View>
          </View>
          <Text style={styles.templateDesc}>
            Este mensaje se envía automáticamente al tocar [Mensaje] o al activar la Alerta Rápida General:
          </Text>
          <View style={styles.templateBox}>
            <Text style={styles.templateText}>
              "Hola, estoy pasando por un momento de crisis emocional intensa y necesito tu presencia o apoyo. Por
              favor contáctame o ven cuando veas esto."
            </Text>
          </View>
        </View>

        <View style={styles.privacyCard}>
          <Icon name="shield" size={20} color={colors.textGreen} />
          <View style={styles.privacyTextWrap}>
            <Text style={styles.privacyTitle}>Control y Privacidad Absoluta</Text>
            <Text style={styles.privacyBody}>
              Tus contactos <Text style={styles.bold}>nunca reciben notificaciones pasivas</Text> ni rastreo en
              segundo plano. Tu estado, ubicación y mensajes solo se envían en el instante exacto en que decides
              pulsar una acción.
            </Text>
          </View>
        </View>

        <View style={styles.crisisBanner}>
          <View style={styles.crisisHeader}>
            <View style={styles.crisisIcon}>
              <Icon name="phone" size={15} color={colors.surface} />
            </View>
            <View style={styles.crisisTextWrap}>
              <Text style={styles.crisisTitle}>Línea de Prevención y Crisis 988</Text>
              <Text style={styles.crisisDesc}>Atención telefónica gratuita, confidencial y 24/7</Text>
            </View>
          </View>
          <View style={styles.crisisActions}>
            <PrimaryButton label="Llamar al 988" icon="phone" variant="danger" style={styles.crisisButton} onPress={() => Linking.openURL('tel:988')} />
            <PrimaryButton label="SMS a 988" icon="message-square" variant="neutral" style={styles.crisisButton} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  countText: { ...typography.small, color: colors.textSecondary, textAlign: 'right' },
  title: { ...typography.h1, color: colors.textPrimary, marginTop: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  sosBanner: { backgroundColor: '#FFDAD6', borderRadius: radii.lg, padding: spacing.lg, gap: spacing.md, marginBottom: spacing.lg },
  sosHeader: { flexDirection: 'row', gap: spacing.md },
  sosIcon: { width: 40, height: 40, borderRadius: radii.pill, backgroundColor: '#BA1A1A', alignItems: 'center', justifyContent: 'center' },
  sosTextWrap: { flex: 1 },
  sosTitle: { ...typography.label, fontSize: 17, fontWeight: '700', color: '#93000A' },
  sosDesc: { ...typography.small, color: '#93000A', marginTop: 2 },
  sosActions: { flexDirection: 'row', gap: spacing.sm },
  sosButton: { flex: 1, height: 48 },
  sosSecondary: { width: 48, height: 48, borderRadius: radii.pill, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  searchRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surfaceMuted, borderRadius: radii.md, height: 48, paddingHorizontal: spacing.lg },
  searchInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primaryDark, borderRadius: radii.md, height: 48, paddingHorizontal: spacing.lg },
  addButtonDisabled: { opacity: 0.5 },
  addButtonText: { ...typography.label, color: colors.surface },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: 'center', paddingVertical: spacing.xl },
  loadingText: { ...typography.small, color: colors.textSecondary },
  emptyCard: { alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.xl, marginBottom: spacing.lg },
  emptyText: { ...typography.small, color: colors.textSecondary, textAlign: 'center' },
  contactCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.md, gap: spacing.sm },
  contactHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  contactLeft: { flexDirection: 'row', gap: spacing.md, flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: radii.pill, backgroundColor: colors.surfaceLavender, alignItems: 'center', justifyContent: 'center' },
  contactTextWrap: { flex: 1 },
  contactTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  contactName: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  contactTag: { borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  contactTagText: { fontSize: 12, fontWeight: '600' },
  contactPhone: { ...typography.small, color: colors.textSecondary, fontFamily: 'monospace' },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.surfaceLavender, borderRadius: radii.md, height: 44 },
  actionText: { ...typography.label, fontSize: 14, color: colors.textPrimary },
  deleteAction: { backgroundColor: 'rgba(186,26,26,0.1)' },
  deleteActionText: { color: '#BA1A1A' },
  templateCard: { backgroundColor: colors.surfaceMuted, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm, marginBottom: spacing.lg },
  templateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  templateHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  templateTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary, flex: 1 },
  templateDesc: { ...typography.small, color: colors.textSecondary },
  templateBox: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md },
  templateText: { ...typography.body, color: colors.textPrimary, fontStyle: 'italic' },
  privacyCard: { flexDirection: 'row', gap: spacing.md, backgroundColor: 'rgba(199,231,214,0.4)', borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.lg },
  privacyTextWrap: { flex: 1 },
  privacyTitle: { ...typography.label, fontSize: 17, color: colors.textGreen },
  privacyBody: { ...typography.small, color: colors.textGreen, marginTop: spacing.xs },
  bold: { fontWeight: '700' },
  crisisBanner: { backgroundColor: colors.disabled, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.md },
  crisisHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  crisisIcon: { width: 32, height: 32, borderRadius: radii.pill, backgroundColor: '#BA1A1A', alignItems: 'center', justifyContent: 'center' },
  crisisTextWrap: { flex: 1 },
  crisisTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  crisisDesc: { ...typography.small, color: colors.textSecondary },
  crisisActions: { flexDirection: 'row', gap: spacing.sm },
  crisisButton: { flex: 1, height: 44 },
});
