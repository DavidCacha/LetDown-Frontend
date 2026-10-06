import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, radii, spacing, typography } from '../constants/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  helperText?: string;
  icon?: string;
  secure?: boolean;
  topRight?: React.ReactNode;

  error?: boolean;
  errorMessage?: string;
}

export default function TextField({
  label,
  helperText,
  icon,
  secure,
  topRight,
  style,
  error = false,
  errorMessage,
  ...rest
}: TextFieldProps) {
  const [hidden, setHidden] = useState(!!secure);

  return (
    <View style={styles.wrapper}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {topRight}
        </View>
      ) : null}
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            error && styles.inputError,
            style,
          ]}
          placeholderTextColor={colors.textSecondary50}
          secureTextEntry={secure ? hidden : false}
          {...rest}
        />

        {secure ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setHidden((h) => !h)}
          >
            <Icon
              name={hidden ? 'eye' : 'eye-off'}
              size={18}
              color={error ? '#BA1A1A' : colors.textSecondary}
            />
          </TouchableOpacity>
        ) : icon ? (
          <View style={styles.iconButton}>
            <Icon
              name={icon}
              size={18}
              color={error ? '#BA1A1A' : colors.textSecondary}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.errorContainer}>
        <Text
          style={[
            styles.errorText,
            !error && styles.errorHidden,
          ]}
        >
          {errorMessage || ' '}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputError: {
    borderWidth: 1,
    borderColor: '#BA1A1A',
  },
  errorContainer: {
    height: 24,
    justifyContent: 'center',
  },

  errorText: {
    ...typography.small,
    color: '#BA1A1A',
  },

  errorHidden: {
    opacity: 0,
  },
  wrapper: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  helper: {
    ...typography.small,
    color: colors.textSecondary80,
    marginBottom: spacing.xs,
  },
  inputRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: radii.md,
    height: 48,
    paddingHorizontal: spacing.lg,
    paddingRight: 44,
    fontSize: 15,
    color: colors.textPrimary,
  },
  iconButton: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
