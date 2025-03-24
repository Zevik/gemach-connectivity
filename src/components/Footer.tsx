
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white py-8 border-t mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-right">
            <h3 className="text-lg font-bold mb-4">מרכז הגמ"חים</h3>
            <p className="text-gray-600">
              מאגר את הקהילה ומאפשר קשר נגיש ומהיר למשאירים ומחפשים גמ"חים
            </p>
          </div>
          
          <div className="text-right">
            <h3 className="text-lg font-bold mb-4">קישורים מהירים</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary">
                  דף הבית
                </Link>
              </li>
              <li>
                <Link to="/gemachs" className="text-gray-600 hover:text-primary">
                  חיפוש גמ"חים
                </Link>
              </li>
              <li>
                <Link to="/register-gemach" className="text-gray-600 hover:text-primary">
                  רישום גמ"ח
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="text-right">
            <h3 className="text-lg font-bold mb-4">יצירת קשר</h3>
            <p className="text-gray-600">לפניות או שאלות אנא צרו קשר עם הצוות:</p>
            <p className="text-primary">zaviner@gmail.com</p>
          </div>
        </div>
        
        <div className="text-center mt-8 text-gray-500 text-sm">
          © 2023 מרכז הגמ"חים. כל הזכויות שמורות.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
