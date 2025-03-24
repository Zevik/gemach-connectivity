import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const neighborhoods = [
  "ארמון הנציב - תלפ״ז", "ארנונה", "בית הכרם", "בית וגן", "בקעה", 
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

const formSchema = z.object({
  name: z.string().min(2, { message: "שם הגמ״ח חייב להיות לפחות 2 תווים" }),
  category: z.string({ required_error: "יש לבחור קטגוריה" }),
  neighborhood: z.string({ required_error: "יש לבחור שכונה" }),
  description: z.string().min(10, { message: "התיאור חייב להיות לפחות 10 תווים" }),
  has_fee: z.boolean().default(false),
  fee_details: z.string().optional(),
  address: z.string().min(5, { message: "הכתובת חייבת להיות לפחות 5 תווים" }),
  location_instructions: z.string().optional(),
  phone: z.string().min(9, { message: "מספר טלפון לא תקין" }),
  manager_phone: z.string().optional(),
  phone_alternative: z.string().optional(),
  email: z.string().email({ message: "כתובת אימייל לא תקינה" }).optional().or(z.literal('')),
  hours: z.string().min(2, { message: "יש להזין שעות פעילות" }),
  website_url: z.string().url({ message: "כתובת אתר לא תקינה" }).optional().or(z.literal('')),
  facebook_url: z.string().url({ message: "כתובת פייסבוק לא תקינה" }).optional().or(z.literal('')),
  images: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

const RegisterGemach = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      has_fee: false,
      fee_details: '',
      address: '',
      location_instructions: '',
      phone: '',
      manager_phone: '',
      phone_alternative: '',
      email: '',
      hours: '',
      website_url: '',
      facebook_url: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Convert FileList to array and limit to 3 files
      const fileArray = Array.from(files).slice(0, 3);
      setSelectedFiles(fileArray);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "נדרשת התחברות",
        description: "יש להתחבר למערכת כדי לרשום גמ״ח חדש",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Insert gemach into database
      const { data: gemachData, error: gemachError } = await supabase
        .from('gemachs')
        .insert({
          owner_id: user.id,
          name: data.name,
          category: data.category,
          description: data.description,
          address: data.address,
          neighborhood: data.neighborhood,
          location_instructions: data.location_instructions || null,
          phone: data.phone,
          manager_phone: data.manager_phone || null,
          email: data.email || null,
          hours: data.hours,
          has_fee: data.has_fee,
          fee_details: data.fee_details || null,
          website_url: data.website_url || null,
          facebook_url: data.facebook_url || null,
        })
        .select('id')
        .single();

      if (gemachError) {
        throw new Error(gemachError.message);
      }

      // Upload images if any were selected
      if (selectedFiles.length > 0 && gemachData) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${gemachData.id}/${Date.now()}.${fileExt}`;
          const filePath = `${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('gemach-images')
            .upload(filePath, file);
            
          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            continue;
          }
          
          // Get the public URL for the uploaded image
          const { data: urlData } = supabase.storage
            .from('gemach-images')
            .getPublicUrl(filePath);
            
          // Insert image record
          const { error: imageError } = await supabase
            .from('gemach_images')
            .insert({
              gemach_id: gemachData.id,
              storage_path: filePath,
              is_primary: i === 0 // First image is primary
            });
            
          if (imageError) {
            console.error('Error saving image record:', imageError);
          }
        }
      }
      
      toast({
        title: "הגמ״ח נרשם בהצלחה!",
        description: "תודה שבחרת להרשם במרכז הגמ״חים. הפרטים יועברו לצוות לבדיקה.",
      });
      
      setTimeout(() => {
        navigate('/registration-success');
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "שגיאה ברישום הגמ״ח",
        description: error instanceof Error ? error.message : "אירעה שגיאה בעת רישום הגמ״ח. אנא נסו שנית מאוחר יותר.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">רישום גמ״ח חדש</h1>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  שם הגמ״ח
                </label>
                <Input
                  id="name"
                  name="name"
                  value={form.watch('name')}
                  onChange={form.handleChange('name')}
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  קטגוריה
                </label>
                <Select 
                  value={form.watch('category')} 
                  onValueChange={form.handleChange('category')}
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
              </div>

              <div>
                <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
                  שכונה
                </label>
                <Select 
                  value={form.watch('neighborhood')} 
                  onValueChange={form.handleChange('neighborhood')}
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
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  כתובת מדויקת
                </label>
                <Input
                  id="address"
                  name="address"
                  value={form.watch('address')}
                  onChange={form.handleChange('address')}
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  טלפון
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.watch('phone')}
                  onChange={form.handleChange('phone')}
                  required
                />
              </div>

              <div>
                <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">
                  שעות פעילות
                </label>
                <Input
                  id="hours"
                  name="hours"
                  value={form.watch('hours')}
                  onChange={form.handleChange('hours')}
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  תיאור הגמ״ח
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.watch('description')}
                  onChange={form.handleChange('description')}
                  rows={4}
                  required
                />
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  תמונה (אופציונלי)
                </label>
                <Input
                  id="image"
                  name="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
              </div>

              <div className="flex justify-center pt-4">
                <Button 
                  type="submit"
                  className="w-full md:w-auto px-8"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'שולח...' : 'רישום הגמ״ח'}
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

export default RegisterGemach;
