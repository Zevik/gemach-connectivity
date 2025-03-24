import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2, Eye, Check, X, Bell } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Sample gemachs
const sampleGemachs = [
  {
    name: "גמ\"ח כלי עבודה",
    category: "כלי בית",
    neighborhood: "רחביה",
    address: "רחוב קרן היסוד 19, ירושלים",
    phone: "02-123-4567",
    hours: "א'-ה' 9:00-19:00",
    description: "השאלת כלי עבודה לבית ולגינה. כולל מקדחות, פטישים, מברגים, כלי גינון ועוד.",
    is_approved: true
  },
  {
    name: "גמ\"ח ציוד רפואי",
    category: "סיוע רפואי",
    neighborhood: "בית וגן",
    address: "רחוב הפסגה 42, ירושלים",
    phone: "02-765-4321",
    hours: "א'-ה' 10:00-18:00, ו' 9:00-12:00",
    description: "השאלת ציוד רפואי לנזקקים. כיסאות גלגלים, קביים, הליכונים, מכשירי אדים ועוד.",
    is_approved: true
  },
  {
    name: "גמ\"ח ספרי לימוד",
    category: "ספרים",
    neighborhood: "הר נוף",
    address: "רחוב קצנלבוגן 32, ירושלים",
    phone: "02-987-6543",
    hours: "א', ג', ה' 16:00-20:00",
    description: "השאלת ספרי לימוד לתלמידים בכל הגילאים. ספרי קודש, ספרי לימוד, וחוברות עבודה.",
    is_approved: true
  }
];

// Types
interface GemachItem {
  id: string;
  name: string;
  category: string;
  neighborhood: string;
  created_at: string;
  phone: string;
  description: string;
  address: string;
  is_approved: boolean | null;
  owner_id: string;
  // Add other fields that might be present in your Supabase table
}

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [userGemachs, setUserGemachs] = useState<GemachItem[]>([]);
  const [pendingGemachs, setPendingGemachs] = useState<GemachItem[]>([]);
  const [allGemachs, setAllGemachs] = useState<GemachItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Add sample gemachs if admin and no gemachs exist
  useEffect(() => {
    const addSampleGemachs = async () => {
      if (!isAdmin) return;
      
      try {
        // Check if there are any gemachs
        const { data, error } = await supabase
          .from('gemachs')
          .select('id')
          .limit(1);
          
        if (error) throw error;
        
        // If no gemachs exist, add the sample ones
        if (!data || data.length === 0) {
          console.log("No gemachs found, adding sample gemachs...");
          
          const formattedGemachs = sampleGemachs.map(gemach => ({
            ...gemach,
            owner_id: user?.id || null,
            created_at: new Date().toISOString(),
          }));
          
          const { data: insertedData, error: insertError } = await supabase
            .from('gemachs')
            .insert(formattedGemachs)
            .select();
            
          if (insertError) throw insertError;
          
          console.log("Added sample gemachs:", insertedData);
          toast({
            title: "נוספו גמ\"חים לדוגמה",
            description: "מספר גמ\"חים לדוגמה נוספו למערכת",
          });
        }
      } catch (error) {
        console.error("Error adding sample gemachs:", error);
      }
    };
    
    addSampleGemachs();
  }, [isAdmin, user]);

  // Load gemachs data
  useEffect(() => {
    const loadGemachs = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Load user's gemachs
        const { data: userGemachsData, error: userGemachsError } = await supabase
          .from('gemachs')
          .select('*')
          .eq('owner_id', user.id);
          
        if (userGemachsError) throw userGemachsError;
        setUserGemachs(userGemachsData || []);
        
        // Load pending gemachs (admin only)
        if (isAdmin) {
          // Use "is" to handle nulls properly
          const { data: pendingGemachsData, error: pendingGemachsError } = await supabase
            .from('gemachs')
            .select('*')
            .is('is_approved', null);
            
          if (pendingGemachsError) throw pendingGemachsError;
          setPendingGemachs(pendingGemachsData || []);
          
          // Load all gemachs (admin only)
          const { data: allGemachsData, error: allGemachsError } = await supabase
            .from('gemachs')
            .select('*');
            
          if (allGemachsError) throw allGemachsError;
          setAllGemachs(allGemachsData || []);
        }
      } catch (error) {
        console.error('Error loading gemachs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadGemachs();
    }
  }, [user, isAdmin]);

  // Handle Edit Gemach
  const handleEdit = (id: string) => {
    navigate(`/edit-gemach/${id}`);
  };

  // Handle Delete Gemach
  const handleDelete = async (id: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את הגמ"ח הזה?')) {
      try {
        const { error } = await supabase
          .from('gemachs')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        // Update local state after successful deletion
        setUserGemachs(userGemachs.filter(gemach => gemach.id !== id));
        if (isAdmin) {
          setPendingGemachs(pendingGemachs.filter(gemach => gemach.id !== id));
          setAllGemachs(allGemachs.filter(gemach => gemach.id !== id));
        }
      } catch (error) {
        console.error('Error deleting gemach:', error);
      }
    }
  };

  // Handle Approve Gemach (admin only)
  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gemachs')
        .update({ is_approved: true })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state after successful approval
      setPendingGemachs(pendingGemachs.filter(gemach => gemach.id !== id));
      
      // Update the full list with the updated gemach
      setAllGemachs(allGemachs.map(gemach => 
        gemach.id === id ? { ...gemach, is_approved: true } : gemach
      ));

      // Also update in userGemachs if it belongs to the current user
      setUserGemachs(userGemachs.map(gemach => 
        gemach.id === id ? { ...gemach, is_approved: true } : gemach
      ));
    } catch (error) {
      console.error('Error approving gemach:', error);
    }
  };

  // Handle Reject Gemach (admin only)
  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gemachs')
        .update({ is_approved: false })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state after successful rejection
      setPendingGemachs(pendingGemachs.filter(gemach => gemach.id !== id));
      
      // Update the full list with the updated gemach
      setAllGemachs(allGemachs.map(gemach => 
        gemach.id === id ? { ...gemach, is_approved: false } : gemach
      ));

      // Also update in userGemachs if it belongs to the current user
      setUserGemachs(userGemachs.map(gemach => 
        gemach.id === id ? { ...gemach, is_approved: false } : gemach
      ));
    } catch (error) {
      console.error('Error rejecting gemach:', error);
    }
  };

  // Handle View Gemach Details
  const handleViewDetails = (id: string) => {
    navigate(`/gemach/${id}`);
  };

  // Toggle email notifications
  const toggleEmailNotifications = () => {
    setEmailNotifications(!emailNotifications);
    // In a real app, this would call an API to update the user's preferences
    console.log(`Email notifications ${!emailNotifications ? 'enabled' : 'disabled'}`);
  };

  // Helper to render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">ממתין לאישור</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">מאושר</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">נדחה</Badge>;
      default:
        return null;
    }
  };

  // Convert Supabase is_approved field to status
  const getStatusFromGemach = (gemach: any): 'pending' | 'approved' | 'rejected' => {
    // Supabase could return null, true, or false for is_approved
    if (gemach.is_approved === true) return 'approved';
    if (gemach.is_approved === false) return 'rejected';
    // Null or undefined means pending
    return 'pending';
  };

  // Render gemach card
  const renderGemachCard = (gemach: any, isAdmin = false) => {
    const status = getStatusFromGemach(gemach);
    
    return (
      <Card key={gemach.id} className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>{gemach.name}</CardTitle>
            {renderStatusBadge(status)}
          </div>
          <CardDescription>
            <div className="flex flex-col gap-1 mt-2">
              <div>קטגוריה: {gemach.category}</div>
              <div>שכונה: {gemach.neighborhood}</div>
              <div>נוצר בתאריך: {gemach.created_at}</div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleViewDetails(gemach.id)}>
              <Eye className="h-4 w-4 ml-1" />
              צפייה
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleEdit(gemach.id)}>
              <Pencil className="h-4 w-4 ml-1" />
              עריכה
            </Button>
            <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDelete(gemach.id)}>
              <Trash2 className="h-4 w-4 ml-1" />
              מחיקה
            </Button>
          </div>
          
          {isAdmin && status === 'pending' && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleApprove(gemach.id)}>
                <Check className="h-4 w-4 ml-1" />
                אישור
              </Button>
              <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleReject(gemach.id)}>
                <X className="h-4 w-4 ml-1" />
                דחייה
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    );
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">אזור אישי</h1>
          
          {/* Admin Settings */}
          {isAdmin && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  הגדרות מנהל
                </CardTitle>
                <CardDescription>
                  הגדרות עבור חשבון מנהל המערכת
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="font-medium">התראות במייל</h3>
                    <p className="text-sm text-gray-500">
                      קבל התראות במייל על רישום גמ״חים חדשים ({user?.email})
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={toggleEmailNotifications}
                  />
                </div>
              </CardContent>
            </Card>
          )}
          
          {loading ? (
            <div className="text-center py-8">טוען...</div>
          ) : (
            <Tabs defaultValue="my-gemachs">
              <TabsList className="mb-6">
                <TabsTrigger value="my-gemachs">הגמ״חים שלי</TabsTrigger>
                {isAdmin && <TabsTrigger value="pending">ממתינים לאישור</TabsTrigger>}
                {isAdmin && <TabsTrigger value="all">כל הגמ״חים</TabsTrigger>}
              </TabsList>
              
              <TabsContent value="my-gemachs">
                <div className="mb-4">
                  <Button onClick={() => navigate('/register-gemach')}>הוספת גמ״ח חדש</Button>
                </div>
                
                {userGemachs.length > 0 ? (
                  <div>
                    {userGemachs.map(gemach => renderGemachCard(gemach))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    עדיין לא יצרת גמ״חים. לחץ על "הוספת גמ״ח חדש" כדי להתחיל.
                  </div>
                )}
              </TabsContent>
              
              {isAdmin && (
                <TabsContent value="pending">
                  <h2 className="text-xl font-semibold mb-4">גמ״חים הממתינים לאישור</h2>
                  
                  {pendingGemachs.length > 0 ? (
                    <div>
                      {pendingGemachs.map(gemach => renderGemachCard(gemach, true))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      אין גמ״חים הממתינים לאישור.
                    </div>
                  )}
                </TabsContent>
              )}
              
              {isAdmin && (
                <TabsContent value="all">
                  <h2 className="text-xl font-semibold mb-4">כל הגמ״חים במערכת</h2>
                  
                  {allGemachs.length > 0 ? (
                    <div>
                      {allGemachs.map(gemach => renderGemachCard(gemach, true))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      אין גמ״חים במערכת.
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
