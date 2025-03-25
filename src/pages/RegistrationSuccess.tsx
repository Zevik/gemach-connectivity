import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const RegistrationSuccess = () => {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center text-center max-w-lg" dir="rtl">
      <div className="mb-6 text-green-500">
        <CheckCircle size={80} />
      </div>
      
      <h1 className="text-3xl font-bold mb-6">תודה על הרשמת הגמ״ח!</h1>
      
      <p className="text-lg text-gray-700 mb-8">
        פרטי הגמ״ח נשלחו בהצלחה ונמצאים כעת בבדיקה של צוות האתר.
        אנו נבחן את הפרטים ונאשר את הגמ״ח בהקדם האפשרי.
      </p>
      
      <div className="bg-blue-50 p-6 rounded-lg mb-8 w-full">
        <h2 className="text-xl font-bold mb-3">מה קורה עכשיו?</h2>
        <ul className="text-gray-700 text-right space-y-3">
          <li className="flex items-start">
            <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center ml-3 flex-shrink-0">1</span>
            <span>צוות האתר יבחן את פרטי הגמ״ח שהוגשו</span>
          </li>
          <li className="flex items-start">
            <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center ml-3 flex-shrink-0">2</span>
            <span>אם יש צורך, ניצור איתך קשר לאימות או השלמת פרטים</span>
          </li>
          <li className="flex items-start">
            <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center ml-3 flex-shrink-0">3</span>
            <span>לאחר אישור, הגמ״ח יופיע באתר ויהיה נגיש לכל המשתמשים</span>
          </li>
        </ul>
      </div>
      
      <div className="flex gap-4">
        <Button asChild variant="default">
          <Link to="/">חזרה לדף הראשי</Link>
        </Button>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
