import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
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
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  login: async () => {},
  loginWithGoogle: async () => {},
  register: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session
  useEffect(() => {
    setLoading(true);
    
    // Get the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleSession(session);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          handleSession(session);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Handle a valid session
  const handleSession = async (session: Session) => {
    try {
      // Check if user is an admin via stored metadata
      const isAdmin = !!session.user?.user_metadata?.is_admin || 
                     session.user?.email === 'zaviner@gmail.com';

      // Create user object from session
      const userData: User = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user?.user_metadata?.name || session.user?.user_metadata?.full_name || '',
        isAdmin: isAdmin,
      };

      setUser(userData);

      // Store admin status in user metadata if needed
      if (isAdmin && !session.user?.user_metadata?.is_admin) {
        await supabase.auth.updateUser({
          data: { is_admin: true }
        });
      }

    } catch (error) {
      console.error('Error handling session:', error);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const user = data.user;
      
      // Check if the user is an admin (using the specific admin email)
      const isAdmin = user?.email === 'zaviner@gmail.com';
      
      // Save user info to localStorage
      localStorage.setItem('user', JSON.stringify({
        id: user?.id,
        email: user?.email,
        isAdmin,
      }));
      
      setUser({
        id: user?.id || '',
        email: user?.email || '',
        isAdmin,
      });
      
      // Redirect to home page instead of dashboard
      navigate('/');
      
      return user;
    } catch (error: any) {
      console.error('Error logging in:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://gemachim.netlify.app/auth/callback',
        }
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error logging in with Google:', error.message);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      
      // Register with Supabase
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            is_admin: email.toLowerCase() === 'zaviner@gmail.com',
          },
        },
      });
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAdmin = user?.isAdmin || false;

  return <AuthContext.Provider value={{ 
    user, 
    isAdmin,
    loading, 
    login,
    loginWithGoogle,
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
