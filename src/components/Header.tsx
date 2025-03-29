
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserCircle, Menu, X, Home, PlusCircle, Info, User, LogOut } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Container } from './Container';

const Header = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-gradient-to-r from-sky-700 to-sky-600 text-white shadow-md sticky top-0 z-10">
      <Container>
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center gap-x-6">
            <Link to="/" className="text-2xl font-bold">מרכז הגמ״חים</Link>
            <nav className="hidden md:flex gap-x-6">
              <Link to="/" className="flex items-center gap-1 transition-colors hover:text-sky-100 py-2">
                <Home className="h-4 w-4" />
                דף הבית
              </Link>
              <Link to="/register-gemach" className="flex items-center gap-1 transition-colors hover:text-sky-100 py-2">
                <PlusCircle className="h-4 w-4" />
                הוספת גמ"ח
              </Link>
              <Link to="/about" className="flex items-center gap-1 transition-colors hover:text-sky-100 py-2">
                <Info className="h-4 w-4" />
                אודות
              </Link>
            </nav>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:bg-sky-700 flex items-center gap-2">
                    <UserCircle className="h-5 w-5" />
                    <span className="max-w-[150px] truncate">{user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      אזור אישי
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    התנתקות
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button className="bg-white text-sky-700 hover:bg-sky-50">התחבר / הרשם</Button>
              </Link>
            )}
          </div>
          
          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80vw] sm:w-[350px]">
                <SheetHeader className="mb-4">
                  <SheetTitle className="text-2xl text-right">תפריט</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4">
                  <SheetClose asChild>
                    <Link to="/" className="flex items-center gap-2 text-lg p-2 hover:bg-gray-100 rounded-md">
                      <Home className="h-5 w-5" /> דף הבית
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/register-gemach" className="flex items-center gap-2 text-lg p-2 hover:bg-gray-100 rounded-md">
                      <PlusCircle className="h-5 w-5" /> הוספת גמ"ח
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/about" className="flex items-center gap-2 text-lg p-2 hover:bg-gray-100 rounded-md">
                      <Info className="h-5 w-5" /> אודות
                    </Link>
                  </SheetClose>
                  
                  <div className="h-px bg-gray-200 my-2" />
                  
                  {user ? (
                    <>
                      <SheetClose asChild>
                        <Link to="/dashboard" className="flex items-center gap-2 text-lg p-2 hover:bg-gray-100 rounded-md">
                          <User className="h-5 w-5" /> אזור אישי
                        </Link>
                      </SheetClose>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-lg p-2 hover:bg-gray-100 rounded-md text-red-600"
                      >
                        <LogOut className="h-5 w-5" /> התנתקות
                      </button>
                    </>
                  ) : (
                    <SheetClose asChild>
                      <Link to="/auth" className="flex items-center gap-2 text-lg p-2 bg-sky-600 text-white rounded-md justify-center">
                        <UserCircle className="h-5 w-5" /> התחברות / הרשמה
                      </Link>
                    </SheetClose>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;
