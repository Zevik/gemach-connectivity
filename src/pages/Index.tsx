import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { HeroSection } from '@/components/HeroSection';
import { GemachGrid } from '@/components/GemachGrid';

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
        <HeroSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedNeighborhood={selectedNeighborhood}
          setSelectedNeighborhood={setSelectedNeighborhood}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          handleSearch={handleSearch}
        />
        
        <GemachGrid
          isLoading={isLoading}
          filteredGemachs={filteredGemachs}
          imageLoadingStates={imageLoadingStates}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
