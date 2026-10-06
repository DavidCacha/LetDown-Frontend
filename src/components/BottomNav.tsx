import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, typography } from '../constants/theme';

const TABS = [
  { key: 'Home', label: 'Inicio', icon: 'home' },
  { key: 'Chat', label: 'Chat IA', icon: 'message-circle' },
  { key: 'Location', label: 'Ubicación Segura', icon: 'map-pin' },
  { key: 'Profile', label: 'Perfil', icon: 'user' },
] as const;

interface BottomNavProps {
  active: string;
  onPress: (key: string) => void;
}

export default function BottomNav({ active, onPress }: BottomNavProps) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => onPress(tab.key)}>
            <Icon name={tab.icon} size={20} color={isActive ? colors.primaryDark : colors.textSecondary} />
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(253,247,255,0.94)',
  },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  label: { ...typography.caption, color: colors.textSecondary },
  labelActive: { color: colors.primaryDark },
});
