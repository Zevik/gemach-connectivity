import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If user is logged in, navigate to register gemach page
    // Otherwise, navigate to auth page first
    navigate(user ? '/register-gemach' : '/auth');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-center mb-6 text-primary">הרשמת גמ"ח חדש</h1>
          <p className="text-gray-600 text-center mb-8">
            המטרה של הפלטפורמה היא לחבר בין אנשים שמחפשים לעזרה לבין האפשרויות הקהילתיות שלך
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6 rtl">
            {/* שם הגמ"ח */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-right block">
                שם הגמ"ח <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="הכניסו את שם הגמ"ח"
                className="text-right"
                required
              />
            </div>
            
            {/* קטגוריה */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-right block">
                קטגוריה <span className="text-red-500">*</span>
              </Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right md:text-sm"
              >
                <option value="">בחרו קטגוריה</option>
                <option value="ציוד-לתינוקות">ציוד לתינוקות</option>
                <option value="ציוד-רפואי">ציוד רפואי</option>
                <option value="כלי-מטבח">כלי מטבח</option>
                <option value="שמחות">שמחות</option>
                <option value="אחר">אחר</option>
              </select>
            </div>
            
            {/* תיאור מפורט של הגמ"ח */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-right block">
                תיאור מפורט של הגמ"ח <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="אנא פרטו: תיאור של הגמ"ח, מה כולל, לאילו מטרות ומי רשאי להשתמש בשירותים"
                className="text-right min-h-[120px]"
                required
              />
            </div>
            
            {/* פרטי תשלום */}
            <div>
              <h3 className="text-xl font-medium text-right mb-3">פרטי תשלום</h3>
              <div className="space-y-4">
                <div className="flex gap-2 items-center justify-end">
                  <Checkbox id="free" />
                  <Label htmlFor="free" className="text-right">
                    הגמ"ח הוא תשלום מסובסד
                  </Label>
                </div>
              </div>
            </div>
            
            {/* מיקום */}
            <div>
              <h3 className="text-xl font-medium text-right mb-3">מיקום</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-right block">
                    עיר <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    placeholder="ירושלים"
                    className="text-right"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="neighborhood" className="text-right block">
                    שכונה <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="neighborhood"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right md:text-sm"
                  >
                    <option value="">בחרו שכונה</option>
                    <option value="רמות">רמות</option>
                    <option value="גילה">גילה</option>
                    <option value="רמת-אשכול">רמת אשכול</option>
                    <option value="בית-וגן">בית וגן</option>
                    <option value="הר-נוף">הר נוף</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-right block">
                    כתובת מדויקת <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    placeholder="רחוב ומספר"
                    className="text-right"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="directions" className="text-right block">
                    הוראות הגעה
                  </Label>
                  <Textarea
                    id="directions"
                    placeholder="פרטו איך להגיע אליכם (למשל: כניסה ג', קומה 2, דירה 7 משמאל)"
                    className="text-right"
                  />
                </div>
              </div>
            </div>
            
            {/* פרטי יצירת קשר */}
            <div>
              <h3 className="text-xl font-medium text-right mb-3">פרטי יצירת קשר</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName" className="text-right block">
                    שם איש קשר <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contactName"
                    placeholder="שם מלא"
                    className="text-right"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-right block">
                    טלפון ליצירת קשר <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="02-123-4567"
                    className="text-right"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-right block">
                    טלפון נייד של מפעיל הגמ"ח (רשות)
                  </Label>
                  <Input
                    id="mobile"
                    placeholder="050-123-4567"
                    className="text-right"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-right block">
                    דוא"ל
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="text-right"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="hours" className="text-right block">
                    שעות פעילות <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="hours"
                    placeholder="לדוגמה: א'-ה' 9:00-13:00, 15:00-18:00"
                    className="text-right"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-right block">
                    קישור לאתר (אם יש)
                  </Label>
                  <Input
                    id="website"
                    placeholder="https://www.example.com"
                    className="text-right"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="text-right block">
                    קישור לעמוד פייסבוק (אם יש)
                  </Label>
                  <Input
                    id="facebook"
                    placeholder="https://www.facebook.com/yourgmach"
                    className="text-right"
                  />
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700"
            >
              שליחת הרשמה
            </Button>
            
            <p className="text-gray-500 text-sm text-right">
              בעת שליחת הטופס, אתם מסכימים כי המידע שלכם יוצג באתר ויהיה נגיש לשימוש הציבור. 
              המשתמש מתחייב כי כל המידע שהוכנס הינו אמיתי ומדויק.
            </p>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
