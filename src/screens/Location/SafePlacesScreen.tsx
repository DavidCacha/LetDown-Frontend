import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
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
import { SafePlace, safePlacesService } from '../../services/safePlaces';

const FILTERS = ['Todos', 'Mis anclas'];

function iconFor(place: SafePlace): { icon: string; bg: string } {
  if (place.isAnchor) return { icon: 'home', bg: '#FFD9DD' };
  return { icon: 'map-pin', bg: colors.surfaceGreen };
}

export default function SafePlacesScreen({ navigation }: any) {
  const { accessToken } = useAuth();

  const [places, setPlaces] = useState<SafePlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(FILTERS[0]);

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isAnchor, setIsAnchor] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadPlaces = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const result = await safePlacesService.getAll(accessToken);
      setPlaces(result);
    } catch (err) {
      Alert.alert(
        'No se pudo cargar tus lugares seguros',
        err instanceof ApiError ? err.message : 'Intenta de nuevo en un momento.',
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', loadPlaces);
    return unsubscribe;
  }, [navigation, loadPlaces]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setAddress('');
    setPhone('');
    setIsAnchor(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!accessToken) return;
    if (!name.trim()) {
      Alert.alert('Falta el nombre', 'Dale un nombre a este lugar seguro.');
      return;
    }

    setSaving(true);
    try {
      await safePlacesService.create(accessToken, {
        name: name.trim(),
        isAnchor,
        description: description.trim() ? description.trim() : undefined,
        address: address.trim() ? address.trim() : undefined,
        phone: phone.trim() ? phone.trim() : undefined,
      });
      setModalVisible(false);
      resetForm();
      loadPlaces();
    } catch (err) {
      Alert.alert(
        'No se pudo guardar el lugar',
        err instanceof ApiError ? err.message : 'Intenta de nuevo en un momento.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (place: SafePlace) => {
    Alert.alert('Eliminar lugar seguro', `¿Seguro que quieres eliminar "${place.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          if (!accessToken) return;
          try {
            await safePlacesService.remove(accessToken, place.id);
            setPlaces((prev) => prev.filter((p) => p.id !== place.id));
          } catch (err) {
            Alert.alert(
              'No se pudo eliminar',
              err instanceof ApiError ? err.message : 'Intenta de nuevo en un momento.',
            );
          }
        },
      },
    ]);
  };

  const handleMore = (place: SafePlace) => {
    Alert.alert(place.name, undefined, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => handleDelete(place) },
    ]);
  };

  const filteredPlaces = places
    .filter((p) => (filter === 'Mis anclas' ? p.isAnchor : true))
    .filter((p) => {
      if (!search.trim()) return true;
      const haystack = `${p.name} ${p.description ?? ''}`.toLowerCase();
      return haystack.includes(search.trim().toLowerCase());
    });

  return (
    <View style={styles.screen}>
      <AppHeader onOpenMenu={() => navigation?.openDrawer?.()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerTop}>
          <Chip icon="lock" label="GPS privado · Ubicación local cifrada" tone="green" />
        </View>
        <View style={styles.titleRow}>
          <View style={styles.titleTextWrap}>
            <Text style={styles.title}>Mapa de Refugio</Text>
            <Text style={styles.subtitle}>Espacios de calma, atención clínica y tus anclas de paz.</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.shareCrisisButton}
          onPress={() => navigation?.navigate?.('CrisisShare')}
        >
          <View style={styles.shareCrisisLeft}>
            <View style={styles.shareCrisisIcon}>
              <Icon name="map-pin" size={18} color={colors.surface} />
            </View>
            <View>
              <Text style={styles.shareCrisisTitle}>Compartir mi ubicación en crisis</Text>
              <Text style={styles.shareCrisisDesc}>Envío instantáneo a tus contactos de socorro</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={14} color="#301217" />
        </TouchableOpacity>

        <View style={styles.searchBar}>
          <Icon name="search" size={16} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar refugios, centros de salud o calma..."
            placeholderTextColor={colors.textSecondary50}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.listHeader}>
          <View>
            <Text style={styles.listTitle}>Mis lugares seguros</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleOpenAdd}>
            <Icon name="plus" size={13} color="#200F4A" />
            <Text style={styles.addButtonText}>Añadir</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primaryDark} />
            <Text style={styles.loadingText}>Cargando tus lugares...</Text>
          </View>
        ) : filteredPlaces.length === 0 ? (
          <View style={styles.emptyCard}>
            <Icon name="map-pin" size={22} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              {places.length === 0
                ? 'Todavía no has añadido lugares seguros.'
                : 'No encontramos lugares que coincidan con tu búsqueda.'}
            </Text>
          </View>
        ) : (
          filteredPlaces.map((p) => {
            const { icon, bg } = iconFor(p);
            return (
              <View key={p.id} style={styles.placeCard}>
                <View style={styles.placeHeader}>
                  <View style={[styles.placeIcon, { backgroundColor: bg }]}>
                    <Icon name={icon} size={20} color={colors.primaryDark} />
                  </View>
                  <View style={styles.placeTextWrap}>
                    <View style={styles.placeTitleRow}>
                      <Text style={styles.placeName}>{p.name}</Text>
                      {p.isAnchor ? (
                        <View style={[styles.placeTag, { backgroundColor: colors.surfacePurpleSoft }]}>
                          <Text style={[styles.placeTagText, { color: '#4C3D78' }]}>ANCLA</Text>
                        </View>
                      ) : null}
                    </View>
                    {p.description ? <Text style={styles.placeDesc}>{p.description}</Text> : null}
                    {p.address ? <Text style={styles.placeMeta}>{p.address}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => handleMore(p)}>
                    <Icon name="more-vertical" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.placeActions}>
                  <TouchableOpacity
                    style={styles.placeActionSecondary}
                    disabled={!p.phone}
                    onPress={() => p.phone && Linking.openURL(`tel:${p.phone}`)}
                  >
                    <Icon name="phone" size={14} color={colors.primaryDark} />
                    <Text style={styles.placeActionSecondaryText}>Llamar directo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.placeActionPrimary}
                    disabled={p.latitude == null || p.longitude == null}
                    onPress={() => {
                      if (p.latitude != null && p.longitude != null) {
                        Linking.openURL(`geo:${p.latitude},${p.longitude}?q=${p.latitude},${p.longitude}(${encodeURIComponent(p.name)})`);
                      }
                    }}
                  >
                    <Icon name="navigation" size={14} color={colors.surface} />
                    <Text style={styles.placeActionPrimaryText}>Cómo llegar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        <TouchableOpacity style={styles.addPlaceButton} onPress={handleOpenAdd}>
          <Icon name="map-pin" size={18} color={colors.primaryDark} />
          <Text style={styles.addPlaceButtonText}>Añadir nuevo lugar seguro a mi lista</Text>
        </TouchableOpacity>

        <View style={styles.privacyCard}>
          <View style={styles.privacyIcon}>
            <Icon name="shield" size={16} color={colors.textPrimary} />
          </View>
          <View style={styles.privacyTextWrap}>
            <Text style={styles.privacyTitle}>Compromiso de Cero Rastreo</Text>
            <Text style={styles.privacyBody}>
              Tus lugares seguros solo los puedes ver tú. Tu ubicación se transmite única y voluntariamente si
              activas la alerta de crisis.
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nuevo lugar seguro</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon name="x" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Casa de mamá, Biblioteca municipal"
                placeholderTextColor={colors.textSecondary50}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.fieldLabel}>Descripción (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Zona de descompresión sensorial"
                placeholderTextColor={colors.textSecondary50}
                value={description}
                onChangeText={setDescription}
              />

              <Text style={styles.fieldLabel}>Dirección (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Av. Siempre Viva 123"
                placeholderTextColor={colors.textSecondary50}
                value={address}
                onChangeText={setAddress}
              />

              <Text style={styles.fieldLabel}>Teléfono (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. 5512345678"
                placeholderTextColor={colors.textSecondary50}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <View style={styles.anchorRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Marcar como ancla principal</Text>
                  <Text style={styles.fieldHint}>Tu lugar seguro de referencia</Text>
                </View>
                <Switch
                  value={isAnchor}
                  onValueChange={setIsAnchor}
                  trackColor={{ true: colors.primaryDark, false: colors.disabled }}
                  thumbColor={colors.surface}
                />
              </View>

              <PrimaryButton
                label="Guardar lugar seguro"
                icon="check"
                style={{ marginTop: spacing.lg }}
                loading={saving}
                disabled={saving}
                onPress={handleSave}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  headerTop: { marginTop: spacing.sm, marginBottom: spacing.sm, alignItems: 'flex-start' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  titleTextWrap: { flex: 1, paddingRight: spacing.md },
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  shareCrisisButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFD9DD', borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.lg },
  shareCrisisLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  shareCrisisIcon: { width: 40, height: 40, borderRadius: radii.md, backgroundColor: '#774E54', alignItems: 'center', justifyContent: 'center' },
  shareCrisisTitle: { ...typography.label, fontSize: 17, color: '#301217' },
  shareCrisisDesc: { ...typography.small, color: '#301217', opacity: 0.8 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radii.lg, height: 48, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  searchInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
  filterRow: { flexGrow: 0, marginBottom: spacing.lg },
  filterChip: { backgroundColor: colors.surfaceLavender, borderRadius: radii.pill, paddingHorizontal: spacing.lg, height: 40, justifyContent: 'center', marginRight: spacing.sm },
  filterChipActive: { backgroundColor: colors.primaryDark },
  filterText: { ...typography.label, color: colors.textSecondary },
  filterTextActive: { color: colors.surface },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  listTitle: { ...typography.label, fontSize: 20, color: colors.textPrimary },
  listSubtitle: { ...typography.small, color: colors.textSecondary },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfacePurpleSoft, borderRadius: radii.pill, height: 36, paddingHorizontal: spacing.md },
  addButtonText: { ...typography.label, color: '#200F4A' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: 'center', paddingVertical: spacing.xl },
  loadingText: { ...typography.small, color: colors.textSecondary },
  emptyCard: { alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.xl, marginBottom: spacing.lg },
  emptyText: { ...typography.small, color: colors.textSecondary, textAlign: 'center' },
  placeCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.md, gap: spacing.md },
  placeHeader: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  placeIcon: { width: 48, height: 48, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center' },
  placeTextWrap: { flex: 1 },
  placeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  placeName: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  placeTag: { borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  placeTagText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  placeDesc: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  placeMeta: { ...typography.caption, color: colors.textGreen, marginTop: 2 },
  placeActions: { flexDirection: 'row', gap: spacing.sm },
  placeActionSecondary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.surfaceMuted, borderRadius: radii.md, height: 44 },
  placeActionSecondaryText: { ...typography.label, color: colors.primaryDark },
  placeActionPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.primaryDark, borderRadius: radii.md, height: 44 },
  placeActionPrimaryText: { ...typography.label, color: colors.surface },
  addPlaceButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.surfaceMuted, borderRadius: radii.lg, height: 56, marginBottom: spacing.lg },
  addPlaceButtonText: { ...typography.label, color: colors.primaryDark },
  privacyCard: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surfaceLavender, borderRadius: radii.lg, padding: spacing.lg },
  privacyIcon: { width: 36, height: 36, borderRadius: radii.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  privacyTextWrap: { flex: 1 },
  privacyTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  privacyBody: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.background, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, padding: spacing.xl, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  modalTitle: { ...typography.h1, fontSize: 20, color: colors.textPrimary },
  fieldLabel: { ...typography.label, color: colors.textPrimary, marginTop: spacing.md },
  fieldHint: { ...typography.small, color: colors.textSecondary },
  input: { backgroundColor: colors.inputBg, borderRadius: radii.md, height: 48, paddingHorizontal: spacing.lg, fontSize: 15, color: colors.textPrimary, marginTop: spacing.xs },
  anchorRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, marginTop: spacing.lg },
});
