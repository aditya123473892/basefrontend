// frontend/lib/auth.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  company_id: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface SignupData {
  company_name: string;
  owner_full_name: string;
  owner_email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      console.log('🔄 Initializing auth state...');
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('✅ Setting user from localStorage:', parsedUser.email);
          setUser(parsedUser);
          setToken(storedToken);
        } else {
          console.log('❌ No stored auth data found');
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('🔐 Starting login...');
      const data = await authService.login(email, password);

      if (!data || !data.token || !data.user) {
        throw new Error('Invalid response from server');
      }

      console.log('💾 Storing login data to localStorage...');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      console.log('🔄 Updating state with user:', data.user);
      setToken(data.token);
      setUser(data.user);
      
      console.log('✅ Login successful, state updated');
      return true;

    } catch (error: any) {
      console.error('❌ Login error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
      
      if (error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check your connection.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    setIsLoading(true);
    try {
      const result = await authService.signup(data);
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      setUser(result.user);
      setToken(result.token);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    router.push('/signup');
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export type { AuthUser, AuthResponse, SignupData };
