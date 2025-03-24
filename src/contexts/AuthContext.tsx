import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // בדיקת סשן נוכחי בעת טעינת האתר
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const userData: User = {
          id: session.user.id,
          email: session.user.user_metadata.email,
          name: session.user.user_metadata.user_name,
          isAdmin: session.user.user_metadata.isAdmin || false
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
      setLoading(false);
    });

    // האזנה לשינויים במצב ההתחברות
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const userData: User = {
          id: session.user.id,
          email: session.user.user_metadata.email,
          name: session.user.user_metadata.user_name,
          isAdmin: session.user.user_metadata.isAdmin || false
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // In a real app, this would be an API call to authenticate
      // Mocking login for now
      
      // Special check for admin
      const isAdmin = email.toLowerCase() === 'zaviner@gmail.com';
      
      // Mock successful login
      const userData: User = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        email: email,
        name: '',
        isAdmin: isAdmin
      };
      
      // Save user data
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Send notification email if admin and it's a real implementation
      if (isAdmin) {
        console.log('Admin logged in');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      
      // In a real app, this would be an API call to register
      // Mocking registration for now
      
      // Special check for admin
      const isAdmin = email.toLowerCase() === 'zaviner@gmail.com';
      
      // Mock successful registration
      const userData: User = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        email: email,
        name: name,
        isAdmin: isAdmin
      };
      
      // Save user data
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
  };

  const isAdmin = user?.isAdmin || false;

  return <AuthContext.Provider value={{ 
    user, 
    isAdmin,
    loading, 
    login, 
    register, 
    logout 
  }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
