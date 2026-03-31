import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

// Normalize Supabase user to the shape the app expects.
// Supabase stores custom fields in user_metadata.
function normalizeUser(supabaseUser) {
  if (!supabaseUser) return null;
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    full_name: supabaseUser.user_metadata?.full_name ?? supabaseUser.email,
    organizationId: supabaseUser.user_metadata?.organizationId ?? null,
    role: supabaseUser.user_metadata?.role ?? 'user',
    isActive: supabaseUser.user_metadata?.isActive ?? true,
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    // Check for an existing session on mount.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(normalizeUser(session.user));
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      }
      setIsLoadingAuth(false);
    });

    // Subscribe to auth state changes (login, logout, token refresh).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(normalizeUser(session.user));
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      }
      setIsLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange fires and clears state automatically.
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  // Kept for interface compatibility — no-op until Phase 3.
  const checkAppState = async () => {};

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      signIn,
      logout,
      navigateToLogin,
      checkAppState,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
