import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../context/AuthContext';
import { colors, radii, spacing, typography } from '../constants/theme';

export interface SideMenuItem {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
}

export const SIDE_MENU_ITEMS: SideMenuItem[] = [
  { key: 'Home', title: '1. Inicio', subtitle: 'Dashboard', icon: 'home' },
  { key: 'NewChat', title: '2. Nuevo chat', subtitle: 'Chat con AI', icon: 'edit-3' },
  { key: 'ChatHistory', title: '3. Historial de chats', subtitle: 'Chats', icon: 'clock' },
  { key: 'Profile', title: '4. Perfil ', subtitle: 'Datos personales', icon: 'user' },
  { key: 'Spotify', title: '5. Spotify', subtitle: 'Paisajes sonoros y grounding', icon: 'music' },
  { key: 'Location', title: '6. Ubicación segura', subtitle: 'Espacios de paz y auxilio físico', icon: 'map-pin' },
  { key: 'Contacts', title: '7. Contactos de auxilio', subtitle: 'Numeros de confianza', icon: 'users' },
];

interface SideMenuProps {
  userName?: string;
  activeKey?: string;
  onNavigate?: (key: string) => void;
  onClose?: () => void;
}

export default function SideMenu({ userName = 'Mar', activeKey = 'Home', onNavigate, onClose }: SideMenuProps) {
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {SIDE_MENU_ITEMS.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.item, isActive && styles.itemActive]}
              onPress={() => onNavigate?.(item.key)}
            >
              <View style={styles.itemLeft}>
                <View style={[styles.itemIcon, isActive && styles.itemIconActive]}>
                  <Icon name={item.icon} size={16} color={isActive ? colors.primaryText : colors.primaryDark} />
                </View>
                <View>
                  <View style={styles.itemTitleRow}>
                    <Text style={[styles.itemTitle, isActive && styles.itemTitleActive]}>{item.title}</Text>
                    {item.badge ? (
                      <View style={styles.itemBadge}>
                        <Text style={styles.itemBadgeText}>{item.badge}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.itemSubtitle, isActive && styles.itemSubtitleActive]}>{item.subtitle}</Text>
                </View>
              </View>
              <Icon name="chevron-right" size={14} color={isActive ? colors.primaryText : colors.textSecondary} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.versionRow}>
          <Text style={styles.versionText}>LetDown v1.0</Text>
          <Text style={styles.versionText}>Cero juicios, a tu ritmo</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: spacing.xl,
  },
  headerLeft: { flexDirection: 'row', gap: spacing.sm, flex: 1 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  nameSeparator: { color: colors.textSecondary },
  badge: { ...typography.caption, color: colors.primaryDark },
  encryptionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  encryptionText: { ...typography.caption, color: colors.textSecondary },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceLavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { flex: 1 },
  listContent: { paddingHorizontal: spacing.md, gap: spacing.xs },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.xs,
  },
  itemActive: { backgroundColor: colors.primary },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceLavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconActive: { backgroundColor: 'rgba(95,80,140,0.2)' },
  itemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemTitle: { ...typography.label, color: colors.textPrimary },
  itemTitleActive: { color: colors.primaryText },
  itemBadge: { backgroundColor: colors.surfaceGreen, borderRadius: radii.pill, paddingHorizontal: 6, paddingVertical: 2 },
  itemBadgeText: { fontSize: 10, fontWeight: '700', color: colors.textGreen, letterSpacing: 0.6 },
  itemSubtitle: { ...typography.small, color: colors.textSecondary },
  itemSubtitleActive: { color: colors.primaryText, opacity: 0.9 },
  footer: { padding: spacing.md, backgroundColor: colors.surfaceMuted },
  crisisBox: { backgroundColor: '#FFDAD6', borderRadius: radii.md, padding: spacing.lg, gap: spacing.sm },
  crisisTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  crisisTitle: { ...typography.label, fontSize: 17, color: '#93000A' },
  crisisBody: { ...typography.small, color: '#93000A' },
  crisisActions: { flexDirection: 'row', gap: spacing.xs },
  crisisButton: { flex: 1, height: 40 },
  versionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.sm, paddingHorizontal: spacing.sm },
  versionText: { ...typography.caption, color: colors.textSecondary },
});
