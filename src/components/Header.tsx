import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserCircle } from 'lucide-react';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
          מרכז הגמ״חים
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link 
            to="/register-gemach" 
            className="text-gray-600 hover:text-blue-600 transition-colors hidden sm:block"
          >
            רישום גמ״ח
          </Link>
          {user ? (
            <Button 
              variant="ghost" 
              className="flex items-center gap-2" 
              onClick={() => window.location.href = '/dashboard'}
            >
              <UserCircle className="h-5 w-5" />
              <span className="hidden sm:inline">אזור אישי</span>
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={() => window.location.href = '/auth'}
            >
              <UserCircle className="h-5 w-5" />
              <span className="hidden sm:inline">התחברות</span>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
