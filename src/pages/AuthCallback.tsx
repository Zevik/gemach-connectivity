import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // בדיקה האם יש טוקן באימות ב-URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        // אם האימות הצליח, ננווט לדף הבית
        if (data.session) {
          navigate('/');
        } else {
          navigate('/auth');
        }
      } catch (error: any) {
        setError(error.message);
        console.error('Error during auth callback:', error);
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  // עמוד טעינה פשוט בזמן עיבוד האימות
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {error ? (
        <div className="text-red-500 text-center">
          <p className="mb-4">אירעה שגיאה בתהליך ההתחברות.</p>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/auth')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
          >
            חזרה לדף ההתחברות
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin mb-4"></div>
          <p className="text-xl">מעבד את פרטי ההתחברות שלך...</p>
        </div>
      )}
    </div>
  );
};

export default AuthCallback;
