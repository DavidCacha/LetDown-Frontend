import { apiFetch } from './api';


export interface SafePlace {
  id: string;
  userId: string;
  name: string;
  isAnchor: boolean;
  description: string | null;
  address: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SafePlacePayload {
  name: string;
  isAnchor?: boolean;
  description?: string;
  address?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  tags?: string[];
}

export interface CreateSafePlaceResponse {
  message: string;
  place: SafePlace;
}

export interface UpdateSafePlaceResponse {
  message: string;
  place: SafePlace;
}

export const safePlacesService = {
  getAll(accessToken: string) {
    return apiFetch<SafePlace[]>('/emotional/safe-places', {
      method: 'GET',
      accessToken,
    });
  },

  create(accessToken: string, payload: SafePlacePayload) {
    return apiFetch<CreateSafePlaceResponse>('/emotional/safe-places', {
      method: 'POST',
      accessToken,
      body: payload,
    });
  },

  update(accessToken: string, placeId: string, payload: Partial<SafePlacePayload>) {
    return apiFetch<UpdateSafePlaceResponse>(`/emotional/safe-places/${placeId}`, {
      method: 'PATCH',
      accessToken,
      body: payload,
    });
  },

  remove(accessToken: string, placeId: string) {
    return apiFetch<{ message: string }>(`/emotional/safe-places/${placeId}`, {
      method: 'DELETE',
      accessToken,
    });
  },
};