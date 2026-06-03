"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { signIn as apiSignIn, signOut as apiSignOut, signUp as apiSignUp } from "@/lib/api";
import {
  clearStoredAuth,
  getStoredToken,
  getStoredTribe,
  setStoredAuth,
} from "@/lib/auth-storage";
import type { SignInPayload, SignUpPayload, Tribe } from "@/types/api";

type AuthContextValue = {
  tribe: Tribe | null;
  token: string | null;
  isLoading: boolean;
  signUp: (payload: SignUpPayload) => Promise<void>;
  signIn: (payload: SignInPayload) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tribe, setTribe] = useState<Tribe | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedTribe = getStoredTribe();
    if (storedToken && storedTribe) {
      setToken(storedToken);
      setTribe(storedTribe);
    }
    setIsLoading(false);
  }, []);

  const signUp = useCallback(async (payload: SignUpPayload) => {
    const { data, token: jwt } = await apiSignUp(payload);
    if (jwt) {
      setStoredAuth(jwt, data.tribe);
      setToken(jwt);
      setTribe(data.tribe);
      return;
    }
    // Registration does not issue JWT; sign in to obtain a session token.
    const { data: session, token: sessionToken } = await apiSignIn({
      email: payload.email,
      password: payload.password,
    });
    setStoredAuth(sessionToken, session.tribe);
    setToken(sessionToken);
    setTribe(session.tribe);
  }, []);

  const signIn = useCallback(async (payload: SignInPayload) => {
    const { data, token: jwt } = await apiSignIn(payload);
    setStoredAuth(jwt, data.tribe);
    setToken(jwt);
    setTribe(data.tribe);
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
    setToken(null);
    setTribe(null);
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
