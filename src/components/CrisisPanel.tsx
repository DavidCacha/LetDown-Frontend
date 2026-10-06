import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import PrimaryButton from './PrimaryButton';
import { colors, radii, spacing, typography } from '../constants/theme';

export default function CrisisPanel() {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Icon name="heart" size={16} color={colors.dangerSoftText} />
        <Text style={styles.headerText}>¿Necesitas contención ahora mismo?</Text>
      </View>
      <Text style={styles.body}>
        No tienes que pasar por esto a solas. Hay especialistas listos para escucharte con empatía las 24 horas.
      </Text>
      <View style={styles.actions}>
        <PrimaryButton
          label="Llamar al 988"
          icon="phone"
          variant="danger"
          style={styles.smallButton}
          onPress={() => Linking.openURL('tel:988')}
        />
        <TouchableOpacity style={styles.textButton}>
          <Icon name="message-square" size={15} color={colors.textPrimary} />
          <Text style={styles.textButtonLabel}>Texto de Crisis</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceLavender,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    ...typography.caption,
    color: colors.dangerSoftText,
    marginLeft: 6,
  },
  body: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    width: '100%',
  },
  smallButton: {
    flex: 1,
    height: 44,
  },
  textButton: {
    flex: 1,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.disabled,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  textButtonLabel: {
    ...typography.caption,
    color: colors.textPrimary,
  },
});
