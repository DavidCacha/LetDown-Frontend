import { apiFetch } from './api';
import { TrustedContact } from './contact';

export interface LocationShare {
  id: string;
  userId: string;
  recipientContactIds: string[];
  discreetMode: boolean;
  active: boolean;
  startedAt: string;
  expiresAt: string;
  stoppedAt: string | null;
  lastLatitude: number | null;
  lastLongitude: number | null;
  lastPingAt: string | null;
  updatedAt: string;
}

export interface StartLocationSharePayload {
  recipientContactIds: string[];
  durationMinutes?: number;
  discreetMode?: boolean;
  latitude: number;
  longitude: number;
}

export interface LocationShareWithRecipients {
  share: LocationShare | null;
  recipients: TrustedContact[];
}

export const locationShareService = {
  start(accessToken: string, payload: StartLocationSharePayload) {
    return apiFetch<{ message: string; share: LocationShare; recipients: TrustedContact[] }>(
      '/emotional/location-shares',
      { method: 'POST', accessToken, body: payload },
    );
  },

  getActive(accessToken: string) {
    return apiFetch<LocationShareWithRecipients>('/emotional/location-shares/active', {
      method: 'GET',
      accessToken,
    });
  },

  addPing(accessToken: string, shareId: string, latitude: number, longitude: number, accuracy?: number) {
    return apiFetch<{ message: string }>(`/emotional/location-shares/${shareId}/ping`, {
      method: 'POST',
      accessToken,
      body: { latitude, longitude, accuracy },
    });
  },

  extend(accessToken: string, shareId: string, addMinutes: number) {
    return apiFetch<{ message: string; share: LocationShare }>(
      `/emotional/location-shares/${shareId}/extend`,
      { method: 'PATCH', accessToken, body: { addMinutes } },
    );
  },

  setDiscreetMode(accessToken: string, shareId: string, discreetMode: boolean) {
    return apiFetch<{ message: string; share: LocationShare }>(
      `/emotional/location-shares/${shareId}`,
      { method: 'PATCH', accessToken, body: { discreetMode } },
    );
  },

  stop(accessToken: string, shareId: string) {
    return apiFetch<{ message: string }>(`/emotional/location-shares/${shareId}/stop`, {
      method: 'POST',
      accessToken,
    });
  },
};