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

const Header = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'רישום גמ״ח', href: '/register-gemach' },
    { label: user ? 'אזור אישי' : 'התחברות', href: user ? '/dashboard' : '/auth' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
          מרכז הגמ״חים
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/register-gemach" 
            className="text-gray-600 hover:text-blue-600 transition-colors"
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
              <span>אזור אישי</span>
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={() => window.location.href = '/auth'}
            >
              <UserCircle className="h-5 w-5" />
              <span>התחברות</span>
            </Button>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-right">תפריט</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="text-lg text-gray-600 hover:text-blue-600 transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
