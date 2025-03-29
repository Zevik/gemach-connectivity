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
    
    const checkSession = async () => {
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // יש סשן פעיל מסופהבייס - נטפל בו
          await handleSession(session);
        } else {
          // אין סשן פעיל - ננסה לקחת מידע מהלוקל סטורג' 
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser) as User;
              setUser(parsedUser);
              
              // בדיקת תוקף הסשן - ננסה לרענן את האימות
              const { data: refreshData, error: refreshError } = await supabase.auth.getUser();
              if (!refreshError && refreshData.user) {
                // הסשן רענן - נעדכן את הנתונים בהתאם
                await handleSession({
                  access_token: '',
                  refresh_token: '',
                  expires_in: 0,
                  expires_at: 0,
                  token_type: '',
                  user: refreshData.user
                });
              } else {
                console.log('Session expired or invalid, but using stored user data for UI');
              }
            } catch (err) {
              console.error('Error parsing stored user:', err);
              localStorage.removeItem('user');
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          await handleSession(session);
        } else {
          // האירוע 'SIGNED_OUT' צריך לנקות את כל הנתונים
          if (event === 'SIGNED_OUT') {
            localStorage.removeItem('user');
            setUser(null);
          } else {
            // לאירועים אחרים, רק אם אין משתמש בלוקל סטורג', נאפס את המשתמש הנוכחי
            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
              setUser(null);
            }
          }
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

      // Store user info in localStorage to persist between page refreshes
      localStorage.setItem('user', JSON.stringify(userData));
      
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

  const login = async (email: string, password: string): Promise<void> => {
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
      
      // Redirect to dashboard instead of home page
      navigate('/dashboard');
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
      // נקה את המידע גם מהלוקל סטורג'
      localStorage.removeItem('user');
      // נקה את המידע מהמצב של הקומפוננטה
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
