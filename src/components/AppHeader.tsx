import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, radii, spacing, typography } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';

interface AppHeaderProps {
  onOpenMenu?: () => void;
}

export default function AppHeader({ onOpenMenu }: AppHeaderProps) {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <TouchableOpacity onPress={onOpenMenu} style={styles.menuButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="menu" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.logoDot} />
        <Text style={styles.brand}>LetDown</Text>
      </View>
      <View style={styles.right}>
        <TouchableOpacity style={styles.sosButton} onPress={() => Linking.openURL('tel:988')}>
          <Icon name="phone-call" size={14} color={colors.surface} />
          <Text style={styles.sosText}>988 SOS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarButton} onPress={() => navigation?.navigate?.('Profile')}>
          <Icon name="user" size={14} color={colors.surface} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(253,247,255,0.94)',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  menuButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  logoDot: { width: 24, height: 24, borderRadius: radii.pill, backgroundColor: colors.surfaceGreen },
  brand: { ...typography.h1, fontSize: 20, lineHeight: 28, color: colors.primaryDark },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: '#BA1A1A',
  },
  sosText: { ...typography.caption, color: colors.surface, letterSpacing: 0.6 },
  avatarButton: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
