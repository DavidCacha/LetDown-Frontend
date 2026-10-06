import React, { useEffect, useRef, useState } from 'react';
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
import ChatBubble from '../../components/ChatBubble';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/api';
import {
  ChatMessage,
  ChatObjective,
  GOAL_TO_OBJECTIVE,
  INTENTION_TO_OBJECTIVE,
  ResponseTone,
  chatService,
  getObjectiveLabel,
} from '../../services/chat';


const USE_BACKEND = false;

type ChatStatus = 'empty' | 'active' | 'finished' | 'viewing';

const SUGGESTIONS = ['Necesito calmarme', 'Me siento triste', 'Solo quiero desahogarme', 'Tengo miedo'];

const INTENTIONS = [
  { key: 'venting', icon: 'smile', label: 'Desahogarme', hint: 'Soltar todo el peso', iconBg: colors.surfaceGreen, iconColor: colors.textGreen },
  { key: 'anxiety', icon: 'wind', label: 'Calmar ansiedad', hint: 'Respiración y anclaje', iconBg: colors.surfacePurpleSoft, iconColor: colors.primaryDark },
  { key: 'organize', icon: 'shuffle', label: 'Organizar ideas', hint: 'Estructurar la mente', iconBg: colors.disabled, iconColor: colors.textPrimary },
  { key: 'company', icon: 'heart', label: 'Solo compañía', hint: 'Estar en silencio o charlar', iconBg: '#FFD9DD', iconColor: colors.dangerSoftText },
];

const MOODS = [
  { key: 'relieved', emoji: '🌿', label: 'Aliviado' },
  { key: 'better', emoji: '✨', label: 'Mejor' },
  { key: 'same', emoji: '🌾', label: 'Igual' },
  { key: 'overwhelmed', emoji: '🌧️', label: 'Aún abrumado' },
];


const LOCAL_REPLIES: Record<string, string[]> = {
  VENTING: [
    'Te escucho. Aquí puedes soltar todo lo que llevas cargando, sin que nadie te juzgue. ¿Qué es lo que más pesa hoy?',
    'Gracias por confiarme esto. A veces solo necesitamos decirlo en voz alta para que pese un poco menos. Sigo aquí.',
  ],
  ANXIETY: [
    'Respira conmigo un momento: inhala 4 segundos, sostén 4, exhala 4. Estoy aquí contigo mientras se calma un poco esa sensación.',
    'La ansiedad puede sentirse enorme, pero no estás sola/o en esto. ¿Qué es lo que tu mente no deja de repetir?',
  ],
  SADNESS: [
    'Siento mucho que estés pasando por esto. Tu tristeza es válida, y no tienes que cargarla sola/o.',
    'Está bien no estar bien. Estoy aquí, acompañándote en esto, sin prisas.',
  ],
  OTHER: [
    'A veces ordenar los pensamientos en voz alta ayuda a ver todo con más claridad. Cuéntame qué es lo que más se siente enredado.',
    'Vamos paso a paso. ¿Cuál dirías que es la idea que más vueltas te está dando en este momento?',
  ],
  LONELINESS: [
    'Estoy aquí contigo, no necesitas estar sola/o con esto. ¿Quieres contarme cómo ha sido tu día?',
    'A veces la compañía no necesita muchas palabras. Aquí estoy, tómate tu tiempo.',
  ],
  DEFAULT: [
    'Gracias por compartir eso conmigo. Estoy aquí para escucharte, sin prisas y sin juicios.',
    'Entiendo. Cuéntame un poco más de cómo te sientes con eso.',
    'Eso suena importante. ¿Cómo te está afectando en tu día a día?',
    'Aquí estoy contigo. Tómate el tiempo que necesites para poner esto en palabras.',
  ],
};

const GUIDED_SUFFIXES = [
  ' Hagamos un ejercicio juntos: inhala en 4 segundos, sostén 4, exhala en 4. Repítelo 3 veces conmigo.',
  ' Prueba esto: nombra 5 cosas que puedas ver a tu alrededor ahora mismo. Te ayuda a anclarte al presente.',
];

const REFLECTIVE_QUESTIONS = [
  '¿Qué crees que hay detrás de esa sensación?',
  '¿Desde cuándo te acompaña esto?',
  '¿Qué necesitarías escuchar ahora mismo?',
];

function pickLocalReply(objective: ChatObjective | null | undefined, tone: ResponseTone | null | undefined): string {
  const pool = (objective && LOCAL_REPLIES[objective]) || LOCAL_REPLIES.DEFAULT;
  const combined = objective ? [...pool, ...LOCAL_REPLIES.DEFAULT] : pool;
  let reply = combined[Math.floor(Math.random() * combined.length)];

  if (tone === 'guided') {
    reply += GUIDED_SUFFIXES[Math.floor(Math.random() * GUIDED_SUFFIXES.length)];
  } else if (tone === 'reflective') {
    if (!reply.trim().endsWith('?')) {
      reply += ' ' + REFLECTIVE_QUESTIONS[Math.floor(Math.random() * REFLECTIVE_QUESTIONS.length)];
    }
  } else if (tone === 'silent') {
    const withoutTrailingQuestion = reply.replace(/\s*[^.!]*\?\s*$/, '').trim();
    reply = withoutTrailingQuestion || reply;
  }

  return reply;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function formatTime(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return 'No se pudo conectar con el servidor. Intenta de nuevo.';
}

function makeLocalId() {
  return `local-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export default function ChatScreen({ navigation, route }: any) {
  const { accessToken } = useAuth();

  const [status, setStatus] = useState<ChatStatus>('empty');
  const [chatId, setChatId] = useState<string | null>(null);
  const [objective, setObjective] = useState<ChatObjective | null>(null);
  const [responseTone, setResponseTone] = useState<ResponseTone | null>(null);
  const [objectiveLabel, setObjectiveLabel] = useState(getObjectiveLabel(null));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');

  const [loadingChat, setLoadingChat] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [sending, setSending] = useState(false);

  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [endedAt, setEndedAt] = useState<Date | null>(null);

  const [breathState, setBreathState] = useState<'idle' | 'inhale' | 'exhale'>('idle');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);


  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [savedChatId, setSavedChatId] = useState<string | null>(null);

 
  const consumedParamsRef = useRef<string | null>(null);

  useEffect(() => {
    const existingChatId = route?.params?.chatId;
    if (USE_BACKEND && existingChatId && existingChatId !== chatId) {
      loadExistingChat(existingChatId);
    }
  }, [route?.params?.chatId]);


  useEffect(() => {
    const { objectiveKey, toneKey, icebreaker } = route?.params || {};
    if (!objectiveKey) return;

    const paramsSignature = `${objectiveKey}|${toneKey || ''}|${icebreaker || ''}`;
    if (consumedParamsRef.current === paramsSignature) return;
    consumedParamsRef.current = paramsSignature;

    const resolvedObjective = GOAL_TO_OBJECTIVE[objectiveKey] ?? null;
    const resolvedTone = (toneKey as ResponseTone) ?? null;

    startConversation(undefined, resolvedObjective, resolvedTone).then((newChatId) => {
      if (icebreaker && newChatId) {
        sendText(icebreaker, newChatId, resolvedObjective, resolvedTone);
      }
    });
  }, [route?.params?.objectiveKey, route?.params?.toneKey, route?.params?.icebreaker]);

  const viewingParamsRef = useRef<string | null>(null);

  useEffect(() => {
    const viewChatId = route?.params?.viewChatId;
    if (!viewChatId) return;
    if (viewingParamsRef.current === viewChatId) return;
    viewingParamsRef.current = viewChatId;
    loadChatForViewing(viewChatId);
  }, [route?.params?.viewChatId]);

  const loadChatForViewing = async (id: string) => {
    if (!accessToken) return;
    setLoadingChat(true);
    try {
      const result = await chatService.getMessages(accessToken, id);
      setChatId(result.chat.id);
      setMessages(result.messages);
      setObjective(result.chat.objective);
      setObjectiveLabel(getObjectiveLabel(result.chat.objective));
      setStatus('viewing');
    } catch (err) {
      Alert.alert('No se pudo abrir la conversación', errorMessage(err));
      navigation?.goBack?.();
    } finally {
      setLoadingChat(false);
    }
  };

  const loadExistingChat = async (id: string) => {
    if (!accessToken) return;
    setLoadingChat(true);
    try {
      const result = await chatService.getMessages(accessToken, id);
      setChatId(result.chat.id);
      setMessages(result.messages);
      setObjective(result.chat.objective);
      setObjectiveLabel(getObjectiveLabel(result.chat.objective));
      setStartedAt(new Date());
      setStatus('active');
    } catch (err) {
      Alert.alert('No se pudo abrir la conversación', errorMessage(err));
    } finally {
      setLoadingChat(false);
    }
  };


  const startConversation = async (
    intentionKey?: string,
    explicitObjective?: ChatObjective | null,
    explicitTone?: ResponseTone | null,
  ): Promise<string | null> => {
    if (creatingChat) return null;
    const resolvedObjective: ChatObjective | undefined =
      explicitObjective ?? (intentionKey ? INTENTION_TO_OBJECTIVE[intentionKey] : undefined);

    if (!USE_BACKEND) {
      const newChatId = makeLocalId();
      setChatId(newChatId);
      setObjective(resolvedObjective ?? null);
      setResponseTone(explicitTone ?? null);
      setMessages([]);
      setObjectiveLabel(getObjectiveLabel(resolvedObjective ?? null));
      setStartedAt(new Date());
      setEndedAt(null);
      setSelectedMood(null);
      setStatus('active');
      return newChatId;
    }

    if (!accessToken) return null;
    setCreatingChat(true);
    try {
      const result = await chatService.createChat(accessToken, { objective: resolvedObjective });
      setChatId(result.chat.id);
      setObjective(result.chat.objective);
      setResponseTone(explicitTone ?? null);
      setMessages([]);
      setObjectiveLabel(getObjectiveLabel(result.chat.objective));
      setStartedAt(new Date());
      setEndedAt(null);
      setSelectedMood(null);
      setStatus('active');
      return result.chat.id;
    } catch (err) {
      Alert.alert('No se pudo iniciar', errorMessage(err));
      return null;
    } finally {
      setCreatingChat(false);
    }
  };


  const sendText = async (
    text: string,
    currentChatId?: string | null,
    currentObjective?: ChatObjective | null,
    currentTone?: ResponseTone | null,
  ) => {
    const trimmed = text.trim();
    const targetChatId = currentChatId ?? chatId;
    const targetObjective = currentChatId !== undefined ? currentObjective ?? null : objective;
    const targetTone = currentChatId !== undefined ? currentTone ?? null : responseTone;
    if (!trimmed || !targetChatId || sending) return;

    setSending(true);

    const userMessage: ChatMessage = {
      id: makeLocalId(),
      chatId: targetChatId,
      sender: 'USER',
      message: trimmed,
      riskLevel: 'NONE',
      metadata: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    if (!USE_BACKEND) {
      try {
        await wait(900 + Math.random() * 900);
        const aiMessage: ChatMessage = {
          id: makeLocalId(),
          chatId: targetChatId,
          sender: 'AI',
          message: pickLocalReply(targetObjective, targetTone),
          riskLevel: 'NONE',
          metadata: null,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } finally {
        setSending(false);
      }
      return;
    }

    if (!accessToken) {
      setSending(false);
      return;
    }
    const optimisticId = userMessage.id;
    try {
      const result = await chatService.sendMessage(accessToken, targetChatId, { message: trimmed });
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticId),
        result.userMessage,
        result.aiMessage,
      ]);
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setMessage(trimmed);
      Alert.alert('No se pudo enviar tu mensaje', errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleSend = async () => {
    const text = message.trim();
    if (!text) return;
    setMessage('');
    await sendText(text);
  };

  const persistConversationToBackend = async (
    allMessages: ChatMessage[],
    objectiveToSave: ChatObjective | null,
  ) => {
    if (!accessToken) {
      setSaveStatus('error');
      return;
    }
    setSaveStatus('saving');
    try {
      const created = await chatService.createChat(accessToken, {
        objective: objectiveToSave ?? undefined,
      });
      const backendChatId = created.chat.id;
      const userMessages = allMessages.filter((m) => m.sender === 'USER');
      for (const userMsg of userMessages) {

        await chatService.sendMessage(accessToken, backendChatId, { message: userMsg.message });
      }
      setSavedChatId(backendChatId);
      setSaveStatus('saved');
    } catch (err) {
      console.log('[persistConversationToBackend] ERROR:', err);
      setSaveStatus('error');
    }
  };

  const handleExit = () => {
    setEndedAt(new Date());
    setStatus('finished');
    persistConversationToBackend(messages, objective);
  };

  const handleRetrySave = () => {
    persistConversationToBackend(messages, objective);
  };

  const handleBreathe = () => {
    if (breathState !== 'idle') return;
    setBreathState('inhale');
    setTimeout(() => setBreathState('exhale'), 3000);
    setTimeout(() => setBreathState('idle'), 6000);
  };

  const durationLabel = (() => {
    if (!endedAt) return null;
    const minutes = startedAt
      ? Math.max(1, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000))
      : null;
    const time = formatTime(endedAt.toISOString());
    return minutes ? `Duración: ${minutes} min • Hoy a las ${time}` : `Hoy a las ${time}`;
  })();

  if (status === 'empty') {
    return (
      <View style={styles.screen}>
        <AppHeader onOpenMenu={() => navigation?.openDrawer?.()} />
        <ScrollView contentContainerStyle={styles.emptyContent}>
          <View style={styles.emptyTopBar}>
            <TouchableOpacity style={styles.roundBackButton} onPress={() => navigation?.goBack?.()}>
              <Icon name="arrow-left" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.restingPill}>
              <View style={styles.restingDot} />
              <Text style={styles.restingText}>LetDown AI • En reposo</Text>
            </View>
            <View style={styles.encryptedChipLight}>
              <Icon name="lock" size={11} color={colors.textGreen} />
              <Text style={styles.encryptedChipLightText}>100% Cifrado</Text>
            </View>
          </View>

          <View style={styles.havenCard}>
            <View style={styles.havenBadgeWrap}>
              <View style={styles.havenBadgeOuter}>
                <View style={styles.havenBadgeInner}>
                  <Icon name="feather" size={30} color={colors.primaryDark} />
                </View>
              </View>
              <View style={styles.peaceTag}>
                <Icon name="wind" size={11} color={colors.textGreen} />
                <Text style={styles.peaceTagText}>Paz</Text>
              </View>
            </View>

            <Text style={styles.havenTitle}>Espacio seguro de escucha</Text>
            <Text style={styles.havenBody}>
              Tómate tu tiempo. Cuando estés listo o lista, presiona el botón para comenzar a hablar sin juicios, a tu
              ritmo y en completa privacidad.
            </Text>

            <PrimaryButton
              label={creatingChat ? 'Iniciando...' : 'Iniciar conversación'}
              icon="message-circle"
              variant="primary"
              loading={creatingChat}
              style={styles.startButton}
              onPress={() => startConversation()}
            />
            <View style={styles.availabilityRow}>
              <Icon name="shield" size={13} color={colors.textGreen} />
              <Text style={styles.availabilityText}>Disponible 24/7 • Respuestas empáticas guiadas</Text>
            </View>
          </View>

          <View style={styles.intentionsHeader}>
            <Text style={styles.intentionsHeaderLabel}>O EMPIEZA CON UNA INTENCIÓN</Text>
            <View style={styles.noPressureRow}>
              <Icon name="feather" size={12} color={colors.textGreen} />
              <Text style={styles.noPressureText}>Sin presiones</Text>
            </View>
          </View>

          <View style={styles.intentionsGrid}>
            {INTENTIONS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.intentionCard}
                disabled={creatingChat}
                onPress={() => startConversation(item.key)}
              >
                <View style={[styles.intentionIcon, { backgroundColor: item.iconBg }]}>
                  <Icon name={item.icon} size={16} color={item.iconColor} />
                </View>
                <Text style={styles.intentionLabel}>{item.label}</Text>
                <Text style={styles.intentionHint}>{item.hint}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.presenceCard}>
            <View style={styles.presenceLeft}>
              <View style={styles.presenceIcon}>
                <Icon name="activity" size={18} color={colors.textGreen} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.presenceTitle}>Toma una respiración profunda</Text>
                <Text style={styles.presenceSubtitle}>Inhala en 4 segundos, exhala en 4</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.pauseButton} onPress={handleBreathe}>
              <Text style={styles.pauseButtonText}>
                {breathState === 'idle' ? 'Pausa' : breathState === 'inhale' ? 'Inhala...' : 'Exhala...'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.crisisCalloutCard}>
            <View style={styles.crisisCalloutLeft}>
              <View style={styles.crisisCalloutIcon}>
                <Icon name="phone" size={18} color={colors.surface} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.crisisCalloutTitle}>¿Necesitas apoyo humano?</Text>
                <Text style={styles.crisisCalloutSubtitle}>Línea de Crisis 988 siempre lista</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.sosPill} onPress={() => Linking.openURL('tel:988')}>
              <Text style={styles.sosPillText}>988 SOS</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (status === 'viewing') {
    return (
      <View style={styles.screen}>
        <AppHeader onOpenMenu={() => navigation?.openDrawer?.()} />

        <View style={styles.subHeader}>
          <View style={styles.subHeaderLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation?.navigate?.('ChatHistory')}
            >
              <Icon name="arrow-left" size={16} color={colors.textPrimary} />
            </TouchableOpacity>
            <View>
              <View style={styles.avatarWrap}>
                <Icon name="feather" size={18} color={colors.textGreen} />
              </View>
            </View>
            <View>
              <View style={styles.titleRow}>
                <Text style={styles.title}>LetDown AI</Text>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>Solo lectura</Text>
                </View>
              </View>
              <Text style={styles.statusText}>{objectiveLabel}</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.messages} contentContainerStyle={styles.messagesContent}>
          {loadingChat ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primaryDark} />
              <Text style={styles.loadingText}>Cargando conversación...</Text>
            </View>
          ) : messages.length ? (
            messages.map((m) => (
              <ChatBubble
                key={m.id}
                from={m.sender === 'AI' ? 'ai' : 'user'}
                time={formatTime(m.createdAt)}
                text={m.message}
              />
            ))
          ) : (
            <Text style={styles.emptyRecapText}>No hubo mensajes en esta sesión.</Text>
          )}
        </ScrollView>

        <View style={styles.viewingFootnote}>
          <Icon name="lock" size={12} color={colors.textSecondary} />
          <Text style={styles.footnoteText}>Conversación cerrada — solo puedes consultarla.</Text>
        </View>
      </View>
    );
  }

  if (status === 'finished') {
    const recap = messages.slice(-3);
    return (
      <View style={styles.screen}>
        <AppHeader onOpenMenu={() => navigation?.openDrawer?.()} />
        <ScrollView contentContainerStyle={styles.finishedContent}>
          <View style={styles.finishedSubHeader}>
            <View style={styles.finishedSubHeaderLeft}>
              <TouchableOpacity style={styles.smallBackButton} onPress={() => navigation?.goBack?.()}>
                <Icon name="arrow-left" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
              <View>
                <Text style={styles.finishedTitle}>LetDown AI</Text>
                <Text style={styles.finishedSubtitle}>Sesión de apoyo finalizada</Text>
              </View>
            </View>
            <View style={styles.closedPill}>
              <Icon name="check-circle" size={13} color={colors.textGreen} />
              <Text style={styles.closedPillText}>Cerrada</Text>
            </View>
          </View>

          <View style={styles.dimmedHistory}>
            {recap.length ? (
              recap.map((m) => (
                <ChatBubble
                  key={m.id}
                  from={m.sender === 'AI' ? 'ai' : 'user'}
                  time={formatTime(m.createdAt)}
                  text={m.message}
                />
              ))
            ) : (
              <Text style={styles.emptyRecapText}>No hubo mensajes en esta sesión.</Text>
            )}
          </View>

         

          <View style={styles.closureCard}>
            <View style={styles.closureEmblem}>
              <Icon name="feather" size={26} color={colors.textGreen} />
            </View>
            <Text style={styles.closureTitle}>Conversación finalizada</Text>
            {durationLabel ? (
              <View style={styles.durationPill}>
                <Icon name="clock" size={12} color={colors.textGreen} />
                <Text style={styles.durationPillText}>{durationLabel}</Text>
              </View>
            ) : null}
            <Text style={styles.closureBody}>
              Has completado esta sesión de acompañamiento. Esperamos que sientas un poco más de calma y espacio
              interior. Recuerda respirar y honrar tu proceso.
            </Text>

            <View style={styles.moodCard}>
              <View style={styles.moodCardHeader}>
                <Text style={styles.moodCardTitle}>¿Cómo te sientes ahora?</Text>
                <Text style={styles.moodCardStatus}>
                  {selectedMood ? `Registrado: ${MOODS.find((m) => m.key === selectedMood)?.label}` : 'Selecciona'}
                </Text>
              </View>
              <Text style={styles.moodCardHint}>
                Tu bienestar después de cada pausa nos ayuda a cuidar este espacio contigo.
              </Text>
              <View style={styles.moodGrid}>
                {MOODS.map((mood) => {
                  const selected = selectedMood === mood.key;
                  return (
                    <TouchableOpacity
                      key={mood.key}
                      style={[styles.moodChip, selected && styles.moodChipSelected]}
                      onPress={() => setSelectedMood(mood.key)}
                    >
                      <Text>{mood.emoji}</Text>
                      <Text style={[styles.moodChipText, selected && styles.moodChipTextSelected]}>
                        {mood.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <PrimaryButton
              label="Iniciar nueva conversación"
              icon="plus-circle"
              variant="primary"
              style={styles.closureButton}
              onPress={() => {
                setChatId(null);
                setMessages([]);
                setSelectedMood(null);
                setStartedAt(null);
                setEndedAt(null);
                setObjective(null);
                setResponseTone(null);
                setSaveStatus('idle');
                setSavedChatId(null);
                setStatus('empty');
              }}
            />
            <PrimaryButton
              label="Guardar resumen en Historial"
              icon="save"
              variant="neutral"
              style={styles.closureButton}
              onPress={() => navigation?.navigate?.('ChatHistory')}
            />
            <TouchableOpacity style={styles.backHomeButton} onPress={() => navigation?.navigate?.('Home')}>
              <Text style={styles.backHomeText}>Volver al Inicio</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.groundingResourceCard}>
            <View style={styles.groundingResourceLeft}>
              <View style={styles.groundingResourceIcon}>
                <Icon name="activity" size={18} color={colors.primaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.groundingResourceTitle}>Práctica de respiración 4-7-8</Text>
                <Text style={styles.groundingResourceSubtitle}>Ideal para después de una descarga emocional</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.groundingResourceButton}>
              <Text style={styles.groundingResourceButtonText}>Iniciar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.concludedBanner}>
            <View style={styles.concludedBannerLeft}>
              <Icon name="lock" size={16} color={colors.textSecondary} />
              <Text style={styles.concludedBannerText}>
                Esta conversación ha concluido. Puedes iniciar una nueva en cualquier momento.
              </Text>
            </View>
            <TouchableOpacity style={styles.newMessageLink} onPress={() => setStatus('active')}>
              <Text style={styles.newMessageLinkText}>Escribir nuevo mensaje</Text>
              <Icon name="arrow-right" size={14} color={colors.primaryDark} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AppHeader onOpenMenu={() => navigation?.openDrawer?.()} />

      <View style={styles.subHeader}>
        <View style={styles.subHeaderLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
            <Icon name="arrow-left" size={16} color={colors.textPrimary} />
          </TouchableOpacity>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>LetDown AI</Text>
              <View style={styles.pill}>
                <Text style={styles.pillText}>Psicológico</Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Escucha activa y segura</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
          <Text style={styles.exitText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.goalBanner}>
        <View style={styles.goalLeft}>
          <Icon name="target" size={14} color={colors.textPrimary} />
          <Text style={styles.goalText}>
            <Text style={styles.goalBold}>Objetivo: </Text>
            {objectiveLabel}
          </Text>
        </View>
        <View style={styles.encryptedChip}>
          <Icon name="lock" size={11} color={colors.textGreen} />
          <Text style={styles.encryptedText}>Cifrado 100%</Text>
        </View>
      </View>

      <ScrollView style={styles.messages} contentContainerStyle={styles.messagesContent}>
        {loadingChat ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primaryDark} />
            <Text style={styles.loadingText}>Cargando conversación...</Text>
          </View>
        ) : null}

        {messages.map((m) => (
          <ChatBubble
            key={m.id}
            from={m.sender === 'AI' ? 'ai' : 'user'}
            time={formatTime(m.createdAt)}
            text={m.message}
          />
        ))}

        {sending ? (
          <View style={styles.typingRow}>
            <View style={styles.typingAvatar}>
              <Icon name="feather" size={13} color={colors.textGreen} />
            </View>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color={colors.primaryDark} />
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.inputDock}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {SUGGESTIONS.map((s) => (
            <TouchableOpacity key={s} style={styles.chip} onPress={() => setMessage(s)}>
              <Text style={styles.chipText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.micButton}>
            <Icon name="mic" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Escribe cómo te sientes... sin juicios"
            placeholderTextColor={colors.textSecondary50}
            value={message}
            onChangeText={setMessage}
            multiline
            editable={!sending}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={sending || !message.trim()}>
            {sending ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <Icon name="send" size={16} color={colors.surface} />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.footnoteRow}>
          <Icon name="shield" size={11} color={colors.textSecondary} />
          <Text style={styles.footnoteText}>Sanctuary es tu refugio confidencial. Respira a tu ritmo.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  emptyContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  emptyTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  roundBackButton: { width: 40, height: 40, borderRadius: radii.pill, backgroundColor: colors.surfaceLavender, alignItems: 'center', justifyContent: 'center' },
  restingPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surfaceGreenSoft, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  restingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textGreen },
  restingText: { ...typography.caption, color: colors.textGreen },
  encryptedChipLight: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  encryptedChipLightText: { ...typography.caption, color: colors.textSecondary },

  havenCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.xl, alignItems: 'center', ...shadowCard() },
  havenBadgeWrap: { alignItems: 'center', marginBottom: spacing.sm },
  havenBadgeOuter: { width: 96, height: 96, borderRadius: radii.pill, backgroundColor: colors.surfacePurpleSoft, alignItems: 'center', justifyContent: 'center' },
  havenBadgeInner: { width: 72, height: 72, borderRadius: radii.pill, backgroundColor: colors.surfaceGreenSoft, alignItems: 'center', justifyContent: 'center' },
  peaceTag: { position: 'absolute', top: -4, right: -8, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceGreen, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  peaceTagText: { ...typography.caption, color: colors.textGreen },
  havenTitle: { ...typography.h1, color: colors.textPrimary, textAlign: 'center', marginTop: spacing.xs },
  havenBody: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, maxWidth: 280 },
  startButton: { marginTop: spacing.lg },
  availabilityRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  availabilityText: { ...typography.caption, color: colors.textSecondary },

  intentionsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs, paddingHorizontal: spacing.xs },
  intentionsHeaderLabel: { ...typography.caption, color: colors.textSecondary, letterSpacing: 0.6 },
  noPressureRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  noPressureText: { ...typography.caption, color: colors.textGreen },
  intentionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  intentionCard: { flexBasis: '47%', flexGrow: 1, backgroundColor: colors.surfaceMuted, borderRadius: radii.lg, padding: spacing.md, gap: 4 },
  intentionIcon: { width: 32, height: 32, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  intentionLabel: { ...typography.label, color: colors.textPrimary },
  intentionHint: { ...typography.small, color: colors.textSecondary },

  presenceCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, gap: spacing.sm },
  presenceLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  presenceIcon: { width: 40, height: 40, borderRadius: radii.pill, backgroundColor: colors.surfaceGreen, alignItems: 'center', justifyContent: 'center' },
  presenceTitle: { ...typography.label, color: colors.textPrimary },
  presenceSubtitle: { ...typography.small, color: colors.textSecondary },
  pauseButton: { backgroundColor: colors.surfaceLavender, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  pauseButtonText: { ...typography.label, color: colors.primaryDark },

  crisisCalloutCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFD9DD', borderRadius: radii.lg, padding: spacing.md, gap: spacing.sm },
  crisisCalloutLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  crisisCalloutIcon: { width: 40, height: 40, borderRadius: radii.pill, backgroundColor: '#BA1A1A', alignItems: 'center', justifyContent: 'center' },
  crisisCalloutTitle: { ...typography.label, fontSize: 15, color: '#301217' },
  crisisCalloutSubtitle: { ...typography.small, color: '#623C42' },
  sosPill: { backgroundColor: '#BA1A1A', borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  sosPillText: { ...typography.label, color: colors.surface },

  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  subHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backButton: { width: 36, height: 36, borderRadius: radii.pill, backgroundColor: colors.surfaceLavender, alignItems: 'center', justifyContent: 'center' },
  avatarWrap: { width: 40, height: 40, borderRadius: radii.pill, backgroundColor: colors.surfaceGreen, alignItems: 'center', justifyContent: 'center' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.textGreen, borderWidth: 2, borderColor: colors.background },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  pill: { backgroundColor: colors.surfaceGreen, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  pillText: { ...typography.caption, color: colors.textGreen },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textGreen },
  statusText: { ...typography.caption, color: colors.textGreen },
  exitButton: { backgroundColor: colors.surfaceLavender, borderRadius: radii.pill, paddingHorizontal: spacing.md, height: 32, justifyContent: 'center' },
  exitText: { ...typography.caption, color: colors.textSecondary },
  goalBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceMuted, marginHorizontal: spacing.lg, borderRadius: radii.md, padding: spacing.sm },
  goalLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  goalText: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  goalBold: { fontWeight: '700', color: colors.textPrimary },
  encryptedChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  encryptedText: { ...typography.caption, color: colors.textGreen },
  messages: { flex: 1 },
  messagesContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: 'center', paddingVertical: spacing.lg },
  loadingText: { ...typography.small, color: colors.textSecondary },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  typingAvatar: { width: 28, height: 28, borderRadius: radii.pill, backgroundColor: colors.surfaceGreen, alignItems: 'center', justifyContent: 'center' },
  typingBubble: { backgroundColor: colors.surfaceLavender, borderRadius: radii.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  groundingCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.md, marginBottom: spacing.md, marginLeft: 36 },
  groundingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  groundingHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  groundingIcon: { width: 36, height: 36, borderRadius: radii.md, backgroundColor: colors.surfaceGreen, alignItems: 'center', justifyContent: 'center' },
  groundingTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary },
  groundingSubtitle: { ...typography.caption, color: colors.textSecondary },
  recommendedTag: { backgroundColor: colors.surfaceLavender, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  recommendedText: { ...typography.caption, color: colors.primaryDark },
  breathingCircleWrap: { alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surfaceMuted, borderRadius: radii.md, paddingVertical: spacing.lg },
  breathingCircle: { width: 64, height: 64, borderRadius: radii.pill, backgroundColor: colors.surfaceGreen, alignItems: 'center', justifyContent: 'center' },
  breathingText: { ...typography.caption, color: colors.textGreen, fontWeight: '600' },
  breathingCaption: { ...typography.small, color: colors.textSecondary },
  groundingButton: { marginTop: 0 },
  crisisCard: { backgroundColor: '#FFD9DD', borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm, marginBottom: spacing.md },
  crisisHeader: { flexDirection: 'row', gap: spacing.sm },
  crisisIcon: { width: 32, height: 32, borderRadius: radii.pill, backgroundColor: '#BA1A1A', alignItems: 'center', justifyContent: 'center' },
  crisisTextWrap: { flex: 1 },
  crisisTitle: { ...typography.label, fontSize: 17, color: '#301217' },
  crisisBody: { ...typography.small, color: '#623C42', marginTop: 2 },
  crisisButton: { marginTop: 0 },
  inputDock: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm },
  chipsRow: { flexGrow: 0 },
  chip: { backgroundColor: colors.surfaceLavender, borderRadius: radii.pill, paddingHorizontal: spacing.md, height: 32, justifyContent: 'center', marginRight: spacing.sm },
  chipText: { ...typography.caption, color: colors.textSecondary },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.sm },
  micButton: { width: 44, height: 44, borderRadius: radii.pill, backgroundColor: colors.surfaceLavender, alignItems: 'center', justifyContent: 'center' },
  textInput: { flex: 1, maxHeight: 112, fontSize: 15, color: colors.textPrimary, paddingVertical: 10 },
  sendButton: { width: 44, height: 44, borderRadius: radii.pill, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  footnoteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  footnoteText: { ...typography.caption, color: colors.textSecondary },
  viewingFootnote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },

  finishedContent: { paddingBottom: spacing.xxl },
  finishedSubHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceMuted, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  finishedSubHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  smallBackButton: { width: 32, height: 32, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  finishedTitle: { ...typography.label, fontSize: 15, color: colors.textPrimary },
  finishedSubtitle: { ...typography.caption, color: colors.textSecondary },
  closedPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceGreen, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  closedPillText: { ...typography.caption, color: colors.textGreen },
  dimmedHistory: { opacity: 0.7, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  emptyRecapText: { ...typography.small, color: colors.textSecondary, textAlign: 'center', paddingVertical: spacing.md },
  sealedRow: { alignItems: 'center', marginVertical: spacing.md, paddingHorizontal: spacing.lg },
  sealedPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surfaceLavender, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: 6 },
  sealedPillText: { ...typography.caption, color: colors.textSecondary },
  retrySaveButton: { marginTop: spacing.xs },
  retrySaveText: { ...typography.caption, color: colors.primaryDark, fontWeight: '600' },
  closureCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.xl, alignItems: 'center', marginHorizontal: spacing.lg, marginBottom: spacing.lg, ...shadowCard() },
  closureEmblem: { width: 64, height: 64, borderRadius: radii.pill, backgroundColor: colors.surfaceGreen, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  closureTitle: { ...typography.h1, color: colors.textPrimary },
  durationPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceMuted, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 4, marginTop: spacing.xs, marginBottom: spacing.md },
  durationPillText: { ...typography.caption, color: colors.textGreen },
  closureBody: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
  moodCard: { width: '100%', backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.lg },
  moodCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  moodCardTitle: { ...typography.label, fontSize: 15, color: colors.textPrimary },
  moodCardStatus: { ...typography.caption, color: colors.textGreen, fontWeight: '600' },
  moodCardHint: { ...typography.small, color: colors.textSecondary, marginBottom: spacing.sm },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  moodChip: { flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, borderRadius: radii.pill, backgroundColor: colors.surface },
  moodChipSelected: { backgroundColor: colors.surfaceGreen },
  moodChipText: { ...typography.label, color: colors.textSecondary },
  moodChipTextSelected: { color: colors.textGreen },
  closureButton: { marginTop: spacing.xs },
  backHomeButton: { marginTop: spacing.sm, paddingVertical: spacing.sm },
  backHomeText: { ...typography.label, color: colors.textSecondary },
  groundingResourceCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceMuted, borderRadius: radii.lg, padding: spacing.md, marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm },
  groundingResourceLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  groundingResourceIcon: { width: 40, height: 40, borderRadius: radii.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  groundingResourceTitle: { ...typography.label, fontSize: 15, color: colors.textPrimary },
  groundingResourceSubtitle: { ...typography.small, color: colors.textSecondary },
  groundingResourceButton: { backgroundColor: colors.surfacePurpleSoft, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  groundingResourceButtonText: { ...typography.caption, color: colors.primaryDark },
  concludedBanner: { backgroundColor: colors.disabled, borderRadius: radii.lg, padding: spacing.md, marginHorizontal: spacing.lg, gap: spacing.sm },
  concludedBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  concludedBannerText: { ...typography.small, color: colors.textSecondary, flex: 1 },
  newMessageLink: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' },
  newMessageLinkText: { ...typography.label, color: colors.primaryDark },
});

function shadowCard() {
  return {
    shadowColor: '#7868A6',
    shadowOpacity: 0.09,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  } as const;
}
