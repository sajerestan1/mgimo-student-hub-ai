import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { clearAccount } from '@/lib/offline/store';
import { getDemoUser, signOutDemo } from '@/lib/demoAuth';

const AuthContext = createContext();
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    if (DEMO_MODE) {
      const demoUser = getDemoUser();
      setUser(demoUser);
      setIsAuthenticated(Boolean(demoUser));
      setAuthError(null);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      return;
    }
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      if (error.status === 401 || error.status === 403) {
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      }
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  const checkAppState = useCallback(async () => {
    setIsLoadingPublicSettings(true);
    setAuthError(null);
    if (DEMO_MODE) {
      setAppPublicSettings({ id: 'academic-intelligence-demo', public_settings: { demo: true } });
      await checkUserAuth();
      setIsLoadingPublicSettings(false);
      return;
    }
    try {
      const publicSettings = await base44.app.getPublicSettings();
      setAppPublicSettings(publicSettings);
      if (appParams.token) await checkUserAuth();
      else {
        setIsLoadingAuth(false);
        setIsAuthenticated(false);
        setAuthChecked(true);
      }
    } catch (error) {
      console.error('App state check failed:', error);
      const reason = error.status === 403 ? error.data?.extra_data?.reason : null;
      setAuthError({
        type: reason || 'unknown',
        message: reason === 'auth_required' ? 'Authentication required' : error.message || 'Failed to load app',
      });
      setIsLoadingAuth(false);
      setAuthChecked(true);
    } finally {
      setIsLoadingPublicSettings(false);
    }
  }, [checkUserAuth]);

  useEffect(() => { checkAppState(); }, [checkAppState]);

  const logout = (shouldRedirect = true) => {
    if (user?.id) clearAccount(user.id);
    setUser(null);
    setIsAuthenticated(false);
    if (DEMO_MODE) {
      signOutDemo();
      if (shouldRedirect) window.location.assign('/');
      return;
    }
    if (shouldRedirect) base44.auth.logout(window.location.href);
    else base44.auth.logout();
  };

  const navigateToLogin = () => {
    if (DEMO_MODE) window.location.assign('/login');
    else base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings, authError,
      appPublicSettings, authChecked, logout, navigateToLogin, checkUserAuth, checkAppState,
    }}>
      {children}
    {DEMO_MODE && <div className="fixed bottom-2 right-2 z-[9999] rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">DEMO MODE · synthetic accounts</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
