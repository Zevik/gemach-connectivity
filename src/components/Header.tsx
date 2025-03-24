
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary">
          מרכז הגמ"חים
        </Link>
        
        <nav className="flex gap-6">
          <Link to="/" className="text-gray-600 hover:text-primary">
            רישום גמ"ח
          </Link>
          <Link to="/gemachs" className="text-gray-600 hover:text-primary">
            חיפוש גמ"חים
          </Link>
          <Link to="/dashboard" className="text-gray-600 hover:text-primary">
            דף הבית
          </Link>
          {user ? (
            <Link to="/dashboard" className="text-gray-600 hover:text-primary">
              התחברות
            </Link>
          ) : (
            <Link to="/auth" className="text-gray-600 hover:text-primary">
              התחברות
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
