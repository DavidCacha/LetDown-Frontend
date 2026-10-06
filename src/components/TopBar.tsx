import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Chip from './Chip';
import { colors, spacing } from '../constants/theme';

interface TopBarProps {
  onBack?: () => void;
  onMenu?: () => void;
  rightChip?: string;
  title?: React.ReactNode;
}

export default function TopBar({ onBack, onMenu, rightChip, title }: TopBarProps) {
  return (
    <View style={styles.container}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.iconButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconButton} />
      )}
      {title}
      {rightChip ? (
        <Chip icon="shield" label={rightChip} tone="green" />
      ) : onMenu ? (
        <TouchableOpacity onPress={onMenu} style={styles.iconButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="menu" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  iconButton: {
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
