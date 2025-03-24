
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Auth = () => {
  const { user, isLoading } = useAuth();

  // אם המשתמש כבר מחובר, הפנה אותו ללוח המחוונים
  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AuthForm />;
};

export default Auth;
