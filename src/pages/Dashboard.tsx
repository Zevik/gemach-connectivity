import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, UserCircle, LogOut, Package, Settings, PlusCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

interface UserGemach {
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userGemachs, setUserGemachs] = useState<UserGemach[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // הפניה לדף ההתחברות אם אין משתמש מחובר
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchUserGemachs = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('gemachs')
          .select('id, name, is_approved, created_at')
          .eq('user_id', user.id);

        if (error) throw error;

        // המרת הנתונים למבנה שימושי יותר
        const formattedData = data?.map(item => ({
          id: item.id,
          name: item.name,
          status: item.is_approved ? 'approved' : 'pending',
          created_at: new Date(item.created_at).toLocaleDateString('he-IL')
        })) || [];

        setUserGemachs(formattedData);
      } catch (error) {
        console.error('Error fetching user gemachs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserGemachs();
  }, [user, navigate]);

  const handleAddGemach = () => {
    navigate('/register-gemach');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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
                      <TabsTrigger value="activity">פעילות אחרונה</TabsTrigger>
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
                    
                    <TabsContent value="activity">
                      <div className="text-center py-10 text-gray-500">
                        אין פעילות חדשה להצגה
                      </div>
                    </TabsContent>
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