import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">מרכז הגמ״חים</h3>
            <p className="text-gray-600 text-sm">
              חיבור חברי הקהילה עם שירותים, השאלות ומוצרים דרך רשת הגמ״חים של ירושלים
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">קישורים מהירים</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-blue-600 text-sm">
                  דף הבית
                </Link>
              </li>
              <li>
                <Link to="/register-gemach" className="text-gray-600 hover:text-blue-600 text-sm">
                  רישום גמ״ח
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-gray-600 hover:text-blue-600 text-sm">
                  התחברות
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">צור קשר</h3>
            <p className="text-gray-600 text-sm">
              לכל שאלה או בעיה, אנחנו כאן בשבילכם
            </p>
            <a 
              href="mailto:support@gemach-center.com" 
              className="text-blue-600 hover:text-blue-700 text-sm block mt-2"
            >
              support@gemach-center.com
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} מרכז הגמ״חים. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
