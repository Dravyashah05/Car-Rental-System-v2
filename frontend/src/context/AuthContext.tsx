import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useClerk, useUser } from '@clerk/react';
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
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();

  useEffect(() => {
    if (!isLoaded) return;
    let isActive = true;

    const syncClerk = async () => {
      if (isSignedIn && clerkUser) {
        try {
          const synced = await authService.syncClerkUser();
          if (isActive) setCurrentUser(synced);
          return;
        } catch {
          const email = clerkUser.primaryEmailAddress?.emailAddress ?? '';
          const phone = clerkUser.primaryPhoneNumber?.phoneNumber ?? '';
          const name =
            clerkUser.fullName ||
            clerkUser.firstName ||
            clerkUser.username ||
            email ||
            'User';
          if (isActive) {
            setCurrentUser({
              id: clerkUser.id,
              name,
              email,
              phone,
              avatar: clerkUser.imageUrl,
              role: 'user',
            });
          }
          return;
        }
      }
      if (isActive) {
        setCurrentUser(authService.getCurrentUser());
      }
    };

    void syncClerk();

    return () => {
      isActive = false;
    };
  }, [clerkUser, isLoaded, isSignedIn]);

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
    if (isSignedIn) {
      void clerk.signOut();
    }
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
