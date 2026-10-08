import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService, userService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('tdo_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('tdo_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('tdo_token');
      if (storedToken) {
        try {
          const res = await userService.getProfile();
          setUser(res.data);
          localStorage.setItem('tdo_user', JSON.stringify(res.data));
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    const handleAuthReset = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('tdo_auth_reset', handleAuthReset);
    initAuth();

    return () => {
      window.removeEventListener('tdo_auth_reset', handleAuthReset);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    const { user: userData, token: tokenData } = res.data;
    localStorage.setItem('tdo_token', tokenData.access_token);
    localStorage.setItem('tdo_user', JSON.stringify(userData));
    setToken(tokenData.access_token);
    setUser(userData);
  };

  const register = async (email: string, name: string, password: string) => {
    const res = await authService.register({ email, name, password });
    const { user: userData, token: tokenData } = res.data;
    localStorage.setItem('tdo_token', tokenData.access_token);
    localStorage.setItem('tdo_user', JSON.stringify(userData));
    setToken(tokenData.access_token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('tdo_token');
    localStorage.removeItem('tdo_user');
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    try {
      const res = await userService.getProfile();
      setUser(res.data);
      localStorage.setItem('tdo_user', JSON.stringify(res.data));
    } catch {
      // no-op if fails
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
