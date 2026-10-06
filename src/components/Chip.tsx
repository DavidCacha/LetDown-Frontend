import React from 'react';
import { StyleSheet, Text, View, ViewStyle  } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, radii, typography } from '../constants/theme';

interface ChipProps {
  icon?: string;
  label: string;
  tone?: 'green' | 'lavender' | 'neutral';
  style?: ViewStyle;
}

export default function Chip({ icon, label, tone = 'green', style }: ChipProps) {
  const background =
    tone === 'green' ? colors.surfaceGreenSoft : tone === 'lavender' ? colors.surfaceLavender : colors.surfaceMuted;
  const textColor = tone === 'green' ? colors.textGreen : colors.textSecondary;

  return (
    <View style={[styles.chip, { backgroundColor: background },style]}>
      {icon ? <Icon name={icon} size={12} color={textColor} style={styles.icon} /> : null}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    ...typography.caption,
    flexShrink: 1,
  },
});
