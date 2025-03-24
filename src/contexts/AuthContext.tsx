import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

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

      // Check if the user is an admin
      let isAdmin = false;

      if (data.user) {
        // Special check for admin email
        if (data.user.email === 'zaviner@gmail.com') {
          isAdmin = true;
        } else {
          // Get the profile to check admin status
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', data.user.id)
            .single();

          isAdmin = !!profileData?.is_admin;
        }
      }

      // Save user data and admin status to local storage
      if (data.user) {
        localStorage.setItem('user', JSON.stringify({
          ...data.user,
          isAdmin
        }));
      }

      setUser(data.user ? { ...data.user, isAdmin } : null);
      
      // Redirect to index page after login instead of home
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
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
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error logging in with Google:', error.message);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Check if the user is an admin
      const isAdminUser = email === 'zaviner@gmail.com';

      // Create profile for the new user
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            is_admin: isAdminUser
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      toast({
        title: "הרשמה בוצעה בהצלחה!",
        description: "נשלח אימייל אימות, אנא אשר אותו לפני ההתחברות.",
      });

      // After successful registration, redirect to login
      navigate('/auth');
      
    } catch (error: any) {
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
