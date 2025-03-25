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
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { neighborhoods, categories } from '@/data/constants';

const formSchema = z.object({
  name: z.string().min(2, { message: "שם הגמ״ח חייב להיות לפחות 2 תווים" }),
  category: z.string().min(1, { message: "יש לבחור קטגוריה" }),
  neighborhood: z.string().min(1, { message: "יש לבחור שכונה" }),
  address: z.string().min(5, { message: "יש להזין כתובת מלאה" }),
  location_instructions: z.string().optional(),
  phone: z.string().min(9, { message: "יש להזין מספר טלפון תקין" }),
  alternative_phone: z.string().optional(),
  email: z.string().email({ message: "יש להזין כתובת אימייל תקינה" }).optional().or(z.literal('')),
  description: z.string().min(10, { message: "יש להזין תיאור של לפחות 10 תווים" }),
  hours: z.string().min(2, { message: "יש להזין שעות פעילות" }),
  has_fee: z.boolean().default(false),
  fee_details: z.string().optional(),
  website_url: z.string().url({ message: "יש להזין כתובת אתר תקינה" }).optional().or(z.literal('')),
  facebook_url: z.string().url({ message: "יש להזין כתובת פייסבוק תקינה" }).optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

const RegisterGemach = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [hasFee, setHasFee] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      neighborhood: '',
      address: '',
      location_instructions: '',
      phone: '',
      alternative_phone: '',
      email: '',
      description: '',
      hours: '',
      has_fee: false,
      fee_details: '',
      website_url: '',
      facebook_url: '',
    }
  });

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
      console.log("User is logged in:", user);
      
      // העלאת התמונה לאחסון של Supabase
      let imageUrl = null;
      if (selectedFiles.length > 0) {
        const file = selectedFiles[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `gemach_images/${fileName}`;
        
        console.log("Uploading image:", filePath);
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('images')
          .upload(filePath, file);
          
        if (uploadError) {
          console.error('Image upload error:', uploadError);
        } else if (uploadData) {
          // יצירת URL ציבורי לתמונה
          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);
            
          imageUrl = publicUrl;
          console.log("Image uploaded successfully:", imageUrl);
        }
      }
      
      // הכנת נתוני הגמ"ח לשמירה בבסיס הנתונים
      const gemachData = {
        name: data.name,
        category: data.category,
        neighborhood: data.neighborhood,
        address: data.address,
        location_instructions: data.location_instructions || null,
        phone: data.phone,
        alternative_phone: data.alternative_phone || null,
        email: data.email || null,
        description: data.description,
        hours: data.hours,
        has_fee: data.has_fee,
        fee_details: data.fee_details || null,
        website_url: data.website_url || null,
        facebook_url: data.facebook_url || null,
        image_url: imageUrl,
        owner_id: user.id,
        owner_email: user.email,
        is_approved: null, // ממתין לאישור מנהל
        created_at: new Date().toISOString()
      };

      console.log("Inserting gemach data:", gemachData);

      // שמירת הגמ"ח בבסיס הנתונים
      const { error: insertError, data: insertData } = await supabase
        .from('gemachs')
        .insert([gemachData]);

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error('Failed to register gemach in database');
      }
      
      console.log("Gemach inserted successfully:", insertData);
      
      toast({
        title: "הגמ״ח נרשם בהצלחה!",
        description: "תודה שבחרת להרשם במרכז הגמ״חים. הפרטים יועברו לצוות לבדיקה.",
      });
      
      setTimeout(() => {
        navigate('/registration-success');
      }, 2000);
    } catch (error) {
      console.error('Error registering gemach:', error);
      toast({
        title: "שגיאה ברישום הגמ״ח",
        description: error instanceof Error ? error.message : "אירעה שגיאה בעת רישום הגמ״ח. אנא נסו שנית מאוחר יותר.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
                <Select onValueChange={(value) => form.setValue('category', value)}>
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
                <Select onValueChange={(value) => form.setValue('neighborhood', value)}>
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
                <label htmlFor="alternative_phone" className="block text-sm font-medium text-gray-700 mb-1">
                  טלפון חלופי (אופציונלי)
                </label>
                <Input
                  id="alternative_phone"
                  type="tel"
                  placeholder="050-123-4567"
                  {...form.register('alternative_phone')}
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

              {/* Payment Information */}
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
            
              {/* Website and Social Media */}
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

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  תמונה (אופציונלי)
                </label>
                    <Input 
                  id="image"
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
