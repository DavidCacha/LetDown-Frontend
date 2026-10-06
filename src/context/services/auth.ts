import { apiFetch } from './api';

export const APPLICATION_CODE = 'emotional';

export interface AuthUser {
  id: string;
  cognitoSub: string;
  email: string;
  role: string;
  emailVerified: boolean;
  accountStatus: string;
  profile?: unknown;
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
};
