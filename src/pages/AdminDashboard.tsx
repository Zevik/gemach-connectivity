
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, 
  Trash2, 
  Eye, 
  AlertTriangle, 
  Edit, 
  RefreshCcw, 
  Star,
  StarOff
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface Gemach {
  id: string;
  name: string;
  category: string;
  description: string;
  phone: string;
  created_at: string;
  email: string | null;
  is_approved: boolean | null;
  is_deleted?: boolean | null;
  deleted_at?: string | null;
  // Additional fields to match the data structure
  address: string;
  neighborhood: string;
  location_instructions: string | null;
  manager_phone: string | null;
  hours: string;
  has_fee: boolean;
  fee_details: string | null;
  website_url: string | null;
  facebook_url: string | null;
  city: string | null;
  featured: boolean | null;
  owner_id: string | null;
  updated_at: string | null;
  // Image URL (optional)
  imageUrl?: string | null;
}

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const [pendingGemachs, setPendingGemachs] = useState<Gemach[]>([]);
  const [approvedGemachs, setApprovedGemachs] = useState<Gemach[]>([]);
  const [deletedGemachs, setDeletedGemachs] = useState<Gemach[]>([]);
  const [featuredGemachs, setFeaturedGemachs] = useState<Gemach[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState<boolean>(true);
  const [isLoadingApproved, setIsLoadingApproved] = useState<boolean>(true);
  const [isLoadingDeleted, setIsLoadingDeleted] = useState<boolean>(true);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState<boolean>(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteGemachId, setDeleteGemachId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) {
        fetchPendingGemachs();
        fetchApprovedGemachs();
        fetchDeletedGemachs();
        fetchFeaturedGemachs();
      }
    }
  }, [user, loading, isAdmin]);

  // Get image URL for a gemach
  const getGemachImageUrl = async (gemachId: string) => {
    try {
      const { data: imageData, error: imageError } = await supabase
        .from('gemach_images')
        .select('storage_path')
        .eq('gemach_id', gemachId)
        .eq('is_primary', true)
        .single();

      if (imageError || !imageData) {
        return null;
      }

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(imageData.storage_path);

      return data.publicUrl;
    } catch (error) {
      console.error("Error fetching gemach image:", error);
      return null;
    }
  };

  const fetchPendingGemachs = async () => {
    try {
      setIsLoadingPending(true);
      
      const { data, error } = await supabase
        .from('gemachs')
        .select('*')
        .or('is_approved.is.null,is_approved.eq.false')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching pending gemachs:', error);
        toast({
          title: "שגיאה בטעינת נתונים",
          description: "לא ניתן לטעון את רשימת הגמ\"חים הממתינים לאישור",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        // Process data with images
        const gemachsWithImages = await Promise.all(data.map(async (item) => {
          const imageUrl = await getGemachImageUrl(item.id);
          
          return {
            id: item.id,
            name: item.name,
            category: item.category,
            description: item.description,
            phone: item.phone,
            created_at: item.created_at,
            is_approved: item.is_approved,
            is_deleted: false, // Default value
            deleted_at: null,  // Default value
            address: item.address,
            neighborhood: item.neighborhood,
            location_instructions: item.location_instructions,
            manager_phone: item.manager_phone,
            email: item.email,
            hours: item.hours,
            has_fee: item.has_fee,
            fee_details: item.fee_details,
            website_url: item.website_url,
            facebook_url: item.facebook_url,
            city: item.city,
            featured: item.featured,
            owner_id: item.owner_id,
            updated_at: item.updated_at,
            imageUrl: imageUrl
          };
        }));
        
        setPendingGemachs(gemachsWithImages);
      }
    } catch (error) {
      console.error('Error fetching pending gemachs:', error);
    } finally {
      setIsLoadingPending(false);
    }
  };

  const fetchApprovedGemachs = async () => {
    try {
      setIsLoadingApproved(true);
      
      const { data, error } = await supabase
        .from('gemachs')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching approved gemachs:', error);
        toast({
          title: "שגיאה בטעינת נתונים",
          description: "לא ניתן לטעון את רשימת הגמ\"חים המאושרים",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        // Process data with images
        const gemachsWithImages = await Promise.all(data.map(async (item) => {
          const imageUrl = await getGemachImageUrl(item.id);
          
          return {
            id: item.id,
            name: item.name,
            category: item.category,
            description: item.description,
            phone: item.phone,
            created_at: item.created_at,
            is_approved: item.is_approved,
            is_deleted: false, // Default value
            deleted_at: null,  // Default value
            address: item.address,
            neighborhood: item.neighborhood,
            location_instructions: item.location_instructions,
            manager_phone: item.manager_phone,
            email: item.email,
            hours: item.hours,
            has_fee: item.has_fee,
            fee_details: item.fee_details,
            website_url: item.website_url,
            facebook_url: item.facebook_url,
            city: item.city,
            featured: item.featured,
            owner_id: item.owner_id,
            updated_at: item.updated_at,
            imageUrl: imageUrl
          };
        }));
        
        setApprovedGemachs(gemachsWithImages);
      }
    } catch (error) {
      console.error('Error fetching approved gemachs:', error);
    } finally {
      setIsLoadingApproved(false);
    }
  };

  const fetchDeletedGemachs = async () => {
    setIsLoadingDeleted(true);
    // This is a placeholder for future functionality to fetch deleted gemachs
    // Currently, we are using soft delete via the delete operation, but not tracking deleted state
    setDeletedGemachs([]);
    setIsLoadingDeleted(false);
  };

  const fetchFeaturedGemachs = async () => {
    try {
      setIsLoadingFeatured(true);
      
      const { data, error } = await supabase
        .from('gemachs')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching featured gemachs:', error);
        return;
      }
      
      if (data) {
        // Process data with images
        const gemachsWithImages = await Promise.all(data.map(async (item) => {
          const imageUrl = await getGemachImageUrl(item.id);
          
          return {
            id: item.id,
            name: item.name,
            category: item.category,
            description: item.description,
            phone: item.phone,
            created_at: item.created_at,
            is_approved: item.is_approved,
            is_deleted: false, // Default value
            deleted_at: null,  // Default value
            address: item.address,
            neighborhood: item.neighborhood,
            location_instructions: item.location_instructions,
            manager_phone: item.manager_phone,
            email: item.email,
            hours: item.hours,
            has_fee: item.has_fee,
            fee_details: item.fee_details,
            website_url: item.website_url,
            facebook_url: item.facebook_url,
            city: item.city,
            featured: item.featured,
            owner_id: item.owner_id,
            updated_at: item.updated_at,
            imageUrl: imageUrl
          };
        }));
        
        setFeaturedGemachs(gemachsWithImages);
      }
    } catch (error) {
      console.error('Error fetching featured gemachs:', error);
    } finally {
      setIsLoadingFeatured(false);
    }
  };

  const approveGemach = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gemachs')
        .update({ is_approved: true })
        .eq('id', id);
      
      if (error) {
        console.error('Error approving gemach:', error);
        toast({
          title: "שגיאה באישור הגמ\"ח",
          description: "לא ניתן לאשר את הגמ\"ח. נסה שוב מאוחר יותר",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "הגמ\"ח אושר בהצלחה",
        description: "הגמ\"ח יופיע כעת ברשימה הראשית",
      });
      
      fetchPendingGemachs();
      fetchApprovedGemachs();
    } catch (error) {
      console.error('Error approving gemach:', error);
    }
  };

  const rejectGemach = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gemachs')
        .update({ is_approved: false })
        .eq('id', id);
      
      if (error) {
        console.error('Error rejecting gemach:', error);
        toast({
          title: "שגיאה בדחיית הגמ\"ח",
          description: "לא ניתן לדחות את הגמ\"ח. נסה שוב מאוחר יותר",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "הגמ\"ח נדחה בהצלחה",
        description: "הגמ\"ח לא יופיע ברשימה הראשית",
      });
      
      fetchPendingGemachs();
      fetchApprovedGemachs();
    } catch (error) {
      console.error('Error rejecting gemach:', error);
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean | null) => {
    try {
      const newFeaturedState = !currentFeatured;
      
      const { error } = await supabase
        .from('gemachs')
        .update({ featured: newFeaturedState })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating featured status:', error);
        toast({
          title: "שגיאה בעדכון סטטוס מומלץ",
          description: "לא ניתן לעדכן את סטטוס המומלץ. נסה שוב מאוחר יותר",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: newFeaturedState ? "הגמ\"ח סומן כמומלץ" : "הגמ\"ח הוסר מהמומלצים",
      });
      
      fetchApprovedGemachs();
      fetchFeaturedGemachs();
    } catch (error) {
      console.error('Error updating featured status:', error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteGemachId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (!deleteGemachId) return;

      // מחיקת התמונות הקשורות לגמ״ח
      const { data: imageData } = await supabase
        .from('gemach_images')
        .select('storage_path')
        .eq('gemach_id', deleteGemachId);

      if (imageData && imageData.length > 0) {
        // מחיקת הקבצים מהאחסון
        for (const image of imageData) {
          await supabase.storage
            .from('images')
            .remove([image.storage_path]);
        }

        // מחיקת הרשומות מטבלת gemach_images
        await supabase
          .from('gemach_images')
          .delete()
          .eq('gemach_id', deleteGemachId);
      }

      // מחיקת הגמ״ח עצמו
      const { error } = await supabase
        .from("gemachs")
        .delete()
        .eq("id", deleteGemachId);

      if (error) {
        throw error;
      }

      toast({
        title: "הגמ\"ח נמחק בהצלחה",
        description: "הגמ\"ח הוסר מהמערכת לצמיתות",
      });

      fetchPendingGemachs();
      fetchApprovedGemachs();
      fetchFeaturedGemachs();
    } catch (error) {
      console.error("Error deleting gemach:", error);
      toast({
        title: "שגיאה במחיקת הגמ\"ח",
        description: "אירעה שגיאה בעת מחיקת הגמ\"ח. אנא נסה שנית.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteGemachId(null);
    }
  };

  const refreshData = () => {
    fetchPendingGemachs();
    fetchApprovedGemachs();
    fetchFeaturedGemachs();
    toast({
      title: "הנתונים רועננו בהצלחה",
    });
  };

  // אם המשתמש לא מחובר, הפנה אותו לדף ההתחברות
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // אם המשתמש לא מנהל, הפנה אותו לדף הראשי
  if (!loading && user && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center" dir="rtl">
        <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
        <h1 className="text-3xl font-bold mb-4">אין לך הרשאות מנהל</h1>
        <p className="mb-6">רק משתמשים עם הרשאות מנהל יכולים לגשת לדף זה.</p>
        <Button onClick={() => navigate('/dashboard')}>חזרה ללוח הבקרה</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">לוח בקרת מנהל</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={refreshData}
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              רענון נתונים
            </Button>
            <Button onClick={() => navigate('/dashboard')} variant="outline">חזרה ללוח הבקרה הרגיל</Button>
          </div>
        </div>
        
        <Tabs defaultValue="pending">
          <TabsList className="mb-8 w-full justify-start">
            <TabsTrigger value="pending">ממתינים לאישור</TabsTrigger>
            <TabsTrigger value="approved">גמ"חים מאושרים</TabsTrigger>
            <TabsTrigger value="featured">גמ"חים מומלצים</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>גמ&quot;חים הממתינים לאישור</CardTitle>
                <CardDescription>אשר או דחה גמ&quot;חים שנוספו למערכת</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPending ? (
                  <div className="flex justify-center py-8">
                    <div className="w-12 h-12 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
                  </div>
                ) : pendingGemachs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>אין גמ&quot;חים הממתינים לאישור כרגע</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>שם הגמ&quot;ח</TableHead>
                          <TableHead>קטגוריה</TableHead>
                          <TableHead>יוצר</TableHead>
                          <TableHead>תאריך יצירה</TableHead>
                          <TableHead>פעולות</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingGemachs.map((gemach) => (
                          <TableRow key={gemach.id}>
                            <TableCell className="font-medium">{gemach.name}</TableCell>
                            <TableCell>{gemach.category}</TableCell>
                            <TableCell>{gemach.email || 'לא ידוע'}</TableCell>
                            <TableCell>{new Date(gemach.created_at).toLocaleDateString('he-IL')}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2 space-x-reverse">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/gemach/${gemach.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/gemach/${gemach.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => approveGemach(gemach.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteClick(gemach.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>גמ&quot;חים מאושרים</CardTitle>
                <CardDescription>ניהול גמ"חים שכבר אושרו ומופיעים באתר</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingApproved ? (
                  <div className="flex justify-center py-8">
                    <div className="w-12 h-12 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
                  </div>
                ) : approvedGemachs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>אין גמ&quot;חים מאושרים במערכת</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>שם הגמ&quot;ח</TableHead>
                          <TableHead>קטגוריה</TableHead>
                          <TableHead>יוצר</TableHead>
                          <TableHead>תאריך יצירה</TableHead>
                          <TableHead>מומלץ</TableHead>
                          <TableHead>פעולות</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {approvedGemachs.map((gemach) => (
                          <TableRow key={gemach.id}>
                            <TableCell className="font-medium">{gemach.name}</TableCell>
                            <TableCell>{gemach.category}</TableCell>
                            <TableCell>{gemach.email || 'לא ידוע'}</TableCell>
                            <TableCell>{new Date(gemach.created_at).toLocaleDateString('he-IL')}</TableCell>
                            <TableCell>
                              {gemach.featured ? 
                                <div className="text-amber-500 flex items-center gap-1">
                                  <Star className="h-4 w-4" />
                                  כן
                                </div> : 
                                <div className="text-gray-500 flex items-center gap-1">
                                  <StarOff className="h-4 w-4" />
                                  לא
                                </div>}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2 space-x-reverse">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/gemach/${gemach.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/gemach/${gemach.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant={gemach.featured ? "default" : "outline"}
                                  size="sm"
                                  className={gemach.featured ? "bg-amber-500 hover:bg-amber-600" : ""}
                                  onClick={() => toggleFeatured(gemach.id, gemach.featured)}
                                >
                                  {gemach.featured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteClick(gemach.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="featured">
            <Card>
              <CardHeader>
                <CardTitle>גמ&quot;חים מומלצים</CardTitle>
                <CardDescription>גמ"חים מומלצים שיופיעו בחלק העליון של הדף הראשי</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingFeatured ? (
                  <div className="flex justify-center py-8">
                    <div className="w-12 h-12 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
                  </div>
                ) : featuredGemachs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>אין גמ&quot;חים מומלצים כרגע</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>שם הגמ&quot;ח</TableHead>
                          <TableHead>קטגוריה</TableHead>
                          <TableHead>יוצר</TableHead>
                          <TableHead>תאריך יצירה</TableHead>
                          <TableHead>פעולות</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {featuredGemachs.map((gemach) => (
                          <TableRow key={gemach.id}>
                            <TableCell className="font-medium">{gemach.name}</TableCell>
                            <TableCell>{gemach.category}</TableCell>
                            <TableCell>{gemach.email || 'לא ידוע'}</TableCell>
                            <TableCell>{new Date(gemach.created_at).toLocaleDateString('he-IL')}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2 space-x-reverse">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/gemach/${gemach.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/gemach/${gemach.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="default"
                                  size="sm"
                                  className="bg-amber-500 hover:bg-amber-600"
                                  onClick={() => toggleFeatured(gemach.id, gemach.featured)}
                                >
                                  <StarOff className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteClick(gemach.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>אישור מחיקת גמ&quot;ח</DialogTitle>
              <DialogDescription>
                האם אתה בטוח שברצונך למחוק את הגמ&quot;ח? פעולה זו לא ניתנת לביטול.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                ביטול
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                מחיקה
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
