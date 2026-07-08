import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

type AuthStatus = 'loading' | 'signed-out' | 'signed-in';

type AuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const REDIRECT_TO = 'connect://auth/callback';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(isSupabaseConfigured ? 'loading' : 'signed-out');
  const [session, setSession] = useState<Session | null>(null);
  const signingIn = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;

    client.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setStatus(data.session ? 'signed-in' : 'signed-out');
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setStatus(nextSession ? 'signed-in' : 'signed-out');
    });

    // Supabase's client does not refresh tokens on a timer while the app is
    // backgrounded; without this, sessions silently expire.
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        client.auth.startAutoRefresh();
      } else {
        client.auth.stopAutoRefresh();
      }
    });

    return () => {
      listener.subscription.unsubscribe();
      sub.remove();
    };
  }, []);

  async function signInWithGoogle() {
    if (!isSupabaseConfigured || !supabase || signingIn.current) return;
    signingIn.current = true;
    try {
      if (Platform.OS === 'web') {
        await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: REDIRECT_TO } });
        return;
      }
      const { data } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: REDIRECT_TO, skipBrowserRedirect: true },
      });
      if (!data?.url) return;
      const res = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_TO);
      if (res.type === 'success' && res.url) {
        const code = new URL(res.url).searchParams.get('code');
        if (code) await supabase.auth.exchangeCodeForSession(code);
      }
    } finally {
      signingIn.current = false;
    }
  }

  async function signOut() {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ status, session, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
