import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AppHeader from '../../components/AppHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/api';
import { ChatSummary, chatService, getObjectiveLabel } from '../../services/chat';

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';

  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const time = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Hoy, ${time}`;
  if (isYesterday) return `Ayer, ${time}`;
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long' });
}

function tagColorsFor(objective: ChatSummary['objective']): { bg: string; color: string } {
  switch (objective) {
    case 'ANXIETY':
      return { bg: colors.surfacePurpleSoft, color: '#4C3D78' };
    case 'VENTING':
      return { bg: colors.surfaceLavender, color: colors.textPrimary };
    case 'SADNESS':
    case 'LONELINESS':
      return { bg: '#FFD9DD', color: '#301217' };
    default:
      return { bg: colors.surfaceGreen, color: colors.textGreen };
  }
}

export default function ChatHistoryScreen({ navigation }: any) {
  const { accessToken } = useAuth();

  const [search, setSearch] = useState('');
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadChats = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const result = await chatService.getMyChats(accessToken);
      setChats(result.chats);
    } catch (err) {
      Alert.alert(
        'No se pudo cargar tu historial',
        err instanceof ApiError ? err.message : 'Intenta de nuevo en un momento.',
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);


  const handleView = (chatId: string) => {
    navigation?.navigate?.('Chat', { viewChatId: chatId });
  };

  const handleDelete = (chat: ChatSummary) => {
    Alert.alert(
      'Eliminar conversación',
      'Esta acción no se puede deshacer. Se eliminará de forma permanente junto con todos sus mensajes.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (!accessToken) return;
            setDeletingId(chat.id);
            try {
              await chatService.deleteChat(accessToken, chat.id);
              setChats((prev) => prev.filter((c) => c.id !== chat.id));
            } catch (err) {
              Alert.alert(
                'No se pudo eliminar',
                err instanceof ApiError ? err.message : 'Intenta de nuevo en un momento.',
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  const filteredChats = chats.filter((c) => {
    if (!search.trim()) return true;
    const haystack = `${c.title ?? ''} ${c.lastMessage ?? ''} ${getObjectiveLabel(c.objective)}`.toLowerCase();
    return haystack.includes(search.trim().toLowerCase());
  });

  return (
    <View style={styles.screen}>
      <AppHeader onOpenMenu={() => navigation?.openDrawer?.()} />
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backLink} onPress={() => navigation?.navigate?.('NewChat')}>
          <Icon name="arrow-left" size={13} color={colors.primaryDark} />
          <Text style={styles.backLinkText}>Volver al chat</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Historial de refugio</Text>
        <Text style={styles.subtitle}>
          Tus reflexiones, ejercicios de calma y momentos de escucha guardados bajo cifrado seguro.
        </Text>

        <View style={styles.searchBar}>
          <Icon name="search" size={16} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar en tus reflexiones, temas o fechas..."
            placeholderTextColor={colors.textSecondary50}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primaryDark} />
            <Text style={styles.loadingText}>Cargando tu historial...</Text>
          </View>
        ) : filteredChats.length === 0 ? (
          <View style={styles.emptyCard}>
            <Icon name="message-circle" size={22} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              {chats.length === 0
                ? 'Todavía no tienes conversaciones guardadas.'
                : 'No encontramos conversaciones que coincidan con tu búsqueda.'}
            </Text>
          </View>
        ) : (
          filteredChats.map((chat) => {
            const tagColors = tagColorsFor(chat.objective);
            const isDeleting = deletingId === chat.id;
            return (
              <View key={chat.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.tag, { backgroundColor: tagColors.bg }]}>
                      <Text style={[styles.tagText, { color: tagColors.color }]}>
                        {getObjectiveLabel(chat.objective)}
                      </Text>
                    </View>
                    <Text style={styles.cardMeta}>
                      {formatDate(chat.updatedAt)} · {chat.messageCount} mensajes
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteIconButton}
                    disabled={isDeleting}
                    onPress={() => handleDelete(chat)}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color="#BA1A1A" />
                    ) : (
                      <Icon name="trash-2" size={15} color="#BA1A1A" />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardTitle}>
                  {chat.title || 'Conversación de acompañamiento'}
                </Text>
                {chat.lastMessage ? (
                  <Text style={styles.cardPreview} numberOfLines={2}>
                    <Text style={styles.cardPreviewBold}>
                      {chat.lastMessageSender === 'AI' ? 'LetDown AI: ' : 'Tú: '}
                    </Text>
                    {chat.lastMessage}
                  </Text>
                ) : (
                  <Text style={styles.cardPreview}>Aún no hay mensajes en esta conversación.</Text>
                )}
                <View style={styles.cardFooter}>
                  <TouchableOpacity style={styles.cardActionRow} onPress={() => handleView(chat.id)}>
                    <Text style={styles.cardAction}>Ver conversación</Text>
                    <Icon name="chevron-right" size={12} color={colors.primaryDark} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.md },
  backLinkText: { ...typography.label, color: colors.primaryDark },
  title: { ...typography.h1, color: colors.textPrimary, marginTop: spacing.sm },
  subtitle: { ...typography.small, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radii.pill, height: 48, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  searchInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: 'center', paddingVertical: spacing.xl },
  loadingText: { ...typography.small, color: colors.textSecondary },
  emptyCard: { alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.xl, marginBottom: spacing.lg },
  emptyText: { ...typography.small, color: colors.textSecondary, textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.lg, marginBottom: spacing.md, gap: spacing.xs },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1, flexWrap: 'wrap' },
  deleteIconButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  tag: { borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  tagText: { ...typography.caption, fontWeight: '600' },
  cardMeta: { ...typography.caption, color: colors.textSecondary },
  cardTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  cardPreview: { ...typography.small, color: colors.textSecondary },
  cardPreviewBold: { fontWeight: '700', color: colors.primaryDark },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.xs },
  cardFooterLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  cardFootText: { ...typography.caption, color: colors.textSecondary },
  cardActionRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  cardAction: { ...typography.caption, fontWeight: '600', color: colors.primaryDark },
});
