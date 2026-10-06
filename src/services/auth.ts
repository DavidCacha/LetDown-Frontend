import { apiFetch } from './api';

export const APPLICATION_CODE = 'emotional';

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  secondLastName: string | null;
  phoneCountryCode: string | null;
  phoneNumber: string | null;
  birthDate: string | null;
  curp: string | null;
  nationality: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  cognitoSub: string;
  email: string;
  role: string;
  emailVerified: boolean;
  accountStatus: string;
  lastLoginAt?: string | null;
  profile?: UserProfile | null;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  application: unknown;
  user: AuthUser;
}

export interface RefreshResponse {
  message: string;
  accessToken: string;
  idToken: string;
  expiresIn: number;
  tokenType: string;
}


export interface UpdateProfilePayload {
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  secondLastName?: string | null;
  phoneCountryCode?: string | null;
  phoneNumber?: string | null;
  birthDate?: string | null;
  curp?: string | null;
  nationality?: string | null;
}

export function getDisplayName(user?: AuthUser | null): string {
  if (!user) return '';
  const first = user.profile?.firstName?.trim();
  const last = user.profile?.lastName?.trim();
  if (first || last) return [first, last].filter(Boolean).join(' ');
  return user.email.split('@')[0];
}


export function isProfileEmpty(user?: AuthUser | null): boolean {
  const profile = user?.profile;
  return !profile?.firstName && !profile?.lastName && !profile?.curp && !profile?.birthDate;
}

export const authService = {
  register(email: string, password: string) {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: { email, password },
    });
  },

  confirmSignUp(email: string, code: string) {
    return apiFetch('/auth/confirm', {
      method: 'POST',
      body: { email, code },
    });
  },

  resendConfirmationCode(email: string) {
    return apiFetch('/auth/resend-confirmation-code', {
      method: 'POST',
      body: { email },
    });
  },

  login(email: string, password: string) {
    return apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password, applicationCode: APPLICATION_CODE },
    });
  },

  refreshTokens(refreshToken: string) {
    return apiFetch<RefreshResponse>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    });
  },

  forgotPassword(email: string) {
    return apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  confirmForgotPassword(email: string, code: string, newPassword: string) {
    return apiFetch('/auth/confirm-forgot-password', {
      method: 'POST',
      body: { email, code, newPassword },
    });
  },

  getMe(accessToken: string) {
    return apiFetch<AuthUser>('/auth/me', {
      method: 'GET',
      accessToken,
    });
  },

  logout(accessToken: string) {
    return apiFetch('/auth/logout', {
      method: 'POST',
      accessToken,
    });
  },

  updateProfile(accessToken: string, payload: UpdateProfilePayload) {
    return apiFetch<UserProfile>('/users/me/profile', {
      method: 'PATCH',
      accessToken,
      body: payload,
    });
  },
};