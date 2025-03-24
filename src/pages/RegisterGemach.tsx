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
import { neighborhoods, categories } from '@/data/constants';

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
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting: formSubmitting } } = useForm<FormData>();

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
      const formDataToSend = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null) {
          formDataToSend.append(key, value);
        }
      });

      // Add images
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file, index) => {
          formDataToSend.append(`images`, file);
        });
      }

      const response = await fetch('/api/gemachs', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to register gemach');
      }

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">רישום גמ״ח חדש</h1>
            
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  שם הגמ״ח
                </label>
                <Input
                  id="name"
                  {...register('name', { required: true })}
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  קטגוריה
                </label>
                <Select 
                  onValueChange={(value) => setValue('category', value)}
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
                  onValueChange={(value) => setValue('neighborhood', value)}
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
                  {...register('address', { required: true })}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  טלפון
                </label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone', { required: true })}
                />
              </div>

              <div>
                <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">
                  שעות פעילות
                </label>
                <Input
                  id="hours"
                  {...register('hours', { required: true })}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  תיאור הגמ״ח
                </label>
                <Textarea
                  id="description"
                  {...register('description', { required: true })}
                  rows={4}
                />
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
                  disabled={formSubmitting}
                >
                  {formSubmitting ? 'שולח...' : 'רישום הגמ״ח'}
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
