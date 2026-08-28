import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface EcommerceAuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const EcommerceAuthContext = createContext<EcommerceAuthContextType | undefined>(undefined);

const ECOMMERCE_TOKEN_KEY = 'ecommerce_token';

export const EcommerceAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(ECOMMERCE_TOKEN_KEY);
    if (token) {
      fetch('/api/ecommerce/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Invalid token');
          return res.json();
        })
        .then((data) => setUser(data.user))
        .catch(() => {
          localStorage.removeItem(ECOMMERCE_TOKEN_KEY);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem(ECOMMERCE_TOKEN_KEY, token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(ECOMMERCE_TOKEN_KEY);
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <EcommerceAuthContext.Provider value={{ user, loading, login, logout, isAuthenticated }}>
      {children}
    </EcommerceAuthContext.Provider>
  );
};

export const useEcommerceAuth = () => {
  const context = useContext(EcommerceAuthContext);
  if (context === undefined) {
    throw new Error('useEcommerceAuth must be used within an EcommerceAuthProvider');
  }
  return context;
};
