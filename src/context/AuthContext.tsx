import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, AuthUser } from '../services/auth';
import { ApiError } from '../services/api';

const STORAGE_KEY = 'letdown.session.v1';

interface StoredSession {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  user: AuthUser;
}

interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  accessToken: string | null;

  signUp: (email: string, password: string) => Promise<void>;
  confirmAccount: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: AuthUser) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<StoredSession | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        const stored: StoredSession = JSON.parse(raw);
        const freshUser = await authService.getMe(stored.accessToken);

        setSession({ ...stored, user: freshUser });
      } catch {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: StoredSession | null) => {
    if (next) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
    setSession(next);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    await authService.register(email, password);
  }, []);

  const confirmAccount = useCallback(async (email: string, code: string) => {
    await authService.confirmSignUp(email, code);
  }, []);

  const resendCode = useCallback(async (email: string) => {
    await authService.resendConfirmationCode(email);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await authService.login(email, password);

      await persist({
        accessToken: result.accessToken,
        idToken: result.idToken,
        refreshToken: result.refreshToken,
        user: result.user,
      });
    },
    [persist],
  );

  const updateUser = useCallback(
    async (user: AuthUser) => {
      if (!session) return;
      await persist({ ...session, user });
    },
    [session, persist],
  );

  const signOut = useCallback(async () => {
    if (session?.accessToken) {
      try {
        await authService.logout(session.accessToken);
      } catch (error) {
        if (!(error instanceof ApiError)) {

        }
      }
    }
    await persist(null);
  }, [session, persist]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      isAuthenticated: !!session,
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      signUp,
      confirmAccount,
      resendCode,
      signIn,
      signOut,
      updateUser,
    }),
    [isLoading, session, signUp, confirmAccount, resendCode, signIn, signOut, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
