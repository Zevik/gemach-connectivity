
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { neighborhoods, categories } from '@/data/constants';

interface HeroSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedNeighborhood: string;
  setSelectedNeighborhood: (neighborhood: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  handleSearch: (e: React.FormEvent) => void;
}

export const HeroSection = ({
  searchTerm,
  setSearchTerm,
  selectedNeighborhood,
  setSelectedNeighborhood,
  selectedCategory,
  setSelectedCategory,
  handleSearch
}: HeroSectionProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const navigateToRegister = () => {
    navigate(user ? '/register-gemach' : '/auth');
  };
  
  return (
    <section className="relative bg-gradient-to-br from-sky-600 to-sky-800 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-repeat opacity-30" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
      </div>
      
      <div className="container mx-auto py-16 md:py-24 px-4 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 md:mb-8 leading-tight animate-fade-in">
            מצא את הגמ״חים בירושלים
          </h1>
          <p className="text-lg md:text-xl mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed opacity-90 animate-scale-in">
            חיבור חברי הקהילה עם שירותים, השאלות ומוצרים דרך רשת הגמ״חים של ירושלים
          </p>
          
          <div className="flex justify-center mb-8">
            <Button 
              onClick={navigateToRegister}
              className="bg-white text-sky-700 hover:bg-sky-50 transition-colors px-6 py-2 text-lg shadow-lg animate-slide-from-right"
            >
              <MapPin className="ml-2 h-5 w-5" />
              רישום גמ״ח חדש
            </Button>
          </div>
          
          {/* Search Bar and Filters */}
          <div className="max-w-3xl mx-auto mb-8 md:mb-12 bg-white rounded-xl shadow-lg animate-scale-in">
            <form onSubmit={handleSearch} className="p-4 md:p-6">
              <div className="relative mb-4">
                <Input
                  type="text"
                  placeholder="חפש גמ״ח לפי שם, קטגוריה או תיאור..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 pl-12 pr-4 text-base rounded-lg border-gray-300 focus:border-sky-500 focus:ring-sky-500"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-11 border-gray-300">
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
                  <SelectTrigger className="h-11 border-gray-300">
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
      </div>
    </section>
  );
};
