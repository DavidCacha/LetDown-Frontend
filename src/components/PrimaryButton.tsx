import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, radii, shadow, typography } from '../constants/theme';

interface PrimaryButtonProps extends TouchableOpacityProps {
  label: string;
  icon?: string;
  variant?: 'primary' | 'danger' | 'neutral';
  loading?: boolean;
}

export default function PrimaryButton({
  label,
  icon,
  variant = 'primary',
  loading,
  style,
  disabled,
  ...rest
}: PrimaryButtonProps) {
  const backgroundColor =
    variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : colors.disabled;
  const textColor =
    variant === 'primary' ? colors.primaryText : variant === 'danger' ? colors.dangerText : colors.textPrimary;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || loading}
      style={[styles.base, { backgroundColor }, disabled && styles.disabled, style]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={16} color={textColor} style={styles.icon} /> : null}
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    ...shadow.button,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  label: {
    ...typography.label,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});
