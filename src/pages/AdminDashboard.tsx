import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Trash2, Eye, AlertTriangle, Edit, RefreshCcw } from 'lucide-react';

interface Gemach {
  id: string;
  name: string;
  category: string;
  description: string;
  phone: string;
  created_at: string;
  owner_email: string | null;
  is_approved: boolean | null;
  is_deleted: boolean | null;
  deleted_at: string | null;
}

const AdminDashboard = () => {
  const { user, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [pendingGemachs, setPendingGemachs] = useState<Gemach[]>([]);
  const [approvedGemachs, setApprovedGemachs] = useState<Gemach[]>([]);
  const [deletedGemachs, setDeletedGemachs] = useState<Gemach[]>([]);
  const [isLoadingGemachs, setIsLoadingGemachs] = useState<boolean>(true);
  const [isLoadingApproved, setIsLoadingApproved] = useState<boolean>(true);
  const [isLoadingDeleted, setIsLoadingDeleted] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase.rpc('is_admin');
        
        if (error) {
          console.error('Error checking admin status:', error);
          return;
        }
        
        setIsAdmin(data || false);
        
        if (data) {
          fetchPendingGemachs();
          fetchApprovedGemachs();
          fetchDeletedGemachs();
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();
  }, [user]);

  const fetchPendingGemachs = async () => {
    try {
      setIsLoadingGemachs(true);
      
      const { data, error } = await supabase
        .from('gemachs')
        .select('*')
        .is('is_deleted', null)
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
      
      setPendingGemachs(data || []);
    } catch (error) {
      console.error('Error fetching pending gemachs:', error);
    } finally {
      setIsLoadingGemachs(false);
    }
  };

  const fetchApprovedGemachs = async () => {
    try {
      setIsLoadingApproved(true);
      
      const { data, error } = await supabase
        .from('gemachs')
        .select('*')
        .eq('is_approved', true)
        .is('is_deleted', null)
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
      
      setApprovedGemachs(data || []);
    } catch (error) {
      console.error('Error fetching approved gemachs:', error);
    } finally {
      setIsLoadingApproved(false);
    }
  };

  const fetchDeletedGemachs = async () => {
    try {
      setIsLoadingDeleted(true);
      
      const { data, error } = await supabase
        .from('gemachs')
        .select('*')
        .eq('is_deleted', true)
        .order('deleted_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching deleted gemachs:', error);
        toast({
          title: "שגיאה בטעינת נתונים",
          description: "לא ניתן לטעון את רשימת הגמ\"חים שנמחקו",
          variant: "destructive",
        });
        return;
      }
      
      setDeletedGemachs(data || []);
    } catch (error) {
      console.error('Error fetching deleted gemachs:', error);
    } finally {
      setIsLoadingDeleted(false);
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

  const softDeleteGemach = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך להעביר את הגמ\"ח לסל המחזור? ניתן לשחזר אותו מאוחר יותר.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('gemachs')
        .update({ 
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error soft deleting gemach:', error);
        toast({
          title: "שגיאה בהעברה לסל המחזור",
          description: "לא ניתן להעביר את הגמ\"ח לסל המחזור. נסה שוב מאוחר יותר",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "הגמ\"ח הועבר לסל המחזור",
        description: "הגמ\"ח הועבר לסל המחזור בהצלחה",
      });
      
      fetchPendingGemachs();
      fetchApprovedGemachs();
      fetchDeletedGemachs();
    } catch (error) {
      console.error('Error soft deleting gemach:', error);
    }
  };

  const restoreGemach = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gemachs')
        .update({ 
          is_deleted: null,
          deleted_at: null
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error restoring gemach:', error);
        toast({
          title: "שגיאה בשחזור הגמ\"ח",
          description: "לא ניתן לשחזר את הגמ\"ח. נסה שוב מאוחר יותר",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "הגמ\"ח שוחזר בהצלחה",
        description: "הגמ\"ח הוחזר למערכת בהצלחה",
      });
      
      fetchApprovedGemachs();
      fetchDeletedGemachs();
    } catch (error) {
      console.error('Error restoring gemach:', error);
    }
  };

  const permanentDeleteGemach = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק לצמיתות את הגמ\"ח? פעולה זו אינה ניתנת לביטול.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('gemachs')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error permanently deleting gemach:', error);
        toast({
          title: "שגיאה במחיקת הגמ\"ח",
          description: "לא ניתן למחוק לצמיתות את הגמ\"ח. נסה שוב מאוחר יותר",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "הגמ\"ח נמחק לצמיתות",
      });
      
      fetchDeletedGemachs();
    } catch (error) {
      console.error('Error permanently deleting gemach:', error);
    }
  };

  // אם המשתמש לא מחובר, הפנה אותו לדף ההתחברות
  if (!isLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // אם המשתמש לא מנהל, הפנה אותו לדף הראשי
  if (!isLoading && user && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center" dir="rtl">
        <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
        <h1 className="text-3xl font-bold mb-4">אין לך הרשאות מנהל</h1>
        <p className="mb-6">רק משתמשים עם הרשאות מנהל יכולים לגשת לדף זה.</p>
        <Button onClick={() => navigate('/dashboard')}>חזרה ללוח הבקרה</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">ניהול גמ&quot;חים</h1>
        <Button onClick={() => navigate('/dashboard')} variant="outline">חזרה ללוח הבקרה</Button>
      </div>
      
      <Tabs defaultValue="pending">
        <TabsList className="mb-8">
          <TabsTrigger value="pending">ממתינים לאישור</TabsTrigger>
          <TabsTrigger value="approved">גמ"חים מאושרים</TabsTrigger>
          <TabsTrigger value="deleted">סל מחזור</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>גמ&quot;חים הממתינים לאישור</CardTitle>
              <CardDescription>אשר או דחה גמ&quot;חים שנוספו למערכת</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingGemachs ? (
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
                          <TableCell>{gemach.owner_email || 'לא ידוע'}</TableCell>
                          <TableCell>{new Date(gemach.created_at).toLocaleDateString('he-IL')}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
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
                                onClick={() => softDeleteGemach(gemach.id)}
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
                        <TableHead>פעולות</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedGemachs.map((gemach) => (
                        <TableRow key={gemach.id}>
                          <TableCell className="font-medium">{gemach.name}</TableCell>
                          <TableCell>{gemach.category}</TableCell>
                          <TableCell>{gemach.owner_email || 'לא ידוע'}</TableCell>
                          <TableCell>{new Date(gemach.created_at).toLocaleDateString('he-IL')}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
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
                                variant="destructive" 
                                size="sm"
                                onClick={() => softDeleteGemach(gemach.id)}
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

        <TabsContent value="deleted">
          <Card>
            <CardHeader>
              <CardTitle>סל מחזור</CardTitle>
              <CardDescription>גמ"חים שהועברו לסל המחזור - ניתן לשחזר או למחוק לצמיתות</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDeleted ? (
                <div className="flex justify-center py-8">
                  <div className="w-12 h-12 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
                </div>
              ) : deletedGemachs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>אין גמ&quot;חים בסל המחזור</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>שם הגמ&quot;ח</TableHead>
                        <TableHead>קטגוריה</TableHead>
                        <TableHead>יוצר</TableHead>
                        <TableHead>תאריך מחיקה</TableHead>
                        <TableHead>פעולות</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deletedGemachs.map((gemach) => (
                        <TableRow key={gemach.id} className="opacity-70">
                          <TableCell className="font-medium">{gemach.name}</TableCell>
                          <TableCell>{gemach.category}</TableCell>
                          <TableCell>{gemach.owner_email || 'לא ידוע'}</TableCell>
                          <TableCell>{gemach.deleted_at ? new Date(gemach.deleted_at).toLocaleDateString('he-IL') : 'לא ידוע'}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/gemach/${gemach.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => restoreGemach(gemach.id)}
                              >
                                <RefreshCcw className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => permanentDeleteGemach(gemach.id)}
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
    </div>
  );
};

export default AdminDashboard;
