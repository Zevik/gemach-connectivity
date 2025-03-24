import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { neighborhoods, categories } from '@/data/constants';

// דוגמה של נתוני גמ"חים לבדיקה
const dummyGemachs = [
  {
    id: 1,
    name: "גמ״ח ציוד רפואי",
    category: "סיוע רפואי",
    neighborhood: "רמות אלון",
    address: "רחוב שירת הים 12, רמות אלון",
    phone: "02-456-7890",
    description: "גמ״ח לציוד רפואי - כסאות גלגלים, קביים, מדי סוכר, מדי לחץ דם ועוד.",
    image: "/medical-equipment.jpg",
    hours: "ימים א'-ה' 9:00-13:00, 16:00-19:00",
    isFeatured: true
  },
  {
    id: 2,
    name: "גמ״ח בגדי ילדים",
    category: "בגדים",
    neighborhood: "קרית משה | גבעת שאול",
    address: "רחוב הרב צבי יהודה 15, גבעת שאול",
    phone: "02-987-6543",
    description: "גמ״ח בגדי ילדים לכל הגילאים. כל המידות, בגדי שבת וחול.",
    image: "/kids-clothes.jpg",
    hours: "יום א' 10:00-16:00",
    isFeatured: true
  },
  {
    id: 3,
    name: "גמ״ח ספרי תורה",
    category: "ספרים",
    neighborhood: "בית וגן",
    address: "רחוב עוזיאל 30, בית וגן",
    phone: "02-123-4567",
    description: "גמ״ח לספרי קודש, ספרי לימוד וחוברות לימוד.",
    image: "/torah-books.jpg",
    hours: "ימים א'-ה' 9:00-13:00, 16:00-19:00",
    isFeatured: true
  }
];

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [gemachs] = useState(dummyGemachs);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
  };

  const navigateToRegister = () => {
    navigate(user ? '/register-gemach' : '/auth');
  };

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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white py-16 md:py-24 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 md:mb-8 text-[#0C4A6E] leading-tight">
              מצא את הגמ״חים בירושלים
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed">
              חיבור חברי הקהילה עם שירותים, השאלות ומוצרים דרך רשת הגמ״חים של ירושלים
            </p>
            
            {/* Search Bar and Filters */}
            <div className="max-w-3xl mx-auto mb-8 md:mb-12 bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="חיפוש גמ״ח..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-12 pl-12 pr-4 text-base rounded-lg"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </form>
            </div>
          </div>
        </section>

        {/* Featured Gemachs */}
        <section className="py-12 md:py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
              גמ״חים מובילים
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredGemachs.map((gemach) => (
                <Card key={gemach.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={gemach.image} 
                      alt={gemach.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                      {gemach.category}
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-xl font-bold mb-3">{gemach.name}</h3>
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">{gemach.neighborhood}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">{gemach.hours}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="bg-white py-12 md:py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
              איך זה עובד
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-bold mb-3">חיפוש</h3>
                <p className="text-gray-600">
                  מצא את הגמ״ח המתאים באמצעות חיפוש מהיר או סינון לפי קטגוריות
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3">התחברות</h3>
                <p className="text-gray-600">
                  צור קשר עם הגמ״ח דרך פרטי ההתקשרות המופיעים בכרטיס המידע
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3">הפקת תועלת</h3>
                <p className="text-gray-600">
                  קבל את השירות או המוצר שחיפשת בקלות ובמהירות
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
