'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, getCurrentUser } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => User | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('bdo_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('bdo_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string): User | null => {
    const { login: authLogin } = require('@/lib/auth');
    const loggedInUser = authLogin(username, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      localStorage.setItem('bdo_user', JSON.stringify(loggedInUser));
    }
    return loggedInUser;
  };

  const logout = () => {
    const { logout: authLogout } = require('@/lib/auth');
    authLogout();
    setUser(null);
    localStorage.removeItem('bdo_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
