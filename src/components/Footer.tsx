
import { Link } from 'react-router-dom';
import { PhoneIcon, Mail, MapPin, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4 text-sky-700">מרכז הגמ״חים</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              חיבור חברי הקהילה עם שירותים, השאלות ומוצרים דרך רשת הגמ״חים של ירושלים.
              פלטפורמה לחיפוש ומציאת גמחים בקלות.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-sky-700">קישורים מהירים</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-sky-700 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-sky-500 rounded-full inline-block"></span>
                  דף הבית
                </Link>
              </li>
              <li>
                <Link to="/register-gemach" className="text-gray-600 hover:text-sky-700 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-sky-500 rounded-full inline-block"></span>
                  רישום גמ״ח
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-gray-600 hover:text-sky-700 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-sky-500 rounded-full inline-block"></span>
                  התחברות
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-sky-700 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-sky-500 rounded-full inline-block"></span>
                  אודות
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-sky-700">צור קשר</h3>
            <p className="text-gray-600 text-sm mb-3">
              לכל שאלה או בעיה, אנחנו כאן בשבילכם
            </p>
            <ul className="space-y-2">
              <li>
                <a 
                  href="mailto:support@gemach-center.com" 
                  className="text-gray-600 hover:text-sky-700 text-sm flex items-center gap-1"
                >
                  <Mail className="h-4 w-4 text-sky-600" />
                  support@gemach-center.com
                </a>
              </li>
              <li>
                <a 
                  href="tel:+972123456789" 
                  className="text-gray-600 hover:text-sky-700 text-sm flex items-center gap-1"
                >
                  <PhoneIcon className="h-4 w-4 text-sky-600" />
                  02-123-4567
                </a>
              </li>
              <li className="flex items-start gap-1">
                <MapPin className="h-4 w-4 text-sky-600 mt-1" />
                <span className="text-gray-600 text-sm">ירושלים, ישראל</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-0">
            © {new Date().getFullYear()} מרכז הגמ״חים. כל הזכויות שמורות.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-sky-500 transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
