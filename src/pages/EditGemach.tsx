
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { categories, neighborhoods } from '@/data/constants';

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
  is_approved: boolean | null;
  owner_id: string;
}

const EditGemach = () => {
  const { id } = useParams<{ id: string }>();
  const [gemach, setGemach] = useState<Gemach | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  // טופס עריכה
  const [formData, setFormData] = useState<Omit<Gemach, 'id' | 'owner_id' | 'is_approved'>>({
    name: '',
    category: '',
    description: '',
    address: '',
    neighborhood: '',
    phone: '',
    hours: '',
    has_fee: false,
    location_instructions: '',
    manager_phone: '',
    email: '',
    fee_details: '',
    website_url: '',
    facebook_url: '',
  });

  useEffect(() => {
    const fetchGemach = async () => {
      if (!id) return;

      try {
        // טעינת נתוני הגמ"ח
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
          navigate('/dashboard');
          return;
        }

        // בדיקת הרשאות - רק מנהל או בעל הגמ"ח יכול לערוך
        if (!isAdmin && user?.id !== gemachData.owner_id) {
          toast({
            title: "אין הרשאות עריכה",
            description: "רק מנהלים או בעלי הגמ\"ח יכולים לערוך את המידע",
            variant: "destructive",
          });
          navigate('/gemach/' + id);
          return;
        }

        // עדכון הסטייט עם נתוני הגמ"ח שנטענו
        setGemach(gemachData);
        setFormData({
          name: gemachData.name || '',
          category: gemachData.category || '',
          description: gemachData.description || '',
          address: gemachData.address || '',
          neighborhood: gemachData.neighborhood || '',
          location_instructions: gemachData.location_instructions || '',
          phone: gemachData.phone || '',
          manager_phone: gemachData.manager_phone || '',
          email: gemachData.email || '',
          hours: gemachData.hours || '',
          has_fee: gemachData.has_fee || false,
          fee_details: gemachData.fee_details || '',
          website_url: gemachData.website_url || '',
          facebook_url: gemachData.facebook_url || '',
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

  // עדכון שדה בטופס
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value;
      
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  // עדכון שדה בורר (select)
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // עדכון שדה מתג (switch)
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // שמירת הטופס
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gemach || !id) return;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('gemachs')
        .update(formData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "הגמ\"ח עודכן בהצלחה",
        description: "השינויים נשמרו בהצלחה במערכת",
      });
      
      // חזרה לדף הפרטים של הגמ"ח
      navigate(`/gemach/${id}`);
      
    } catch (error) {
      console.error('Error updating gemach:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בשמירת נתונים",
        description: "אירעה שגיאה בעת שמירת השינויים. אנא נסה שוב מאוחר יותר."
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <Button 
        variant="ghost" 
        className="mb-4 flex items-center" 
        onClick={() => navigate(`/gemach/${id}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        חזרה לפרטי הגמ"ח
      </Button>

      <h1 className="text-3xl font-bold mb-6">עריכת גמ"ח</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* פרטים בסיסיים */}
            <Card>
              <CardHeader>
                <CardTitle>פרטים בסיסיים</CardTitle>
                <CardDescription>עדכן את המידע הבסיסי על הגמ"ח</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">שם הגמ"ח *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">קטגוריה *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange("category", value)}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">תיאור הגמ"ח *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* פרטי מיקום */}
            <Card>
              <CardHeader>
                <CardTitle>פרטי מיקום</CardTitle>
                <CardDescription>עדכן את מיקום הגמ"ח ופרטי הגעה</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">כתובת *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">שכונה *</Label>
                    <Select
                      value={formData.neighborhood}
                      onValueChange={(value) => handleSelectChange("neighborhood", value)}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location_instructions">הוראות הגעה (אופציונלי)</Label>
                  <Textarea
                    id="location_instructions"
                    name="location_instructions"
                    value={formData.location_instructions || ''}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* פרטי קשר */}
            <Card>
              <CardHeader>
                <CardTitle>פרטי קשר</CardTitle>
                <CardDescription>עדכן את פרטי ההתקשרות עם הגמ"ח</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">טלפון *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="manager_phone">טלפון מנהל (אופציונלי)</Label>
                    <Input
                      id="manager_phone"
                      name="manager_phone"
                      value={formData.manager_phone || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">דוא"ל (אופציונלי)</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours">שעות פעילות *</Label>
                  <Input
                    id="hours"
                    name="hours"
                    value={formData.hours}
                    onChange={handleChange}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* פרטים נוספים */}
            <Card>
              <CardHeader>
                <CardTitle>פרטים נוספים</CardTitle>
                <CardDescription>עדכן מידע נוסף על הגמ"ח</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Switch
                    id="has_fee"
                    name="has_fee"
                    checked={formData.has_fee}
                    onCheckedChange={(checked) => handleSwitchChange("has_fee", checked)}
                  />
                  <Label htmlFor="has_fee">הגמ"ח גובה תשלום</Label>
                </div>

                {formData.has_fee && (
                  <div className="space-y-2">
                    <Label htmlFor="fee_details">פרטי תשלום</Label>
                    <Textarea
                      id="fee_details"
                      name="fee_details"
                      value={formData.fee_details || ''}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="website_url">כתובת אתר (אופציונלי)</Label>
                  <Input
                    id="website_url"
                    name="website_url"
                    value={formData.website_url || ''}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook_url">עמוד פייסבוק (אופציונלי)</Label>
                  <Input
                    id="facebook_url"
                    name="facebook_url"
                    value={formData.facebook_url || ''}
                    onChange={handleChange}
                    placeholder="https://facebook.com/pagename"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* סרגל צידי עם כפתור שמירה והערות */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>שמירת שינויים</CardTitle>
                <CardDescription>שמור את השינויים שביצעת בגמ"ח</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-amber-600 text-sm mb-4">
                  שים לב: שדות המסומנים ב-* הם שדות חובה
                </p>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      שומר שינויים...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      שמור שינויים
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditGemach;
