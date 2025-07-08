import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthSession } from '../types/user';

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const storedSession = localStorage.getItem('goongpt_session');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession) as AuthSession;
        if (new Date(parsedSession.expires_at) > new Date()) {
          setSession(parsedSession);
          setUser(parsedSession.user);
        } else {
          localStorage.removeItem('goongpt_session');
        }
      } catch (error) {
        console.error('Error parsing stored session:', error);
        localStorage.removeItem('goongpt_session');
      }
    }
  }, []);

  const login = (newSession: AuthSession) => {
    setSession(newSession);
    setUser(newSession.user);
    localStorage.setItem('goongpt_session', JSON.stringify(newSession));
  };

  const logout = () => {
    setSession(null);
    setUser(null);
    localStorage.removeItem('goongpt_session');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    if (session) {
      const updatedSession = { ...session, user: updatedUser };
      setSession(updatedSession);
      localStorage.setItem('goongpt_session', JSON.stringify(updatedSession));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: !!user,
      login,
      logout,
      updateUser
    }}>
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