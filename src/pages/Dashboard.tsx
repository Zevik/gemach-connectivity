import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, UserCircle, LogOut, Package, PlusCircle, Edit, Trash2, Check, X, AlertCircle, Shield, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { neighborhoods, categories } from '@/data/constants';

interface UserGemach {
  id: string;
  name: string;
  description?: string;
  category?: string;
  address?: string;
  neighborhood?: string;
  phone?: string;
  hours?: string;
  image_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface PendingGemach extends UserGemach {
  user_email?: string;
}

interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  is_admin: boolean;
  created_at: string;
}

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [userGemachs, setUserGemachs] = useState<UserGemach[]>([]);
  const [pendingGemachs, setPendingGemachs] = useState<PendingGemach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [editGemach, setEditGemach] = useState<UserGemach | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const { logout } = useAuth();

  // טעינת הגמחים של המשתמש
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchUserGemachs = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('gemachs')
          .select('*')
          .eq('owner_id', user.id);

        if (error) throw error;

        // המרת הנתונים למבנה שימושי יותר
        const formattedData = data?.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          address: item.address,
          neighborhood: item.neighborhood,
          phone: item.phone,
          hours: item.hours,
          image_url: item.image_url,
          status: item.is_approved === true ? 'approved' : item.is_approved === false ? 'rejected' : 'pending',
          created_at: new Date(item.created_at).toLocaleDateString('he-IL')
        })) || [];

        setUserGemachs(formattedData);
      } catch (error) {
        console.error('Error fetching user gemachs:', error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת הגמ״חים",
          description: "אירעה שגיאה בטעינת רשימת הגמ״חים שלך. אנא נסה שוב מאוחר יותר."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserGemachs();
  }, [user, navigate]);

  // טעינת גמחים הממתינים לאישור (לאדמין בלבד)
  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchPendingGemachs = async () => {
      try {
        setIsAdminLoading(true);
        const { data: gemachsData, error: gemachsError } = await supabase
          .from('gemachs')
          .select('*')
          .is('is_approved', null);

        if (gemachsError) throw gemachsError;

        // המרת הנתונים למבנה שימושי יותר
        const formattedData = gemachsData?.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          address: item.address,
          neighborhood: item.neighborhood,
          phone: item.phone,
          hours: item.hours,
          image_url: item.image_url,
          user_email: item.owner_email || "לא ידוע", // אנחנו לא צריכים את profiles
          status: 'pending',
          created_at: new Date(item.created_at).toLocaleDateString('he-IL')
        })) || [];

        setPendingGemachs(formattedData);
      } catch (error) {
        console.error('Error fetching pending gemachs:', error);
      } finally {
        setIsAdminLoading(false);
      }
    };

    fetchPendingGemachs();
  }, [user, isAdmin]);

  // טעינת משתמשי מנהל (לאדמין בלבד)
  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchAdminUsers = async () => {
      try {
        setIsUsersLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_admin', true);
        
        if (error) throw error;

        const formattedData = data?.map(item => ({
          id: item.id,
          email: item.email,
          full_name: item.full_name,
          is_admin: item.is_admin,
          created_at: new Date(item.created_at).toLocaleDateString('he-IL')
        })) || [];

        setAdminUsers(formattedData);
      } catch (error) {
        console.error('Error fetching admin users:', error);
      } finally {
        setIsUsersLoading(false);
      }
    };

    fetchAdminUsers();
  }, [user, isAdmin]);

  // טיפול בלחיצה על "הוסף גמ״ח חדש"
  const handleAddGemach = () => {
    navigate('/register-gemach');
  };

  // טיפול בלחיצה על "התנתק"
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // עדכון פרטי הגמ״ח
  const handleUpdate = async (gemach: UserGemach) => {
    try {
      setIsProcessing(true);
      const { error } = await supabase
        .from('gemachs')
        .update({
          name: gemach.name,
          description: gemach.description,
          category: gemach.category,
          address: gemach.address,
          neighborhood: gemach.neighborhood,
          phone: gemach.phone,
          hours: gemach.hours,
          // אם יש תמונה חדשה, היא תעלה בנפרד
        })
        .eq('id', gemach.id);

      if (error) throw error;

      // עדכון התצוגה
      setUserGemachs(prev => prev.map(g => g.id === gemach.id ? {...g, ...gemach} : g));

      toast({
        title: "הגמ״ח עודכן בהצלחה",
        description: "הפרטים עודכנו בהצלחה במערכת",
      });

      setEditGemach(null);
    } catch (error) {
      console.error('Error updating gemach:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בעדכון הגמ״ח",
        description: "אירעה שגיאה בעדכון הגמ״ח. אנא נסה שוב מאוחר יותר."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // מחיקת גמ״ח
  const handleDelete = async (id: string) => {
    try {
      setIsProcessing(true);
      const { error } = await supabase
        .from('gemachs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // עדכון התצוגה
      setUserGemachs(prev => prev.filter(g => g.id !== id));

      toast({
        title: "הגמ״ח נמחק בהצלחה",
        description: "הגמ״ח הוסר בהצלחה מהמערכת",
      });
      
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting gemach:', error);
      toast({
        variant: "destructive",
        title: "שגיאה במחיקת הגמ״ח",
        description: "אירעה שגיאה במחיקת הגמ״ח. אנא נסה שוב מאוחר יותר."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // אישור או דחיית גמ״ח (לאדמין בלבד)
  const handleApproval = async (id: string, approve: boolean) => {
    try {
      setIsProcessing(true);
      const { error } = await supabase
        .from('gemachs')
        .update({ is_approved: approve })
        .eq('id', id);

      if (error) throw error;

      // עדכון התצוגה
      setPendingGemachs(prev => prev.filter(g => g.id !== id));

      toast({
        title: approve ? "הגמ״ח אושר בהצלחה" : "הגמ״ח נדחה",
        description: approve 
          ? "הגמ״ח אושר ויופיע כעת בתוצאות החיפוש" 
          : "הגמ״ח נדחה ולא יופיע בתוצאות החיפוש",
      });
    } catch (error) {
      console.error('Error updating gemach approval:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בעדכון סטטוס הגמ״ח",
        description: "אירעה שגיאה בעדכון סטטוס הגמ״ח. אנא נסה שוב מאוחר יותר."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // הוספת משתמש מנהל חדש
  const handleAddAdmin = async () => {
    if (!newAdminEmail || !newAdminEmail.includes('@')) {
      toast({
        variant: "destructive",
        title: "כתובת אימייל לא תקינה",
        description: "אנא הכנס כתובת אימייל תקינה",
      });
      return;
    }

    try {
      setIsProcessing(true);
      const { data, error } = await supabase.rpc('set_user_admin', {
        user_email: newAdminEmail,
        admin_status: true
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "הרשאות מנהל הוקצו בהצלחה",
          description: `המשתמש ${newAdminEmail} קיבל הרשאות מנהל`,
        });
        
        // רענון רשימת המנהלים
        const { data: newAdminData, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', newAdminEmail)
          .single();
        
        if (!fetchError && newAdminData) {
          setAdminUsers(prev => [...prev, {
            id: newAdminData.id,
            email: newAdminData.email,
            full_name: newAdminData.full_name,
            is_admin: newAdminData.is_admin,
            created_at: new Date(newAdminData.created_at).toLocaleDateString('he-IL')
          }]);
        }
        
        setNewAdminEmail('');
      } else {
        toast({
          variant: "destructive",
          title: "לא ניתן להוסיף הרשאות מנהל",
          description: "המשתמש לא נמצא או שאין לך הרשאות מספיקות",
        });
      }
    } catch (error: any) {
      console.error('Error adding admin user:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בהוספת מנהל",
        description: error.message || "אירעה שגיאה בהוספת הרשאות מנהל",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // הסרת הרשאות מנהל
  const handleRemoveAdmin = async (userId: string, email: string) => {
    if (!confirm(`האם אתה בטוח שברצונך להסיר הרשאות מנהל מ-${email}?`)) {
      return;
    }

    try {
      setIsProcessing(true);
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_admin: false })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "הרשאות מנהל הוסרו בהצלחה",
        description: `הרשאות המנהל של ${email} הוסרו`,
      });

      // עדכון הרשימה
      setAdminUsers(prev => prev.filter(admin => admin.id !== userId));
    } catch (error: any) {
      console.error('Error removing admin user:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בהסרת מנהל",
        description: error.message || "אירעה שגיאה בהסרת הרשאות מנהל",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // טעינה
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-sky-600" />
            <p className="text-lg">טוען את הנתונים שלך...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-10 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
            {/* User sidebar */}
            <div className="md:w-64 shrink-0">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center mb-6">
                    <UserCircle className="h-20 w-20 text-sky-600 mb-3" />
                    <h2 className="text-xl font-bold">{user?.name || 'משתמש'}</h2>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                    {isAdmin && (
                      <span className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">מנהל מערכת</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={() => navigate('/dashboard')}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      הגמ״חים שלי
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleAddGemach}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      הוסף גמ״ח חדש
                    </Button>

                    {isAdmin && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => navigate('/admin')}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        ניהול מערכת
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-red-500 hover:text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      התנתק
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main content */}
            <div className="flex-1">
              <Card>
                <CardHeader>
                  <CardTitle>לוח הבקרה שלי</CardTitle>
                  <CardDescription>נהל את הגמ״חים שלך ועקוב אחר הסטטוס שלהם</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="my-gemachs">
                    <TabsList className="mb-6">
                      <TabsTrigger value="my-gemachs">הגמ״חים שלי</TabsTrigger>
                      {isAdmin && <TabsTrigger value="pending">ממתינים לאישור</TabsTrigger>}
                      {isAdmin && <TabsTrigger value="admins">ניהול מנהלים</TabsTrigger>}
                    </TabsList>
                    
                    <TabsContent value="my-gemachs">
                      {userGemachs.length > 0 ? (
                        <div className="space-y-4">
                          {userGemachs.map((gemach) => (
                            <Card key={gemach.id}>
                              <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                  <h3 className="font-medium">{gemach.name}</h3>
                                  <p className="text-sm text-gray-500">נוצר: {gemach.created_at}</p>
                                  <p className="text-sm text-gray-500">קטגוריה: {gemach.category}</p>
                                </div>
                                <div className="flex items-center">
                                  <span className={`px-3 py-1 rounded-full text-xs ${
                                    gemach.status === 'approved' 
                                      ? 'bg-green-100 text-green-800' 
                                      : gemach.status === 'rejected'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {gemach.status === 'approved' 
                                      ? 'מאושר' 
                                      : gemach.status === 'rejected'
                                      ? 'נדחה'
                                      : 'ממתין לאישור'}
                                  </span>

                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="ml-2"
                                        onClick={() => setEditGemach(gemach)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    {editGemach && editGemach.id === gemach.id && (
                                      <DialogContent className="sm:max-w-[550px]">
                                        <DialogHeader>
                                          <DialogTitle>עריכת גמ״ח</DialogTitle>
                                          <DialogDescription>
                                            ערוך את פרטי הגמ״ח שלך. לחץ על שמור לאישור השינויים.
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                          <div>
                                            <Label htmlFor="name">שם הגמ״ח</Label>
                                            <Input 
                                              id="name" 
                                              value={editGemach.name} 
                                              onChange={(e) => setEditGemach({...editGemach, name: e.target.value})} 
                                            />
                                          </div>
                                          <div>
                                            <Label htmlFor="description">תיאור</Label>
                                            <Textarea 
                                              id="description" 
                                              value={editGemach.description} 
                                              onChange={(e) => setEditGemach({...editGemach, description: e.target.value})} 
                                            />
                                          </div>
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <Label htmlFor="category">קטגוריה</Label>
                                              <Select 
                                                value={editGemach.category} 
                                                onValueChange={(value) => setEditGemach({...editGemach, category: value})}
                                              >
                                                <SelectTrigger>
                                                  <SelectValue placeholder="בחר קטגוריה" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {categories.map((category) => (
                                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <div>
                                              <Label htmlFor="neighborhood">שכונה</Label>
                                              <Select 
                                                value={editGemach.neighborhood} 
                                                onValueChange={(value) => setEditGemach({...editGemach, neighborhood: value})}
                                              >
                                                <SelectTrigger>
                                                  <SelectValue placeholder="בחר שכונה" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {neighborhoods.map((neighborhood) => (
                                                    <SelectItem key={neighborhood} value={neighborhood}>{neighborhood}</SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          </div>
                                          <div>
                                            <Label htmlFor="address">כתובת</Label>
                                            <Input 
                                              id="address" 
                                              value={editGemach.address} 
                                              onChange={(e) => setEditGemach({...editGemach, address: e.target.value})} 
                                            />
                                          </div>
                                          <div>
                                            <Label htmlFor="phone">טלפון</Label>
                                            <Input 
                                              id="phone" 
                                              value={editGemach.phone} 
                                              onChange={(e) => setEditGemach({...editGemach, phone: e.target.value})} 
                                            />
                                          </div>
                                          <div>
                                            <Label htmlFor="hours">שעות פעילות</Label>
                                            <Input 
                                              id="hours" 
                                              value={editGemach.hours} 
                                              onChange={(e) => setEditGemach({...editGemach, hours: e.target.value})} 
                                            />
                                          </div>
                                        </div>
                                        <DialogFooter>
                                          <Button 
                                            variant="outline" 
                                            onClick={() => setEditGemach(null)}
                                            disabled={isProcessing}
                                          >
                                            ביטול
                                          </Button>
                                          <Button 
                                            onClick={() => handleUpdate(editGemach)}
                                            disabled={isProcessing}
                                          >
                                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                            שמור שינויים
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    )}
                                  </Dialog>

                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="text-red-500 hover:text-red-600"
                                        onClick={() => setDeleteId(gemach.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                      <DialogHeader>
                                        <DialogTitle>מחיקת גמ״ח</DialogTitle>
                                        <DialogDescription>
                                          האם אתה בטוח שברצונך למחוק את הגמ״ח? פעולה זו אינה ניתנת לביטול.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <DialogFooter className="mt-4">
                                        <Button 
                                          variant="outline" 
                                          onClick={() => setDeleteId(null)}
                                          disabled={isProcessing}
                                        >
                                          ביטול
                                        </Button>
                                        <Button 
                                          variant="destructive" 
                                          onClick={() => deleteId && handleDelete(deleteId)}
                                          disabled={isProcessing}
                                        >
                                          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                          מחק
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>

                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="ml-2"
                                    onClick={() => navigate(`/gemach/${gemach.id}`)}
                                  >
                                    צפה
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium mb-2">אין לך גמ״חים עדיין</h3>
                          <p className="text-gray-500 mb-6">הוסף את הגמ״ח הראשון שלך כדי שאנשים יוכלו למצוא אותו</p>
                          <Button onClick={handleAddGemach}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            הוסף גמ״ח חדש
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    
                    {isAdmin && (
                      <TabsContent value="pending">
                        {isAdminLoading ? (
                          <div className="flex justify-center items-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
                            <span className="mr-2">טוען גמ״חים ממתינים...</span>
                          </div>
                        ) : pendingGemachs.length > 0 ? (
                          <div className="space-y-4">
                            {pendingGemachs.map((gemach) => (
                              <Card key={gemach.id}>
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <h3 className="font-medium text-lg">{gemach.name}</h3>
                                      <p className="text-sm text-gray-500">
                                        נשלח על ידי: {gemach.user_email || 'משתמש'} | נוצר: {gemach.created_at}
                                      </p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                      ממתין לאישור
                                    </span>
                                  </div>
                                  
                                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                      <strong className="block text-sm mb-1">קטגוריה:</strong>
                                      <span>{gemach.category}</span>
                                    </div>
                                    <div>
                                      <strong className="block text-sm mb-1">שכונה:</strong>
                                      <span>{gemach.neighborhood}</span>
                                    </div>
                                    <div>
                                      <strong className="block text-sm mb-1">כתובת:</strong>
                                      <span>{gemach.address}</span>
                                    </div>
                                    <div>
                                      <strong className="block text-sm mb-1">טלפון:</strong>
                                      <span>{gemach.phone}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="mb-4">
                                    <strong className="block text-sm mb-1">תיאור:</strong>
                                    <p className="text-gray-700">{gemach.description}</p>
                                  </div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2 p-4 pt-0">
                                  <Button 
                                    variant="outline" 
                                    className="text-red-500"
                                    onClick={() => handleApproval(gemach.id, false)}
                                    disabled={isProcessing}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    דחה
                                  </Button>
                                  <Button 
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApproval(gemach.id, true)}
                                    disabled={isProcessing}
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    אשר
                                  </Button>
                                </CardFooter>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-10">
                            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium mb-2">אין גמ״חים הממתינים לאישור</h3>
                            <p className="text-gray-500">כל הגמ״חים אושרו או נדחו</p>
                          </div>
                        )}
                      </TabsContent>
                    )}

                    {isAdmin && (
                      <TabsContent value="admins">
                        <Card className="mb-4">
                          <CardHeader>
                            <CardTitle className="text-lg">הוספת מנהל חדש</CardTitle>
                            <CardDescription>הוסף משתמש קיים כמנהל מערכת</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex space-x-2">
                              <Input 
                                placeholder="הכנס אימייל של משתמש קיים" 
                                value={newAdminEmail} 
                                onChange={(e) => setNewAdminEmail(e.target.value)} 
                                dir="ltr"
                                className="flex-1"
                              />
                              <Button 
                                onClick={handleAddAdmin} 
                                disabled={isProcessing || !newAdminEmail}
                              >
                                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                הוסף מנהל
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        <h3 className="font-medium text-lg mb-4">מנהלי מערכת קיימים</h3>
                        
                        {isUsersLoading ? (
                          <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
                            <span className="mr-2">טוען רשימת מנהלים...</span>
                          </div>
                        ) : adminUsers.length > 0 ? (
                          <div className="space-y-2">
                            {adminUsers.map((admin) => (
                              <Card key={admin.id}>
                                <CardContent className="p-4 flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{admin.full_name || 'ללא שם'}</p>
                                    <p className="text-sm text-gray-500">{admin.email}</p>
                                    <p className="text-xs text-gray-400">נוצר: {admin.created_at}</p>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    className="text-red-500"
                                    size="sm"
                                    onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                                    disabled={isProcessing || admin.email === 'zaviner@gmail.com'} // מונע הסרת המנהל הראשי
                                  >
                                    הסר הרשאות
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-10">
                            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium mb-2">אין מנהלי מערכת</h3>
                            <p className="text-gray-500">הוסף מנהל מערכת ראשון כדי לאפשר ניהול של האתר</p>
                          </div>
                        )}
                      </TabsContent>
                    )}
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard; 