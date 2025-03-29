
// הוספת טיפול בתמונות
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { neighborhoods, categories } from "@/data/constants";

const formSchema = z.object({
  name: z.string().min(2, { message: "שם הגמ״ח חייב להיות לפחות 2 תווים" }),
  category: z.string().min(1, { message: "יש לבחור קטגוריה" }),
  neighborhood: z.string().min(1, { message: "יש לבחור שכונה" }),
  address: z.string().min(5, { message: "יש להזין כתובת מלאה" }),
  location_instructions: z.string().optional(),
  phone: z.string().min(9, { message: "יש להזין מספר טלפון תקין" }),
  manager_phone: z.string().optional(),
  email: z.string().email({ message: "יש להזין כתובת אימייל תקינה" }).optional().or(z.literal('')),
  description: z.string().min(10, { message: "יש להזין תיאור של לפחות 10 תווים" }),
  hours: z.string().min(2, { message: "יש להזין שעות פעילות" }),
  has_fee: z.boolean().default(false),
  fee_details: z.string().optional(),
  website_url: z.string().url({ message: "יש להזין כתובת אתר תקינה" }).optional().or(z.literal('')),
  facebook_url: z.string().url({ message: "יש להזין כתובת פייסבוק תקינה" }).optional().or(z.literal('')),
});

const EditGemach = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasFee, setHasFee] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      neighborhood: '',
      address: '',
      location_instructions: '',
      phone: '',
      manager_phone: '',
      email: '',
      description: '',
      hours: '',
      has_fee: false,
      fee_details: '',
      website_url: '',
      facebook_url: '',
    },
  });
  
  useEffect(() => {
    const fetchGemach = async () => {
      if (!id || !user) return;
      
      try {
        setIsLoading(true);
        
        // טעינת פרטי הגמ״ח
        const { data: gemach, error } = await supabase
          .from('gemachs')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        // בדיקת הרשאות
        if (!gemach) {
          toast({
            title: "הגמ״ח לא נמצא",
            description: "הגמ״ח המבוקש אינו קיים או שאין לך הרשאות לערוך אותו.",
            variant: "destructive",
          });
          navigate('/dashboard');
          return;
        }
        
        if (gemach.owner_id !== user.id && !isAdmin) {
          toast({
            title: "אין הרשאות",
            description: "אין לך הרשאות לערוך את הגמ״ח הזה.",
            variant: "destructive",
          });
          navigate('/dashboard');
          return;
        }
        
        // טעינת נתוני הגמ״ח לטופס
        form.reset({
          name: gemach.name,
          category: gemach.category,
          neighborhood: gemach.neighborhood,
          address: gemach.address,
          location_instructions: gemach.location_instructions || '',
          phone: gemach.phone,
          manager_phone: gemach.manager_phone || '',
          email: gemach.email || '',
          description: gemach.description,
          hours: gemach.hours,
          has_fee: gemach.has_fee || false,
          fee_details: gemach.fee_details || '',
          website_url: gemach.website_url || '',
          facebook_url: gemach.facebook_url || '',
        });
        
        setHasFee(gemach.has_fee || false);
        
        // טעינת תמונה קיימת
        const { data: imageData } = await supabase
          .from('gemach_images')
          .select('storage_path')
          .eq('gemach_id', id)
          .eq('is_primary', true)
          .single();
        
        if (imageData?.storage_path) {
          const { data } = supabase.storage
            .from('images')
            .getPublicUrl(imageData.storage_path);
          
          setExistingImageUrl(data.publicUrl);
        }
      } catch (error) {
        console.error('Error fetching gemach:', error);
        toast({
          title: "שגיאה בטעינת הנתונים",
          description: "אירעה שגיאה בעת טעינת פרטי הגמ״ח לעריכה.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!authLoading) {
      fetchGemach();
    }
  }, [id, user, authLoading, isAdmin]);
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      
      // עדכון פרטי הגמ״ח
      const { error: updateError } = await supabase
        .from('gemachs')
        .update({
          name: data.name,
          category: data.category,
          neighborhood: data.neighborhood,
          address: data.address,
          location_instructions: data.location_instructions || null,
          phone: data.phone,
          manager_phone: data.manager_phone || null,
          email: data.email || null,
          description: data.description,
          hours: data.hours,
          has_fee: data.has_fee,
          fee_details: data.fee_details || null,
          website_url: data.website_url || null,
          facebook_url: data.facebook_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      // אם נבחרה תמונה חדשה, מעלים אותה
      if (selectedFiles.length > 0) {
        const file = selectedFiles[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${id}/${fileName}`;
        
        // העלאת התמונה לאחסון
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file);
          
        if (uploadError && uploadError.message !== 'The resource already exists') {
          throw uploadError;
        }
        
        // בדיקה אם כבר קיימת תמונה ראשית לגמ״ח זה
        const { data: existingImage } = await supabase
          .from('gemach_images')
          .select('*')
          .eq('gemach_id', id)
          .eq('is_primary', true)
          .single();
        
        if (existingImage) {
          // עדכון נתיב התמונה הקיימת
          const { error: updateImageError } = await supabase
            .from('gemach_images')
            .update({
              storage_path: filePath
            })
            .eq('id', existingImage.id);
          
          if (updateImageError) throw updateImageError;
          
          // מחיקת התמונה הקודמת מהאחסון
          await supabase.storage
            .from('images')
            .remove([existingImage.storage_path]);
        } else {
          // הוספת רשומת תמונה חדשה
          const { error: insertImageError } = await supabase
            .from('gemach_images')
            .insert([{
              gemach_id: id,
              storage_path: filePath,
              is_primary: true
            }]);
          
          if (insertImageError) throw insertImageError;
        }
      }
      
      toast({
        title: "הגמ״ח עודכן בהצלחה",
        description: "פרטי הגמ״ח עודכנו בהצלחה.",
      });
      
      navigate(`/gemach/${id}`);
    } catch (error) {
      console.error('Error updating gemach:', error);
      toast({
        title: "שגיאה בעדכון הגמ״ח",
        description: "אירעה שגיאה בעת עדכון פרטי הגמ״ח.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };
  
  const handleFeeChange = (checked: boolean) => {
    form.setValue('has_fee', checked);
    setHasFee(checked);
  };
  
  if (isLoading) {
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
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">עריכת גמ״ח</h1>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  שם הגמ״ח
                </label>
                <Input
                  id="name"
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  קטגוריה
                </label>
                <Select 
                  defaultValue={form.getValues('category')}
                  onValueChange={(value) => form.setValue('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר קטגוריה" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.category.message}</p>
                )}
              </div>
            
              <div>
                <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
                  שכונה
                </label>
                <Select 
                  defaultValue={form.getValues('neighborhood')}
                  onValueChange={(value) => form.setValue('neighborhood', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר שכונה" />
                  </SelectTrigger>
                  <SelectContent>
                    {neighborhoods.map((neighborhood) => (
                      <SelectItem key={neighborhood} value={neighborhood}>
                        {neighborhood}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.neighborhood && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.neighborhood.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  כתובת מדויקת
                </label>
                <Input
                  id="address"
                  {...form.register('address')}
                />
                {form.formState.errors.address && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.address.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="location_instructions" className="block text-sm font-medium text-gray-700 mb-1">
                  הוראות הגעה
                </label>
                <Textarea
                  id="location_instructions"
                  placeholder="פרטים נוספים על איך להגיע למקום, סימנים מזהים, קומה, כניסה וכו׳"
                  {...form.register('location_instructions')}
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  טלפון ראשי
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="02-123-4567"
                  {...form.register('phone')}
                />
                {form.formState.errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="manager_phone" className="block text-sm font-medium text-gray-700 mb-1">
                  טלפון חלופי (אופציונלי)
                </label>
                <Input
                  id="manager_phone"
                  type="tel"
                  placeholder="050-123-4567"
                  {...form.register('manager_phone')}
                />
              </div>
            
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  אימייל (אופציונלי)
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">
                  שעות פעילות
                </label>
                <Input
                  id="hours"
                  placeholder="לדוגמה: א'-ה' 9:00-13:00, 16:00-19:00"
                  {...form.register('hours')}
                />
                {form.formState.errors.hours && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.hours.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  תיאור הגמ״ח
                </label>
                <Textarea
                  id="description"
                  placeholder="פרטו על מטרת הגמ״ח, מה ניתן להשאיל, תנאים מיוחדים וכו׳"
                  {...form.register('description')}
                  rows={4}
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
                )}
              </div>

              {/* מידע על תשלום */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="has_fee" 
                    checked={hasFee}
                    onCheckedChange={handleFeeChange}
                  />
                  <label 
                    htmlFor="has_fee" 
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    הגמ״ח דורש תשלום כלשהו
                  </label>
                </div>

                {hasFee && (
                  <div>
                    <label htmlFor="fee_details" className="block text-sm font-medium text-gray-700 mb-1">
                      פרטי התשלום
                    </label>
                    <Textarea
                      id="fee_details"
                      placeholder="פרטו את עלות השימוש בגמ״ח ולאן מיועדים הרווחים"
                      {...form.register('fee_details')}
                      rows={3}
                    />
                  </div>
                )}
              </div>
            
              {/* אתר ורשתות חברתיות */}
              <div>
                <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-1">
                  אתר אינטרנט (אופציונלי)
                </label>
                <Input
                  id="website_url"
                  type="url"
                  placeholder="https://www.example.com"
                  {...form.register('website_url')}
                />
                {form.formState.errors.website_url && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.website_url.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="facebook_url" className="block text-sm font-medium text-gray-700 mb-1">
                  עמוד פייסבוק (אופציונלי)
                </label>
                <Input
                  id="facebook_url"
                  type="url"
                  placeholder="https://www.facebook.com/yourgmach"
                  {...form.register('facebook_url')}
                />
                {form.formState.errors.facebook_url && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.facebook_url.message}</p>
                )}
              </div>

              {/* תמונה */}
              <div className="space-y-2">
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  תמונה
                </label>
                
                {existingImageUrl && !selectedFiles.length && (
                  <div className="mb-2">
                    <p className="text-sm mb-2">התמונה הקיימת:</p>
                    <div className="w-full h-40 overflow-hidden rounded-md">
                      <img 
                        src={existingImageUrl} 
                        alt="תמונה קיימת" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">העלאת תמונה חדשה תחליף את התמונה הקיימת</p>
                  </div>
                )}
                
                <Input 
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(`/gemach/${id}`)}
                >
                  ביטול
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? 'מעדכן...' : 'שמירת שינויים'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EditGemach;
