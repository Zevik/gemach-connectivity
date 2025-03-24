
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

const neighborhoods = [
  "ארמון הנציב - תלפ\"ז", "ארנונה", "בית הכרם", "בית וגן", "בקעה", 
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
  name: z.string().min(2, { message: "שם הגמ\"ח חייב להיות לפחות 2 תווים" }),
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
        description: "יש להתחבר למערכת כדי לרשום גמ\"ח חדש",
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
        title: "הגמ\"ח נרשם בהצלחה!",
        description: "תודה שבחרת להרשם במרכז הגמ\"חים. הפרטים יועברו לצוות לבדיקה.",
      });
      
      setTimeout(() => {
        navigate('/gemachs');
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "שגיאה ברישום הגמ\"ח",
        description: error instanceof Error ? error.message : "אירעה שגיאה בעת רישום הגמ\"ח. אנא נסו שנית מאוחר יותר.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl" dir="rtl">
      <h1 className="text-3xl font-bold mb-8 text-center text-primary">הרשמת גמ״ח חדש</h1>
      <p className="text-center text-gray-600 mb-8">
        השתמשו בטופס זה כדי להתחבר עם קהילת עם שירותים ומוצרים להשאלה והפצת האפשרויות שלך
      </p>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* שם הגמ"ח */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">שם הגמ״ח *</FormLabel>
                  <FormControl>
                    <Input placeholder="הכניסו את שם הגמ\"ח" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* קטגוריה */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">קטגוריה *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="בחרו קטגוריה" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* תיאור מפורט של הגמ"ח */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">תיאור מפורט של הגמ״ח *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="אנא פרטו: תיאור של הגמ\"ח, לאיזה צורך, מה ניתן להשאיל, האם יש תנאים מיוחדים" 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* פרטי תשלום */}
            <div>
              <h3 className="text-lg font-medium mb-2">פרטי תשלום</h3>
              <FormField
                control={form.control}
                name="has_fee"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none mr-2">
                      <FormLabel>הגמ״ח הוא תשלום מסויים</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("has_fee") && (
                <FormField
                  control={form.control}
                  name="fee_details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>פרטי התשלום</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="פרטו את עלות השימוש בגמ\"ח ולאן מיועדים הרווחים" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            {/* מיקום */}
            <div>
              <h3 className="text-lg font-medium mb-4">מיקום</h3>
              
              {/* שכונה */}
              <FormField
                control={form.control}
                name="neighborhood"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>שכונה *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="בחרו שכונה" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {neighborhoods.map((neighborhood) => (
                          <SelectItem key={neighborhood} value={neighborhood}>
                            {neighborhood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* כתובת מדויקת */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>כתובת מדויקת *</FormLabel>
                    <FormControl>
                      <Input placeholder="רחוב ומספר" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* הוראות הגעה */}
              <FormField
                control={form.control}
                name="location_instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>הוראות הגעה</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="הוראות מפורטות איך להגיע לגמ\"ח" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* פרטי יצירת קשר */}
            <div>
              <h3 className="text-lg font-medium mb-4">פרטי יצירת קשר</h3>
              
              {/* טלפון ראשי */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>טלפון ראשי (קווי) *</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="02-123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* טלפון נייד */}
              <FormField
                control={form.control}
                name="manager_phone"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>טלפון נייד של המנהל/ת (וואטסאפ)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="050-123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* טלפון חלופי */}
              <FormField
                control={form.control}
                name="phone_alternative"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>טלפון חלופי של הגמ״ח (אם יש)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="02-987-6543" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* דוא"ל */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>דוא״ל</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* שעות פעילות */}
            <FormField
              control={form.control}
              name="hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">שעות פעילות *</FormLabel>
                  <FormControl>
                    <Input placeholder="לדוגמה: א'-ה' 9:00-13:00, 16:00-19:00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* קישור לאתר */}
            <FormField
              control={form.control}
              name="website_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>קישור לאתר (אם יש)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* קישור לעמוד פייסבוק */}
            <FormField
              control={form.control}
              name="facebook_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>קישור לעמוד פייסבוק (אם יש)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.facebook.com/yourgmach" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* הוראות תמונה */}
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">הוספת תמונה</FormLabel>
                  <div className="border-2 border-dashed border-gray-300 p-4 rounded-md text-center">
                    <p className="text-gray-500 text-sm mb-2">ניתן לגרור לכאן תמונות (עד 3 תמונות, כל תמונה עד 2MB בגודלה)</p>
                    <Input 
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="image-upload"
                      ref={field.ref}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      העלאת תמונות
                    </Button>
                    {selectedFiles.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">
                          {selectedFiles.length} תמונות נבחרו
                        </p>
                        <div className="flex gap-2 mt-2 justify-center">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="relative">
                              <img 
                                src={URL.createObjectURL(file)} 
                                alt={`תמונה ${index + 1}`}
                                className="h-16 w-16 object-cover rounded"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full py-6 text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'שולח...' : 'שליחת הרשמה'}
            </Button>
            
            <p className="text-sm text-gray-500 text-center mt-4">
              בלחיצה על כפתור שליחת הרשמה אני מאשר/ת שכל המידע שמסרתי הוא אמין, והנני מסכים/ה להציג את הפרטים באתר.
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default RegisterGemach;
