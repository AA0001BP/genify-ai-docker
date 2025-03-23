'use client';

import { useState, useEffect, useCallback } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  trialEndDate?: string | Date | null;
  subscriptionStatus?: 'trialing' | 'active' | 'canceled' | 'expired' | null;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
};

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Check if user is logged in
  const checkSession = useCallback(async () => {
    try {
      setAuth(prev => ({ ...prev, loading: true }));
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      
      if (res.ok && data.user) {
        setAuth({
          user: data.user,
          loading: false,
          error: null,
        });
      } else if (res.status === 403 && data.error === 'Email not verified') {
        // Handle unverified email specifically
        setAuth({
          user: null,
          loading: false,
          error: 'Your email address is not verified. Please check your inbox for the verification email.',
        });
      } else {
        setAuth({
          user: null,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      setAuth({
        user: null,
        loading: false,
        error: 'Failed to fetch session',
      });
    }
  }, []);

  // Login user
  const login = async (credentials: LoginData) => {
    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }));
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        await checkSession(); // Fetch the updated user data
        return true;
      } else {
        setAuth(prev => ({
          ...prev,
          loading: false,
          error: data.error || 'Login failed',
        }));
        return false;
      }
    } catch (error) {
      setAuth(prev => ({
        ...prev,
        loading: false,
        error: 'An unexpected error occurred',
      }));
      return false;
    }
  };

  // Register user
  const register = async (userData: RegisterData) => {
    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }));
      
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setAuth({
          user: data.user,
          loading: false,
          error: null,
        });
        return true;
      } else {
        setAuth(prev => ({
          ...prev,
          loading: false,
          error: data.error || 'Registration failed',
        }));
        return false;
      }
    } catch (error) {
      setAuth(prev => ({
        ...prev,
        loading: false,
        error: 'An unexpected error occurred',
      }));
      return false;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setAuth(prev => ({ ...prev, loading: true }));
      
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (res.ok) {
        setAuth({
          user: null,
          loading: false,
          error: null,
        });
        return true;
      } else {
        const data = await res.json();
        setAuth(prev => ({
          ...prev,
          loading: false,
          error: data.error || 'Logout failed',
        }));
        return false;
      }
    } catch (error) {
      setAuth(prev => ({
        ...prev,
        loading: false,
        error: 'An unexpected error occurred',
      }));
      return false;
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    await checkSession();
  };

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return {
    user: auth.user,
    loading: auth.loading,
    error: auth.error,
    login,
    register,
    logout,
    refreshUser,
  };
} 