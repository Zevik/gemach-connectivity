
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Clock, Phone, Info, X, Loader2, Mail, LinkIcon, FacebookIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { neighborhoods, categories } from '@/data/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// פונקציה להשגת תמונת הגמ״ח - זהה לפונקציה בעמוד GemachDetail
const fetchGemachImage = async (gemachId: string) => {
  try {
    console.log('Fetching gemach image for ID:', gemachId);
    
    // בדיקה אם יש תמונת גמ״ח
    const { data, error } = await supabase
      .from('gemach_images')
      .select('storage_path')
      .eq('gemach_id', gemachId)
      .eq('is_primary', true)
      .single();

    if (error) {
      console.error('Error fetching gemach image data:', error);
      return null;
    }

    if (!data || !data.storage_path) {
      console.log('No image found for gemach ID:', gemachId);
      return null;
    }

    console.log('Found image with storage path:', data.storage_path);

    // השגת ה-URL הציבורי של התמונה
    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(data.storage_path);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      console.error('Failed to get public URL for image', data.storage_path);
      return null;
    }

    console.log('Got public URL:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Exception in fetchGemachImage:', error);
    return null;
  }
};

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [gemachs, setGemachs] = useState<any[]>([]);
  const [selectedGemach, setSelectedGemach] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});

  // Load gemachs from Supabase
  const fetchGemachs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('gemachs')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Initialize image loading states
        const loadingStates: Record<string, boolean> = {};
        data.forEach(gemach => {
          loadingStates[gemach.id] = true;
        });
        setImageLoadingStates(loadingStates);
        
        // שאיבת נתוני הגמחים כולל תמונות
        const gemachsWithImages = await Promise.all(
          data.map(async (gemach) => {
            const imageUrl = await fetchGemachImage(gemach.id);
            
            // עדכון סטטוס הטעינה לאחר השגת התמונה
            setImageLoadingStates(prev => ({
              ...prev,
              [gemach.id]: false
            }));
            
            return {
              ...gemach,
              image_url: imageUrl
            };
          })
        );
        
        setGemachs(gemachsWithImages);
      } else {
        setGemachs([]);
      }
    } catch (error) {
      console.error('Error fetching gemachs:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת הגמחים",
        description: "אירעה שגיאה בטעינת רשימת הגמחים. אנא נסה שוב מאוחר יותר."
      });
      setGemachs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load gemachs when component mounts
  useEffect(() => {
    fetchGemachs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the filteredGemachs filter function
  };

  const navigateToRegister = () => {
    navigate(user ? '/register-gemach' : '/auth');
  };

  const filteredGemachs = gemachs.filter(gemach => {
    const gemachName = gemach.name || '';
    const gemachDescription = gemach.description || '';
    const gemachNeighborhood = gemach.neighborhood || '';
    const gemachCategory = gemach.category || '';
    
    const matchesSearch = searchTerm === '' || 
      gemachName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gemachDescription.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesNeighborhood = selectedNeighborhood === 'all' || 
      gemachNeighborhood === selectedNeighborhood;
      
    const matchesCategory = selectedCategory === 'all' || 
      gemachCategory === selectedCategory;
      
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

        {/* Gemachs Grid */}
        <section className="py-12 md:py-16 px-4">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-center">
                גמ״חים מובילים
              </h2>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
                <span className="text-lg mr-4">טוען גמ״חים...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredGemachs.length > 0 ? (
                  filteredGemachs.map((gemach) => (
                    <Card 
                      key={gemach.id} 
                      className="overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                      onClick={() => setSelectedGemach(gemach)}
                    >
                      <div className="relative h-48 overflow-hidden">
                        {imageLoadingStates[gemach.id] ? (
                          <Skeleton className="h-full w-full" />
                        ) : gemach.image_url ? (
                          <img 
                            src={gemach.image_url} 
                            alt={gemach.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Failed to load image:', gemach.image_url);
                              const target = e.target as HTMLImageElement;
                              target.onerror = null; // Prevent infinite loop
                              target.src = '/placeholder.svg'; // Use placeholder
                            }}
                          />
                        ) : (
                          <div className="h-full bg-gray-100 flex items-center justify-center">
                            <p className="text-gray-500">אין תמונה זמינה</p>
                          </div>
                        )}
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
                  ))
                ) : (
                  <div className="col-span-full py-10 text-center text-gray-500">
                    לא נמצאו גמ״חים התואמים את החיפוש. 
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />

      {/* Gemach Details Dialog - מציג את כל המידע של הגמח */}
      <Dialog open={!!selectedGemach} onOpenChange={(open) => !open && setSelectedGemach(null)}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          {selectedGemach && (
            <>
              <div className="relative h-52 overflow-hidden">
                {selectedGemach.image_url ? (
                  <img 
                    src={selectedGemach.image_url} 
                    alt={selectedGemach.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Failed to load dialog image:', selectedGemach.image_url);
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Prevent infinite loop
                      target.src = '/placeholder.svg'; // Use placeholder
                    }}
                  />
                ) : (
                  <div className="h-full bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500">אין תמונה זמינה</p>
                  </div>
                )}
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
                  {/* כתובת */}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 mt-0.5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium">כתובת</p>
                      <p className="text-gray-700">{selectedGemach.address}</p>
                      <p className="text-gray-700">{selectedGemach.neighborhood}, ירושלים</p>
                      {selectedGemach.location_instructions && (
                        <p className="text-gray-700 mt-1">{selectedGemach.location_instructions}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* טלפון */}
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 mt-0.5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium">טלפון</p>
                      <p className="text-gray-700">
                        <a href={`tel:${selectedGemach.phone}`} className="text-primary hover:underline">
                          {selectedGemach.phone}
                        </a>
                      </p>
                      {selectedGemach.manager_phone && (
                        <p className="text-gray-700">
                          <a href={`tel:${selectedGemach.manager_phone}`} className="text-primary hover:underline">
                            {selectedGemach.manager_phone} (מנהל)
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* אימייל */}
                  {selectedGemach.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 mt-0.5 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium">אימייל</p>
                        <p className="text-gray-700">
                          <a href={`mailto:${selectedGemach.email}`} className="text-primary hover:underline">
                            {selectedGemach.email}
                          </a>
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* שעות פעילות */}
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 mt-0.5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium">שעות פעילות</p>
                      <p className="text-gray-700">{selectedGemach.hours}</p>
                    </div>
                  </div>
                  
                  {/* פרטי תשלום */}
                  {selectedGemach.has_fee && selectedGemach.fee_details && (
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 mt-0.5 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium">פרטי תשלום</p>
                        <p className="text-gray-700">{selectedGemach.fee_details}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* קישורים */}
                  <div className="space-y-2">
                    {selectedGemach.website_url && (
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-gray-500" />
                        <a 
                          href={selectedGemach.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          אתר אינטרנט
                        </a>
                      </div>
                    )}
                    {selectedGemach.facebook_url && (
                      <div className="flex items-center gap-2">
                        <FacebookIcon className="h-4 w-4 text-gray-500" />
                        <a 
                          href={selectedGemach.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          דף פייסבוק
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button onClick={() => navigate(`/gemach/${selectedGemach.id}`)}>
                    צפייה בעמוד הגמ״ח
                  </Button>
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
