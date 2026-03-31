// PHASE 1 STUB — Base44 auth removed.
// createAxiosClient from @base44/sdk is gone. Auth is stubbed to immediately
// show unauthenticated state. Phase 2 will replace this with real
// fetch('/api/auth/me') calls and a proper login page.
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState({ type: 'auth_required', message: 'Authentication required' });
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  // Phase 2: replace this with GET /api/auth/me
  const checkAppState = async () => {};

  // Phase 2: replace with POST /api/auth/logout then navigate('/login')
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthError({ type: 'auth_required', message: 'Authentication required' });
  };

  // Phase 2: replace with navigate('/login')
  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
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
