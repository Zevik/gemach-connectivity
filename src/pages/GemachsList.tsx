
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Clock, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const neighborhoods = [
  "ארמון הנציב - תלפ\"ז", "ארנונה", "בית הכרם", "בית וגן", "בקעה", 
  "גבעת מרדכי", "גבעת משואה", "גילה", "הגבעה הצרפתית", "הולילנד",
  "הר חומה", "הר נוף", "הרובע היהודי העיר העתיקה", "טלביה", "מלחה",
  "מרכז העיר - נחלת שבעה", "משכנות האומה", "נווה יעקב", "נחלאות", "ניות",
  "עמק רפאים - המושבה הגרמנית", "פסגת זאב", "קטמון א-ו | גוננים | קטמונים",
  "קטמון הישנה", "קטמונים ו'", "קרית היובל", "קרית מנחם | עיר גנים",
  "קרית משה | גבעת שאול", "רחביה", "רמות אלון", "רמות אשכול",
  "רמת בית הכרם", "רמת שרת | רמת דניה", "שכונת רסקו", "תלפיות"
];

const categories = [
  "בגדים", "ספרים", "ריהוט", "מוצרי תינוקות", "כלי בית", "סיוע רפואי",
  "מוצרי מזון", "ציוד חשמלי", "עזרה לחתן וכלה", "ציוד לימודי", "אחר"
];

// דוגמה של נתוני גמ"חים לבדיקה
const dummyGemachs = [
  {
    id: 1,
    name: "גמ\"ח ציוד רפואי",
    category: "סיוע רפואי",
    neighborhood: "רמות אלון",
    address: "רחוב שירת הים 12, רמות אלון",
    phone: "02-456-7890",
    description: "גמ\"ח לציוד רפואי - כסאות גלגלים, קביים, מדי סוכר, מדי לחץ דם ועוד.",
    image: "/lovable-uploads/73990076-631e-4f06-9339-bffc197e7186.png",
    hours: "ימים א'-ה' 9:00-13:00, 16:00-19:00",
    isFeatured: true
  },
  {
    id: 2,
    name: "גמ\"ח בגדי ילדים",
    category: "בגדים",
    neighborhood: "קרית משה | גבעת שאול",
    address: "רחוב הרב צבי יהודה 15, גבעת שאול",
    phone: "02-987-6543",
    description: "גמ\"ח בגדי ילדים לכל הגילאים. כל המידות, בגדי שבת וחול.",
    image: "/lovable-uploads/e62c316d-cd10-49e4-971d-ea2969cfccd8.png",
    hours: "יום א' 10:00-16:00",
    isFeatured: true
  },
  {
    id: 3,
    name: "גמ\"ח ספרי תורה",
    category: "ספרים",
    neighborhood: "בית וגן",
    address: "רחוב עוזיאל 30, בית וגן",
    phone: "02-123-4567",
    description: "גמ\"ח לספרי קודש, ספרי לימוד וחוברות לימוד.",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1974&auto=format&fit=crop",
    hours: "ימים א'-ה' 9:00-13:00, 16:00-19:00",
    isFeatured: true
  }
];

const GemachsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [gemachs, setGemachs] = useState(dummyGemachs);

  // פונקציה לסינון התוצאות
  const filteredGemachs = gemachs.filter(gemach => {
    const matchesSearch = searchTerm === '' || 
      gemach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gemach.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesNeighborhood = selectedNeighborhood === 'all' || 
      gemach.neighborhood === selectedNeighborhood;
      
    const matchesCategory = selectedCategory === 'all' || 
      gemach.category === selectedCategory;
      
    return matchesSearch && matchesNeighborhood && matchesCategory;
  });

  const featuredGemachs = gemachs.filter(gemach => gemach.isFeatured);

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      {/* Header section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-primary">מצא את הגמ״חים בירושלים</h1>
        <p className="text-lg text-gray-600 mb-8">
          חיבור חברי הקהילה עם שירותים, השאלות והתרומות חיים דרך רשת הגמ״חים של ירושלים
        </p>
      </div>

      {/* Search and filter section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 animate-scale-in">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[250px] relative">
            <Input
              placeholder='חיפוש גמ"ח...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          <div className="w-full sm:w-auto">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="min-w-[180px]">
                <SelectValue placeholder="כל הקטגוריות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הקטגוריות</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-auto">
            <Select value={selectedNeighborhood} onValueChange={setSelectedNeighborhood}>
              <SelectTrigger className="min-w-[180px]">
                <SelectValue placeholder="כל השכונות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל השכונות</SelectItem>
                {neighborhoods.map((neighborhood) => (
                  <SelectItem key={neighborhood} value={neighborhood}>
                    {neighborhood}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="default" className="px-6">
            חיפוש
          </Button>
        </div>
      </div>

      <div className="flex gap-4 justify-center mb-12">
        <Button variant="outline" className="px-6">
          רישום הגמ״ח שלך
        </Button>
        <Button variant="default" className="px-6">
          צפייה בכל הגמ״חים
        </Button>
      </div>

      {/* Featured Gemachs */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center text-primary">גמ״חים מובחרים</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredGemachs.map((gemach) => (
            <Card key={gemach.id} className="overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={gemach.image} 
                  alt={gemach.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs">
                  {gemach.category === "סיוע רפואי" ? "ציוד רפואי" : 
                   gemach.category === "בגדים" ? "בגדי ילדים" : "ספרי תורה"}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-bold mb-2">{gemach.name}</h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 ml-1" />
                  <span className="text-sm">{gemach.neighborhood}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <span className="font-medium ml-1">טלפון:</span>
                  <span className="text-sm">{gemach.phone}</span>
                </div>
                <div className="flex items-start text-gray-600 mb-4">
                  <Clock className="h-4 w-4 ml-1 mt-1" />
                  <span className="text-sm">{gemach.hours}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How it works section */}
      <div className="bg-blue-50 rounded-lg p-8 mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center text-primary">איך זה עובד</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-bold mb-2">חיפוש</h3>
            <p className="text-gray-600">
              מצא את הגמ״חים שאתה צריך באמצעות מנוע החיפוש הקהילתי שלנו
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="text-xl font-bold mb-2">התחברות</h3>
            <p className="text-gray-600">
              צור קשר עם מנהלי הגמ״ח ישירות באמצעות פרטי הקשר המופיעים
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="text-xl font-bold mb-2">הפצת המידע</h3>
            <p className="text-gray-600">
              קבל את המידע והפנה חברים, או שתף אותנו בגמ״חים אחרים שאתה מכיר
            </p>
          </div>
        </div>
      </div>

      {/* Register your Gemach */}
      <div className="bg-white p-8 rounded-lg shadow-md mb-16">
        <h2 className="text-2xl font-bold mb-4 text-center text-primary">מנהל/ת גמ״ח?</h2>
        <p className="text-center text-gray-600 mb-6">
          רשמו את הגמ״ח שלך בפלטפורמה שלנו כדי להגיע לקהל אנשים הזקוקים לעזרה ולהגדיל את ההשפעה הקהילתית שלך
        </p>
        <div className="flex justify-center">
          <Link to="/register-gemach">
            <Button variant="default" size="lg" className="px-8">
              רישום הגמ״ח שלך
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtered results section (shown when search is active) */}
      {searchTerm !== '' || selectedCategory !== 'all' || selectedNeighborhood !== 'all' ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">תוצאות חיפוש</h2>
          {filteredGemachs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-gray-500">לא נמצאו גמ״חים התואמים את החיפוש שלך.</p>
            </div>
          ) : (
            filteredGemachs.map((gemach) => (
              <Card 
                key={gemach.id} 
                className="hover:shadow-lg transition-all animate-fade-in"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold mb-2">{gemach.name}</h2>
                      <div className="flex space-x-4 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-4">
                          {gemach.category}
                        </span>
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          {gemach.neighborhood}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{gemach.description}</p>
                      <div className="text-sm text-gray-500">
                        <p>{gemach.address}</p>
                        <p>טלפון: {gemach.phone}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      פרטים נוספים
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : null}

      {/* Footer with links */}
      <div className="border-t border-gray-200 pt-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">מרכז הגמ״חים</h3>
            <p className="text-gray-600 mb-2">
              המקום להקלת חיפוש של שירותים והשאלות של צדקה
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">קישורים מהירים</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-blue-600 hover:underline">דף הבית</a></li>
              <li><a href="#" className="text-blue-600 hover:underline">חיפוש גמ״ח</a></li>
              <li><a href="#" className="text-blue-600 hover:underline">רישום גמ״ח</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">יצירת קשר</h3>
            <p className="text-gray-600">לפניות או שאלות אנא צרו קשר עם המנהל:</p>
            <a href="mailto:zaxner@gmail.com" className="text-blue-600 hover:underline">zaxner@gmail.com</a>
          </div>
        </div>
        <div className="text-center text-gray-500 text-sm mt-8">
          © 2023 מרכז הגמ״חים. כל הזכויות שמורות.
        </div>
      </div>
    </div>
  );
};

export default GemachsList;
