import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { BadgeLabel } from "@/components/ui/badge-label";
import { BackButton } from "@/components/ui/back-button";
import { 
  PhoneIcon, 
  MailIcon, 
  ClockIcon, 
  MapPinIcon, 
  InfoIcon,
  LinkIcon,
  FacebookIcon,
  PencilIcon,
  Share2Icon
} from "lucide-react";

interface GemachData {
  id: string;
  name: string;
  category: string;
  neighborhood: string;
  address: string;
  location_instructions: string | null;
  phone: string;
  manager_phone: string | null;
  email: string | null;
  description: string;
  hours: string;
  has_fee: boolean;
  fee_details: string | null;
  website_url: string | null;
  facebook_url: string | null;
  owner_id: string | null;
  is_approved: boolean | null;
}

// פונקציה להשגת התמונה של הגמ״ח - שיפור בטיפול בשגיאות ובלוגיקה
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

// Get badge variant based on category
const getBadgeVariant = (category: string): "blue" | "green" | "orange" | "purple" | "default" => {
  const categoryMap: Record<string, "blue" | "green" | "orange" | "purple" | "default"> = {
    'השאלת ציוד': 'blue',
    'מזון': 'green',
    'בגדים': 'purple',
    'רהיטים': 'orange',
  };
  
  return categoryMap[category] || 'default';
};

const GemachDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [gemach, setGemach] = useState<GemachData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  
  // Share functionality
  const handleShare = async () => {
    if (!gemach) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `גמ"ח ${gemach.name}`,
          text: `פרטים על גמ"ח ${gemach.name} ב${gemach.neighborhood}`,
          url: window.location.href,
        });
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "הקישור הועתק",
          description: "הקישור לגמ״ח הועתק ללוח",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  useEffect(() => {
    const fetchGemach = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('gemachs')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setGemach(data as GemachData);
          
          // השגת תמונת הגמ״ח
          setImageLoading(true);
          const imageUrl = await fetchGemachImage(id);
          if (imageUrl) {
            console.log('Setting image URL:', imageUrl);
          } else {
            console.log('No image URL found');
          }
          setImageUrl(imageUrl);
          setImageLoading(false);
        }
      } catch (error) {
        console.error('Error fetching gemach:', error);
        toast({
          title: 'שגיאה בטעינת הנתונים',
          description: 'לא ניתן היה לטעון את פרטי הגמ״ח. אנא נסו שנית מאוחר יותר.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchGemach();
  }, [id]);
  
  const canEdit = user && gemach && (user.id === gemach.owner_id || isAdmin);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  if (!gemach) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">הגמ״ח לא נמצא</h2>
            <p className="mb-6">הגמ״ח המבוקש אינו קיים או שאין לך הרשאות לצפות בו.</p>
            <Button asChild>
              <Link to="/">חזרה לדף הבית</Link>
            </Button>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-4 flex justify-between items-center">
          <BackButton />
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleShare}
            >
              <Share2Icon className="h-4 w-4 ml-1" />
              שיתוף
            </Button>
            
            {canEdit && (
              <Button 
                variant="outline"
                size="sm"
                asChild
              >
                <Link to={`/gemach/${gemach.id}/edit`}>
                  <PencilIcon className="h-4 w-4 ml-1" />
                  עריכה
                </Link>
              </Button>
            )}
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {/* כותרת עם כפתור עריכה */}
          <div className="p-6 bg-gradient-to-r from-sky-600 to-sky-700 text-white">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <BadgeLabel 
                  variant={getBadgeVariant(gemach.category)}
                  className="mb-2 ml-2"
                >
                  {gemach.category}
                </BadgeLabel>
              </div>
              <h1 className="text-3xl font-bold">{gemach.name}</h1>
              <p className="text-sm mt-2 text-white/90">
                {gemach.neighborhood}
              </p>
            </div>
          </div>
          
          {/* תמונת הגמ״ח - עם טיפול משופר במקרה של טעינה */}
          {imageLoading ? (
            <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
              <div className="w-8 h-8 border-t-2 border-primary border-solid rounded-full animate-spin"></div>
            </div>
          ) : imageUrl ? (
            <div className="w-full h-64 md:h-80 overflow-hidden">
              <img 
                src={imageUrl} 
                alt={gemach?.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', imageUrl);
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Prevent infinite loop
                  target.src = '/placeholder.svg'; // Use placeholder
                }}
              />
            </div>
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <p className="text-gray-500">אין תמונה זמינה</p>
            </div>
          )}
          
          {/* תוכן הגמ״ח */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <InfoIcon className="h-5 w-5 ml-2" />
                  על הגמ״ח
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-line mb-6">{gemach.description}</p>
                  
                  {gemach.has_fee && gemach.fee_details && (
                    <div className="mb-6 mt-4 border-t pt-4 border-gray-200">
                      <h3 className="font-bold mb-2">פרטי תשלום</h3>
                      <p className="whitespace-pre-line text-gray-700">{gemach.fee_details}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold mb-4">פרטי התקשרות</h2>
                  
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <a 
                      href={`tel:${gemach.phone}`}
                      className="flex items-center p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <PhoneIcon className="h-5 w-5 ml-3 text-green-600" />
                      <div>
                        <div className="font-semibold">טלפון</div>
                        <div className="text-primary">{gemach.phone}</div>
                      </div>
                    </a>
                    
                    {gemach.manager_phone && (
                      <a 
                        href={`tel:${gemach.manager_phone}`}
                        className="flex items-center p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <PhoneIcon className="h-5 w-5 ml-3 text-green-600" />
                        <div>
                          <div className="font-semibold">טלפון נוסף</div>
                          <div className="text-primary">{gemach.manager_phone}</div>
                        </div>
                      </a>
                    )}
                    
                    {gemach.email && (
                      <a 
                        href={`mailto:${gemach.email}`}
                        className="flex items-center p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MailIcon className="h-5 w-5 ml-3 text-blue-600" />
                        <div>
                          <div className="font-semibold">אימייל</div>
                          <div className="text-primary">{gemach.email}</div>
                        </div>
                      </a>
                    )}
                    
                    <div className="flex items-start p-2">
                      <MapPinIcon className="h-5 w-5 ml-3 mt-1 text-red-600" />
                      <div>
                        <div className="font-semibold">כתובת</div>
                        <div>{gemach.address}</div>
                        
                        {gemach.location_instructions && (
                          <div className="mt-1 text-sm text-gray-600 whitespace-pre-line">
                            {gemach.location_instructions}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start p-2">
                      <ClockIcon className="h-5 w-5 ml-3 text-purple-600" />
                      <div>
                        <div className="font-semibold">שעות פעילות</div>
                        <div className="whitespace-pre-line">{gemach.hours}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* קישורים חיצוניים */}
                {(gemach.website_url || gemach.facebook_url) && (
                  <div className="pt-4">
                    <h3 className="font-bold mb-3">קישורים</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      {gemach.website_url && (
                        <a 
                          href={gemach.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-2 hover:bg-gray-100 rounded-lg transition-colors text-primary"
                        >
                          <LinkIcon className="h-5 w-5 ml-2" />
                          אתר אינטרנט
                        </a>
                      )}
                      
                      {gemach.facebook_url && (
                        <a 
                          href={gemach.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-2 hover:bg-gray-100 rounded-lg transition-colors text-primary"
                        >
                          <FacebookIcon className="h-5 w-5 ml-2" />
                          דף פייסבוק
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GemachDetail;
