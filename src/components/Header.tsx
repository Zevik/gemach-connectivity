import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserCircle, Menu, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Container } from './Container';

const Header = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'רישום גמ״ח', href: '/register-gemach' },
    { label: user ? 'אזור אישי' : 'התחברות', href: user ? '/dashboard' : '/auth' },
  ];

  return (
    <header className="bg-sky-600 text-white py-4 shadow-md sticky top-0 z-10">
      <Container>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-x-8">
            <Link to="/" className="text-2xl font-bold">מרכז הגמ״חים</Link>
            <nav className="hidden md:flex gap-x-6">
              <Link to="/" className="transition-colors hover:text-sky-100">דף הבית</Link>
              <Link to="/register-gemach" className="transition-colors hover:text-sky-100">הוספת גמ"ח</Link>
              <Link to="/about" className="transition-colors hover:text-sky-100">אודות</Link>
              {user && (
                <Link to="/dashboard" className="transition-colors hover:text-sky-100">אזור אישי</Link>
              )}
            </nav>
          </div>
          
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden md:inline-block ml-2">שלום, {user?.email}</span>
                <Button onClick={logout} variant="outline" className="text-white border-white hover:bg-sky-700">התנתק</Button>
              </>
            ) : (
              <Link to="/auth">
                <Button className="bg-transparent text-white border-white hover:bg-sky-700 hover:text-white">התחבר / הרשם</Button>
              </Link>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;
