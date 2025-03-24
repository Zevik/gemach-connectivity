import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Clock, Phone, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { neighborhoods, categories } from '@/data/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';

// דוגמה של נתוני גמ"חים לבדיקה
const dummyGemachs = [
  {
    id: 1,
    name: "גמ\"ח כלי עבודה",
    category: "כלי בית",
    neighborhood: "רחביה",
    address: "רחוב קרן היסוד 19, ירושלים",
    phone: "02-123-4567",
    hours: "א'-ה' 9:00-19:00",
    description: "השאלת כלי עבודה לבית ולגינה",
    image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: 2,
    name: "גמ\"ח ציוד רפואי",
    category: "סיוע רפואי",
    neighborhood: "בית וגן",
    address: "רחוב הפסגה 42, ירושלים",
    phone: "02-765-4321",
    hours: "א'-ה' 10:00-18:00, ו' 9:00-12:00",
    description: "השאלת ציוד רפואי לנזקקים",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2130&q=80"
  },
  {
    id: 3,
    name: "גמ\"ח ספרי לימוד",
    category: "ספרים",
    neighborhood: "הר נוף",
    address: "רחוב קצנלבוגן 32, ירושלים",
    phone: "02-987-6543",
    hours: "א', ג', ה' 16:00-20:00",
    description: "השאלת ספרי לימוד לתלמידים",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: 4,
    name: "גמ\"ח שמלות כלה",
    category: "עזרה לחתן וכלה",
    neighborhood: "גאולה",
    address: "רחוב מלכי ישראל 8, ירושלים",
    phone: "02-345-6789",
    hours: "א'-ה' 10:00-20:00",
    description: "השאלת שמלות כלה וערב",
    image: "https://images.unsplash.com/photo-1525257831700-383215253d18?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
  },
  {
    id: 5,
    name: "גמ\"ח ריהוט",
    category: "ריהוט",
    neighborhood: "קרית משה | גבעת שאול",
    address: "רחוב הרב הרצוג 25, ירושלים",
    phone: "02-234-5678",
    hours: "א', ג', ה' 9:00-13:00",
    description: "השאלת וחלוקת ריהוט לנזקקים",
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80"
  },
  {
    id: 6,
    name: "גמ\"ח מוצרי תינוקות",
    category: "מוצרי תינוקות",
    neighborhood: "רמות אלון",
    address: "שדרות גולדה מאיר 12, ירושלים",
    phone: "02-876-5432",
    hours: "ב', ד' 16:00-21:00",
    description: "השאלת ציוד ומוצרים לתינוקות ופעוטות",
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  }
];

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [gemachs] = useState(dummyGemachs);
  const [selectedGemach, setSelectedGemach] = useState<typeof dummyGemachs[0] | null>(null);

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
                <Card 
                  key={gemach.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  onClick={() => setSelectedGemach(gemach)}
                >
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
      </main>
      
      <Footer />

      {/* Gemach Details Dialog */}
      <Dialog open={!!selectedGemach} onOpenChange={(open) => !open && setSelectedGemach(null)}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          {selectedGemach && (
            <>
              <div className="relative h-52 overflow-hidden">
                <img 
                  src={selectedGemach.image} 
                  alt={selectedGemach.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                    {selectedGemach.category}
                  </span>
                </div>
                <DialogClose className="absolute top-2 left-2 rounded-full h-8 w-8 flex items-center justify-center bg-gray-800 bg-opacity-60 text-white hover:bg-opacity-80">
                  <X className="h-5 w-5" />
                </DialogClose>
              </div>
              
              <div className="p-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold mb-2">{selectedGemach.name}</DialogTitle>
                  <DialogDescription className="text-gray-600 mb-4">
                    {selectedGemach.description}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 mt-0.5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium">כתובת</p>
                      <p className="text-gray-700">{selectedGemach.address}</p>
                      <p className="text-gray-700">{selectedGemach.neighborhood}, ירושלים</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 mt-0.5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium">טלפון</p>
                      <p className="text-gray-700">{selectedGemach.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 mt-0.5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium">שעות פעילות</p>
                      <p className="text-gray-700">{selectedGemach.hours}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button onClick={() => setSelectedGemach(null)}>סגור</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
