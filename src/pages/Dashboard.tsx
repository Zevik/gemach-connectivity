import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2, Eye, Check, X, Bell } from 'lucide-react';

// Types
interface GemachItem {
  id: number;
  name: string;
  category: string;
  neighborhood: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
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

  // Load gemachs data
  useEffect(() => {
    const loadGemachs = async () => {
      try {
        setLoading(true);
        
        // This would be an API call in a real app
        // For demo, let's create some mock data

        // Mock data for user's gemachs
        const mockUserGemachs: GemachItem[] = [
          {
            id: 1,
            name: 'גמ"ח ציוד רפואי',
            category: 'סיוע רפואי',
            neighborhood: 'רמות',
            createdAt: '2023-05-15',
            status: 'approved',
            createdBy: user?.id || '',
          },
          {
            id: 2,
            name: 'גמ"ח ספרי לימוד',
            category: 'ספרים',
            neighborhood: 'הר נוף',
            createdAt: '2023-06-20',
            status: 'pending',
            createdBy: user?.id || '',
          }
        ];

        // Mock data for pending gemachs (admin only)
        const mockPendingGemachs: GemachItem[] = [
          {
            id: 3,
            name: 'גמ"ח כלי עבודה',
            category: 'כלי בית',
            neighborhood: 'בית וגן',
            createdAt: '2023-06-25',
            status: 'pending',
            createdBy: 'user-abc123',
          },
          {
            id: 4,
            name: 'גמ"ח שמלות כלה',
            category: 'עזרה לחתן וכלה',
            neighborhood: 'גאולה',
            createdAt: '2023-06-28',
            status: 'pending',
            createdBy: 'user-def456',
          }
        ];

        // Mock data for all gemachs (admin only)
        const mockAllGemachs: GemachItem[] = [
          ...mockUserGemachs,
          ...mockPendingGemachs,
          {
            id: 5,
            name: 'גמ"ח ריהוט',
            category: 'ריהוט',
            neighborhood: 'קרית משה',
            createdAt: '2023-05-10',
            status: 'approved',
            createdBy: 'user-ghi789',
          }
        ];

        setUserGemachs(mockUserGemachs);
        
        if (isAdmin) {
          setPendingGemachs(mockPendingGemachs);
          setAllGemachs(mockAllGemachs);
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
  const handleEdit = (id: number) => {
    navigate(`/edit-gemach/${id}`);
  };

  // Handle Delete Gemach
  const handleDelete = async (id: number) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את הגמ"ח הזה?')) {
      try {
        // This would be an API call in a real app
        // For demo, let's update the state directly
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
  const handleApprove = async (id: number) => {
    try {
      // This would be an API call in a real app
      // For demo, let's update the state directly
      setPendingGemachs(pendingGemachs.filter(gemach => gemach.id !== id));
      
      setAllGemachs(allGemachs.map(gemach => 
        gemach.id === id ? { ...gemach, status: 'approved' as const } : gemach
      ));

      // Also update in userGemachs if it belongs to the current user
      setUserGemachs(userGemachs.map(gemach => 
        gemach.id === id ? { ...gemach, status: 'approved' as const } : gemach
      ));
    } catch (error) {
      console.error('Error approving gemach:', error);
    }
  };

  // Handle Reject Gemach (admin only)
  const handleReject = async (id: number) => {
    try {
      // This would be an API call in a real app
      // For demo, let's update the state directly
      setPendingGemachs(pendingGemachs.filter(gemach => gemach.id !== id));
      
      setAllGemachs(allGemachs.map(gemach => 
        gemach.id === id ? { ...gemach, status: 'rejected' as const } : gemach
      ));

      // Also update in userGemachs if it belongs to the current user
      setUserGemachs(userGemachs.map(gemach => 
        gemach.id === id ? { ...gemach, status: 'rejected' as const } : gemach
      ));
    } catch (error) {
      console.error('Error rejecting gemach:', error);
    }
  };

  // Handle View Gemach Details
  const handleViewDetails = (id: number) => {
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

  // Render gemach card
  const renderGemachCard = (gemach: GemachItem, isAdmin = false) => (
    <Card key={gemach.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{gemach.name}</CardTitle>
          {renderStatusBadge(gemach.status)}
        </div>
        <CardDescription>
          <div className="flex flex-col gap-1 mt-2">
            <div>קטגוריה: {gemach.category}</div>
            <div>שכונה: {gemach.neighborhood}</div>
            <div>נוצר בתאריך: {gemach.createdAt}</div>
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
        
        {isAdmin && gemach.status === 'pending' && (
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
                      קבל התראות במייל על רישום גמ״חים חדשים ({user.email})
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
