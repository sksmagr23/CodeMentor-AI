import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginWithGoogleApi,
  getCurrentUserApi,
  logoutApi,
  getAuthToken,
} from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  provider: 'google';
}

interface GoogleLoginCredentials {
  email: string;
  name?: string;
  avatarUrl?: string;
  googleId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithGoogle: (credentials: GoogleLoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'codementor_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    async function verifySession() {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await getCurrentUserApi();
        if (profile) {
          const validUser: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            avatarUrl: profile.avatar_url,
            provider: 'google',
          };
          setUser(validUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(validUser));
        } else {
          setUser(null);
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        console.warn('[Auth] Verification failed:', e);
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    }

    verifySession();
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const loginWithGoogle = async (credentials: GoogleLoginCredentials) => {
    if (!credentials.email.trim()) {
      throw new Error('Email is required for Google authentication');
    }

    const res = await loginWithGoogleApi({
      email: credentials.email.trim(),
      name: credentials.name?.trim() || credentials.email.split('@')[0],
      avatar_url: credentials.avatarUrl,
      google_id: credentials.googleId,
    });

    const loggedInUser: User = {
      id: res.user.id,
      name: res.user.name,
      email: res.user.email,
      avatarUrl: res.user.avatar_url,
      provider: 'google',
    };

    setUser(loggedInUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      console.warn('[Auth] Logout warning:', e);
    } finally {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle,
        logout,
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
