import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Clock, Mail, Globe, Facebook, ChevronLeft, Share2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface GemachImage {
  id: string;
  storage_path: string;
  is_primary: boolean;
  public_url?: string;
}

interface Gemach {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  neighborhood: string;
  location_instructions?: string;
  phone: string;
  manager_phone?: string;
  email?: string;
  hours: string;
  has_fee: boolean;
  fee_details?: string;
  website_url?: string;
  facebook_url?: string;
  images?: GemachImage[];
  is_approved: boolean | null;
  owner_id: string;
}

const GemachDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [gemach, setGemach] = useState<Gemach | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchGemach = async () => {
      if (!id) return;

      try {
        // Fetch gemach details
        const { data: gemachData, error: gemachError } = await supabase
          .from('gemachs')
          .select('*')
          .eq('id', id)
          .single();

        if (gemachError) throw gemachError;
        
        if (!gemachData) {
          toast({
            title: "הגמ\"ח לא נמצא",
            description: "הגמ\"ח המבוקש לא נמצא במערכת",
            variant: "destructive",
          });
          navigate('/gemachs');
          return;
        }

        // בדיקה אם הגמ"ח מאושר לצפייה
        if (gemachData.is_approved !== true && !isAdmin && user?.id !== gemachData.owner_id) {
          toast({
            title: "אין גישה לגמ\"ח זה",
            description: "הגמ\"ח טרם אושר או נדחה על ידי מנהל המערכת",
            variant: "destructive",
          });
          navigate('/gemachs');
          return;
        }

        // Fetch gemach images
        const { data: imagesData, error: imagesError } = await supabase
          .from('gemach_images')
          .select('*')
          .eq('gemach_id', id)
          .order('is_primary', { ascending: false });

        if (imagesError) throw imagesError;

        // Get public URLs for images
        const imagesWithUrls = await Promise.all((imagesData || []).map(async (image) => {
          const { data } = supabase.storage
            .from('gemach-images')
            .getPublicUrl(image.storage_path);
          
          return {
            ...image,
            public_url: data.publicUrl
          };
        }));

        setGemach({
          ...gemachData,
          images: imagesWithUrls
        });
      } catch (error) {
        console.error('Error fetching gemach:', error);
        toast({
          title: "שגיאה בטעינת נתונים",
          description: "אירעה שגיאה בעת טעינת פרטי הגמ\"ח",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGemach();
  }, [id, navigate, toast, isAdmin, user]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: gemach?.name || "מרכז הגמ\"חים",
          text: `בוא לבקר בגמ\"ח ${gemach?.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "הקישור הועתק",
        description: "הקישור הועתק ללוח. עכשיו אפשר לשתף אותו!",
      });
    }
  };

  // פונקציה לאישור גמ"ח ישירות מדף הפרטים (למנהלים בלבד)
  const handleApproval = async (approve: boolean) => {
    if (!isAdmin || !gemach) return;
    
    try {
      setIsProcessing(true);
      const { error } = await supabase
        .from('gemachs')
        .update({ is_approved: approve })
        .eq('id', gemach.id);

      if (error) throw error;

      // עדכון הגמ"ח המקומי
      setGemach(prev => prev ? {...prev, is_approved: approve} : null);

      toast({
        title: approve ? "הגמ\"ח אושר בהצלחה" : "הגמ\"ח נדחה",
        description: approve 
          ? "הגמ\"ח אושר ויופיע כעת בתוצאות החיפוש" 
          : "הגמ\"ח נדחה ולא יופיע בתוצאות החיפוש",
      });
    } catch (error) {
      console.error('Error updating gemach approval:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בעדכון סטטוס הגמ\"ח",
        description: "אירעה שגיאה בעדכון סטטוס הגמ\"ח. אנא נסה שוב מאוחר יותר."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!gemach) {
    return (
      <div className="container mx-auto px-4 py-16 text-center" dir="rtl">
        <h1 className="text-2xl font-bold mb-4">הגמ״ח לא נמצא</h1>
        <p className="mb-6">הגמ״ח המבוקש לא נמצא במערכת או שאינו זמין כרגע.</p>
        <Button onClick={() => navigate('/gemachs')}>חזרה לרשימת הגמ״חים</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <Button 
        variant="ghost" 
        className="mb-4 flex items-center" 
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        חזרה
      </Button>

      {/* הודעת סטטוס לגמ"ח לא מאושר */}
      {gemach.is_approved !== true && (
        <div className={`mb-6 p-4 rounded-lg ${
          gemach.is_approved === false 
            ? 'bg-red-50 border border-red-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-center">
            {gemach.is_approved === false ? (
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            )}
            <div>
              <h3 className="font-medium">
                {gemach.is_approved === false 
                  ? 'גמ"ח זה נדחה על ידי מנהל המערכת' 
                  : 'גמ"ח זה ממתין לאישור מנהל'}
              </h3>
              <p className="text-sm mt-1">
                {gemach.is_approved === false 
                  ? 'גמ"ח זה לא יופיע בתוצאות החיפוש הציבוריות. ניתן לערוך אותו ולהגיש מחדש.' 
                  : 'גמ"ח זה לא יופיע בתוצאות החיפוש הציבוריות עד לאישור מנהל המערכת.'}
              </p>
              
              {isAdmin && (
                <div className="mt-3 flex space-x-2">
                  {gemach.is_approved !== true && (
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      disabled={isProcessing}
                      onClick={() => handleApproval(true)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      אשר גמ"ח
                    </Button>
                  )}
                  
                  {gemach.is_approved !== false && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      disabled={isProcessing}
                      onClick={() => handleApproval(false)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      דחה גמ"ח
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{gemach.name}</h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {gemach.category}
            </span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
              {gemach.neighborhood}
            </span>
            {gemach.has_fee && (
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                בתשלום
              </span>
            )}
          </div>

          {/* Image gallery */}
          {gemach.images && gemach.images.length > 0 ? (
            <div className="mb-8">
              <div className="relative h-80 bg-gray-100 rounded-lg overflow-hidden mb-2">
                <img 
                  src={gemach.images[activeImageIndex].public_url} 
                  alt={gemach.name}
                  className="w-full h-full object-cover" 
                />
              </div>
              
              {gemach.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto py-2">
                  {gemach.images.map((image, index) => (
                    <button 
                      key={image.id}
                      onClick={() => setActiveImageIndex(index)}
                      className={`h-16 w-16 rounded overflow-hidden ${
                        index === activeImageIndex ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <img 
                        src={image.public_url} 
                        alt={`תמונה ${index + 1}`}
                        className="h-full w-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-60 bg-gray-100 rounded-lg mb-8 flex items-center justify-center">
              <p className="text-gray-500">אין תמונות זמינות</p>
            </div>
          )}

          <h2 className="text-xl font-bold mb-2">אודות הגמ״ח</h2>
          <p className="text-gray-700 mb-6 whitespace-pre-line">
            {gemach.description}
          </p>

          {gemach.has_fee && gemach.fee_details && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">פרטי תשלום</h2>
              <p className="text-gray-700 whitespace-pre-line">{gemach.fee_details}</p>
            </div>
          )}

          {gemach.location_instructions && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">הוראות הגעה</h2>
              <p className="text-gray-700 whitespace-pre-line">{gemach.location_instructions}</p>
            </div>
          )}
        </div>

        {/* Sidebar with contact info */}
        <div>
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">פרטי יצירת קשר</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 ml-2 mt-0.5 text-gray-500" />
                  <div>
                    <p className="font-medium">כתובת</p>
                    <p className="text-gray-700">{gemach.address}</p>
                    <p className="text-gray-700">{gemach.neighborhood}, ירושלים</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="h-5 w-5 ml-2 mt-0.5 text-gray-500" />
                  <div>
                    <p className="font-medium">טלפון</p>
                    <p className="text-gray-700 dir-ltr">{gemach.phone}</p>
                    {gemach.manager_phone && (
                      <p className="text-gray-700 dir-ltr">{gemach.manager_phone} (מנהל/ת)</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="h-5 w-5 ml-2 mt-0.5 text-gray-500" />
                  <div>
                    <p className="font-medium">שעות פעילות</p>
                    <p className="text-gray-700">{gemach.hours}</p>
                  </div>
                </div>

                {gemach.email && (
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 ml-2 mt-0.5 text-gray-500" />
                    <div>
                      <p className="font-medium">אימייל</p>
                      <a 
                        href={`mailto:${gemach.email}`} 
                        className="text-primary hover:underline"
                      >
                        {gemach.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3">
                {gemach.website_url && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    asChild
                  >
                    <a href={gemach.website_url} target="_blank" rel="noopener noreferrer">
                      <Globe className="mr-2 h-4 w-4" />
                      אתר הגמ״ח
                    </a>
                  </Button>
                )}

                {gemach.facebook_url && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    asChild
                  >
                    <a href={gemach.facebook_url} target="_blank" rel="noopener noreferrer">
                      <Facebook className="mr-2 h-4 w-4" />
                      עמוד פייסבוק
                    </a>
                  </Button>
                )}

                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  שיתוף הגמ״ח
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reserved for future features like reviews, ratings, etc. */}
        </div>
      </div>
    </div>
  );
};

export default GemachDetail;
