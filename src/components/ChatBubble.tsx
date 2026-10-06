import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, radii, spacing, typography } from '../constants/theme';

interface ChatBubbleProps {
  from: 'ai' | 'user';
  text: string;
  time: string;
}

export default function ChatBubble({ from, text, time }: ChatBubbleProps) {
  const isAi = from === 'ai';
  return (
    <View style={[styles.row, isAi ? styles.rowAi : styles.rowUser]}>
      {isAi ? (
        <View style={styles.avatar}>
          <Icon name="feather" size={13} color={colors.textGreen} />
        </View>
      ) : null}
      <View style={[styles.bubble, isAi ? styles.bubbleAi : styles.bubbleUser]}>
        {isAi ? <Text style={styles.aiLabel}>LetDown AI</Text> : null}
        <Text style={isAi ? styles.textAi : styles.textUser}>{text}</Text>
        <Text style={isAi ? styles.timeAi : styles.timeUser}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: spacing.md, maxWidth: '90%' },
  rowAi: { alignSelf: 'flex-start', gap: spacing.sm },
  rowUser: { alignSelf: 'flex-end' },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  bubble: { borderRadius: radii.lg, padding: spacing.lg, flexShrink: 1 },
  bubbleAi: { backgroundColor: colors.surfaceLavender, borderTopLeftRadius: 2 },
  bubbleUser: { backgroundColor: colors.primary, borderTopRightRadius: 2 },
  aiLabel: { ...typography.caption, color: colors.primaryDark, marginBottom: spacing.xs },
  textAi: { ...typography.body, color: colors.textPrimary },
  textUser: { ...typography.body, color: colors.primaryText },
  timeAi: { ...typography.caption, color: colors.textSecondary, textAlign: 'right', marginTop: spacing.xs },
  timeUser: { ...typography.caption, color: 'rgba(252,245,255,0.8)', textAlign: 'right', marginTop: spacing.xs },
});
