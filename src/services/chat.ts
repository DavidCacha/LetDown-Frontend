import { apiFetch } from './api';


export type ChatObjective =
  | 'VENTING'
  | 'ANXIETY'
  | 'SADNESS'
  | 'STRESS'
  | 'LONELINESS'
  | 'ANGER'
  | 'SLEEP'
  | 'OTHER';

export type ChatSender = 'USER' | 'AI';

export interface ChatMessage {
  id: string;
  chatId: string;
  sender: ChatSender;
  message: string;
  riskLevel: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface ChatDetail {
  id: string;
  title: string | null;
  objective: ChatObjective | null;
  status: string;
  riskLevel: string;
  waitingSafetyConfirmation: boolean;
  crisisProtocolActive: boolean;
  pendingEmergencyContactId: string | null;
  pendingEmergencyMessage: string | null;
  pendingLocationContactId: string | null;
  pendingLatitude: number | null;
  pendingLongitude: number | null;
}

export interface ChatSummary {
  id: string;
  title: string | null;
  objective: ChatObjective | null;
  status: string;
  riskLevel: string;
  messageCount: number;
  lastMessage: string | null;
  lastMessageSender: ChatSender | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatPayload {
  title?: string;
  objective?: ChatObjective;
}

export interface SendMessagePayload {
  message: string;
  action?: string;
  latitude?: number;
  longitude?: number;
  contactId?: string;
}

export interface CreateChatResponse {
  message: string;
  chat: ChatDetail;
}

export interface GetMessagesResponse {
  chat: ChatDetail;
  messages: ChatMessage[];
}

export interface SendMessageResponse {
  message: string;
  chat: Pick<
    ChatDetail,
    'id' | 'status' | 'riskLevel' | 'waitingSafetyConfirmation' | 'crisisProtocolActive'
  >;
  userMessage: ChatMessage;
  aiMessage: ChatMessage;
}

export interface GetMyChatsResponse {
  chats: ChatSummary[];
}

export const chatService = {
  createChat(accessToken: string, payload: CreateChatPayload = {}) {
    return apiFetch<CreateChatResponse>('/emotional/chats', {
      method: 'POST',
      accessToken,
      body: payload,
    });
  },

  sendMessage(accessToken: string, chatId: string, payload: SendMessagePayload) {
    return apiFetch<SendMessageResponse>(`/emotional/chats/${chatId}/messages`, {
      method: 'POST',
      accessToken,
      body: payload,
    });
  },

  getMessages(accessToken: string, chatId: string) {
    return apiFetch<GetMessagesResponse>(`/emotional/chats/${chatId}/messages`, {
      method: 'GET',
      accessToken,
    });
  },


  getMyChats(accessToken: string) {
    return apiFetch<GetMyChatsResponse>('/emotional/chats', {
      method: 'GET',
      accessToken,
    });
  },

  deleteChat(accessToken: string, chatId: string) {
    return apiFetch<{ message: string }>(`/emotional/chats/${chatId}`, {
      method: 'DELETE',
      accessToken,
    });
  },
};


export const INTENTION_TO_OBJECTIVE: Record<string, ChatObjective> = {
  venting: 'VENTING',
  anxiety: 'ANXIETY',
  organize: 'OTHER',
  company: 'LONELINESS',
};


export const GOAL_TO_OBJECTIVE: Record<string, ChatObjective> = {
  vent: 'VENTING',
  anxiety: 'ANXIETY',
  sadness: 'SADNESS',
  doubts: 'OTHER',
  crisis: 'OTHER',
};

export type ResponseTone = 'silent' | 'guided' | 'reflective';


export const OBJECTIVE_LABELS: Record<ChatObjective, string> = {
  VENTING: 'Desahogo emocional',
  ANXIETY: 'Contención emocional & Ansiedad',
  SADNESS: 'Tristeza y acompañamiento',
  STRESS: 'Manejo de estrés',
  LONELINESS: 'Compañía y soledad',
  ANGER: 'Manejo de enojo',
  SLEEP: 'Sueño y descanso',
  OTHER: 'Acompañamiento general',
};

export function getObjectiveLabel(objective: ChatObjective | null): string {
  if (!objective) return 'Contención emocional & Desahogo';
  return OBJECTIVE_LABELS[objective] ?? 'Acompañamiento general';
}