import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService, type AuthUser } from '../services/authService';

type AuthContextValue = {
  currentUser: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  updateProfile: (data: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
  }, []);

  const login = async (email: string, password: string) => {
    const authUser = await authService.login(email, password);
    setCurrentUser(authUser);
  };

  const signup = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    const authUser = await authService.signup({
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      password: data.password,
    });
    setCurrentUser(authUser);
  };

  const updateProfile = async (data: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
  }) => {
    const authUser = await authService.updateProfile({
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      avatar: data.avatar,
      age: data.age,
      gender: data.gender,
    });
    setCurrentUser(authUser);
  };

  const logout = () => {
    setCurrentUser(null);
    authService.logout();
  };

  const value = useMemo(
    () => ({
      currentUser,
      login,
      signup,
      updateProfile,
      logout,
    }),
    [currentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
