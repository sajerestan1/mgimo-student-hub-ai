import React from 'react';

const noop = () => {};

export const AuthContext = React.createContext({});

export const AuthProvider = ({ children }) => children;

export function useAuth() {
  const user = (global.__SESSION__ || {}).user || null;
  const base = {
    user,
    isAuthenticated: Boolean(user),
    isLoadingAuth: false,
    isLoadingPublicSettings: false,
    isLoading: false,
    authChecked: true,
    authError: null,
    appPublicSettings: {},
    checkUserAuth: noop,
    navigateToLogin: noop,
    logout: noop,
    updateUser: noop,
  };
  return new Proxy(base, { get: (target, key) => (key in target ? target[key] : noop) });
}

export default AuthContext;