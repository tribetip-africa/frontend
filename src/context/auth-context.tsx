"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { signIn as apiSignIn, signOut as apiSignOut, signUp as apiSignUp } from "@/lib/api";
import {
  clearStoredAuth,
  getAuthStorageSnapshot,
  setStoredAuth,
  subscribeAuthStorage,
} from "@/lib/auth-storage";
import type { SignInPayload, SignUpPayload, Tribe } from "@/types/api";

type AuthContextValue = {
  tribe: Tribe | null;
  token: string | null;
  isLoading: boolean;
  signUp: (payload: SignUpPayload) => Promise<{ confirmationRequired: boolean; tribe: Tribe | null }>;
  signIn: (payload: SignInPayload) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const emptyAuthSnapshot = { token: null, tribe: null };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const { token, tribe } = useSyncExternalStore(
    subscribeAuthStorage,
    getAuthStorageSnapshot,
    () => emptyAuthSnapshot,
  );

  const isLoading = !hasMounted;

  const signUp = useCallback(async (payload: SignUpPayload) => {
    const { data, token: jwt } = await apiSignUp(payload);

    if (data.confirmation_required) {
      clearStoredAuth();
      return { confirmationRequired: true, tribe: null };
    }

    if (jwt) {
      setStoredAuth(jwt, data.tribe);
      return { confirmationRequired: false, tribe: data.tribe };
    }
    // Registration does not issue JWT; sign in to obtain a session token.
    const { data: session, token: sessionToken } = await apiSignIn({
      login: payload.email,
      password: payload.password,
    });
    setStoredAuth(sessionToken, session.tribe);
    return { confirmationRequired: false, tribe: session.tribe };
  }, []);

  const signIn = useCallback(async (payload: SignInPayload) => {
    const { data, token: jwt } = await apiSignIn(payload);
    setStoredAuth(jwt, data.tribe);
  }, []);

  const signOut = useCallback(async () => {
    if (token) {
      try {
        await apiSignOut(token);
      } catch {
        // Clear local session even if API sign-out fails
      }
    }
    clearStoredAuth();
  }, [token]);

  const value = useMemo(
    () => ({ tribe, token, isLoading, signUp, signIn, signOut }),
    [tribe, token, isLoading, signUp, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
