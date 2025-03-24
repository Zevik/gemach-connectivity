
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
    name: "גמ\"ח בגדי ילדים - רמות",
    category: "בגדים",
    neighborhood: "רמות אלון",
    address: "רחוב שירת הים 12, רמות אלון",
    phone: "02-1234567",
    description: "גמ\"ח בגדי ילדים לכל הגילאים. כל המידות, בגדי שבת וחול."
  },
  {
    id: 2,
    name: "גמ\"ח ספרי לימוד",
    category: "ספרים",
    neighborhood: "קרית משה | גבעת שאול",
    address: "רחוב הרב צבי יהודה 15, גבעת שאול",
    phone: "02-7654321",
    description: "גמ\"ח ספרי לימוד לכל הכיתות, ספרי קודש, וחוברות לימוד."
  },
  {
    id: 3,
    name: "גמ\"ח ציוד רפואי",
    category: "סיוע רפואי",
    neighborhood: "בית וגן",
    address: "רחוב עוזיאל 30, בית וגן",
    phone: "02-5551234",
    description: "גמ\"ח לציוד רפואי - כסאות גלגלים, קביים, מדי סוכר, מדי לחץ דם ועוד."
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">חיפוש גמ"חים</h1>
      
      {/* חיפוש וסינון */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-8 animate-scale-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block mb-2 text-sm font-medium">חיפוש חופשי</label>
            <Input
              id="search"
              placeholder="הקלד שם או תיאור..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="neighborhood" className="block mb-2 text-sm font-medium">שכונה</label>
            <Select value={selectedNeighborhood} onValueChange={setSelectedNeighborhood}>
              <SelectTrigger>
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
          
          <div>
            <label htmlFor="category" className="block mb-2 text-sm font-medium">קטגוריה</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
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
        </div>
      </div>
      
      {/* תוצאות חיפוש */}
      <div className="space-y-4">
        {filteredGemachs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-500">לא נמצאו גמ"חים התואמים את החיפוש שלך.</p>
          </div>
        ) : (
          filteredGemachs.map((gemach, index) => (
            <Card 
              key={gemach.id} 
              className="hover:shadow-lg transition-all animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
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
    </div>
  );
};

export default GemachsList;
