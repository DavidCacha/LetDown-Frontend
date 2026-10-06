import { apiFetch } from './api';


export interface TrustedContact {
  id: string;
  userId: string;
  fullName: string;
  relationship: string | null;
  phoneCountryCode: string | null;
  phoneNumber: string;
  email: string | null;
  isPrimary: boolean;
  canReceiveAlerts: boolean;
  canReceiveLocation: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface TrustedContactPayload {
  fullName: string;
  relationship?: string;
  phoneCountryCode?: string;
  phoneNumber: string;
  email?: string;
  isPrimary?: boolean;
  canReceiveAlerts?: boolean;
  canReceiveLocation?: boolean;
}

export interface CreateTrustedContactResponse {
  message: string;
  contact: TrustedContact;
}

export interface UpdateTrustedContactResponse {
  message: string;
  contact: TrustedContact;
}

export const contactsService = {
  getAll(accessToken: string) {
    return apiFetch<TrustedContact[]>('/emotional/trusted-contacts', {
      method: 'GET',
      accessToken,
    });
  },

  create(accessToken: string, payload: TrustedContactPayload) {
    return apiFetch<CreateTrustedContactResponse>('/emotional/trusted-contacts', {
      method: 'POST',
      accessToken,
      body: payload,
    });
  },

  update(accessToken: string, contactId: string, payload: Partial<TrustedContactPayload>) {
    return apiFetch<UpdateTrustedContactResponse>(`/emotional/trusted-contacts/${contactId}`, {
      method: 'PATCH',
      accessToken,
      body: payload,
    });
  },

  remove(accessToken: string, contactId: string) {
    return apiFetch<{ message: string }>(`/emotional/trusted-contacts/${contactId}`, {
      method: 'DELETE',
      accessToken,
    });
  },
};

export const ROLE_TO_RELATIONSHIP: Record<string, string> = {
  family: 'Familiar',
  partner: 'Pareja',
  therapist: 'Terapeuta / Profesional',
  friend: 'Amistad íntima',
  neighbor: 'Vecino / Cercano',
};

export function relationshipToRoleKey(relationship: string | null): string {
  if (!relationship) return 'family';
  const found = Object.entries(ROLE_TO_RELATIONSHIP).find(([, label]) => label === relationship);
  return found ? found[0] : 'family';
}