
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import {
  PencilIcon,
  Trash2Icon,
  EyeIcon,
  CheckIcon,
  XIcon,
  RefreshCcw,
  Star,
  StarOff,
  Loader2,
} from "lucide-react";

// הוספת פונקציה להשגת URL של תמונה
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

    // השגת ה-URL הציבורי של התמונה
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(imageData.storage_path);

    return data.publicUrl;
  } catch (error) {
    console.error("Error fetching gemach image:", error);
    return null;
  }
};

const Dashboard = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [gemachs, setGemachs] = useState<any[]>([]);
  const [pendingGemachs, setPendingGemachs] = useState<any[]>([]);
  const [approvedGemachs, setApprovedGemachs] = useState<any[]>([]);
  const [featuredGemachs, setFeaturedGemachs] = useState<any[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteGemachId, setDeleteGemachId] = useState<string | null>(null);
  
  // Loading states for each tab
  const [isLoadingMyGemachs, setIsLoadingMyGemachs] = useState(true);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [isLoadingApproved, setIsLoadingApproved] = useState(true);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  
  // Active tab
  const [activeTab, setActiveTab] = useState('my-gemachs');

  // שינוי פונקציה לטעינת נתונים כדי לטפל בתמונות
  const loadData = async () => {
    try {
      if (!user) return;

      // טעינת הגמחים של המשתמש הנוכחי
      setIsLoadingMyGemachs(true);
      const { data: userGemachs, error: userError } = await supabase
        .from("gemachs")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (userError) {
        console.error("Error fetching user gemachs:", userError);
        return;
      }

      // עיבוד הגמחים של המשתמש עם תמונות
      const processedUserGemachs = await Promise.all(
        userGemachs.map(async (gemach) => {
          // קביעת סטטוס מדויק
          let status;
          if (gemach.is_approved === true) {
            status = 'approved';
          } else if (gemach.is_approved === false) {
            status = 'rejected';
          } else {
            status = 'pending';
          }

          // השגת URL של תמונה
          const imageUrl = await getGemachImageUrl(gemach.id);

          return {
            ...gemach,
            status,
            imageUrl
          };
        })
      );

      setGemachs(processedUserGemachs);
      setIsLoadingMyGemachs(false);
      
      // טעינת נתוני מנהל אם המשתמש הוא מנהל
      if (isAdmin) {
        await loadAdminData();
      }
    } catch (error) {
      console.error("Error in loadData:", error);
      toast({
        title: "שגיאה בטעינת נתונים",
        description: "אירעה שגיאה בעת טעינת הגמ״חים שלך. אנא נסה שנית.",
        variant: "destructive",
      });
      setIsLoadingMyGemachs(false);
    }
  };
  
  // פונקציה חדשה לטעינת נתוני מנהל
  const loadAdminData = async () => {
    try {
      // טעינת גמחים שממתינים לאישור
      setIsLoadingPending(true);
      const { data: pendingData, error: pendingError } = await supabase
        .from("gemachs")
        .select("*")
        .or('is_approved.is.null,is_approved.eq.false')
        .order("created_at", { ascending: false });

      if (pendingError) {
        console.error("Error fetching pending gemachs:", pendingError);
      } else {
        const processedPendingGemachs = await Promise.all(
          pendingData.map(async (gemach) => {
            const imageUrl = await getGemachImageUrl(gemach.id);
            return {
              ...gemach,
              imageUrl
            };
          })
        );
        setPendingGemachs(processedPendingGemachs);
      }
      setIsLoadingPending(false);
      
      // טעינת גמחים מאושרים
      setIsLoadingApproved(true);
      const { data: approvedData, error: approvedError } = await supabase
        .from("gemachs")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (approvedError) {
        console.error("Error fetching approved gemachs:", approvedError);
      } else {
        const processedApprovedGemachs = await Promise.all(
          approvedData.map(async (gemach) => {
            const imageUrl = await getGemachImageUrl(gemach.id);
            return {
              ...gemach,
              imageUrl
            };
          })
        );
        setApprovedGemachs(processedApprovedGemachs);
      }
      setIsLoadingApproved(false);
      
      // טעינת גמחים מומלצים
      setIsLoadingFeatured(true);
      const { data: featuredData, error: featuredError } = await supabase
        .from("gemachs")
        .select("*")
        .eq("featured", true)
        .order("created_at", { ascending: false });

      if (featuredError) {
        console.error("Error fetching featured gemachs:", featuredError);
      } else {
        const processedFeaturedGemachs = await Promise.all(
          featuredData.map(async (gemach) => {
            const imageUrl = await getGemachImageUrl(gemach.id);
            return {
              ...gemach,
              imageUrl
            };
          })
        );
        setFeaturedGemachs(processedFeaturedGemachs);
      }
      setIsLoadingFeatured(false);
    } catch (error) {
      console.error("Error in loadAdminData:", error);
      setIsLoadingPending(false);
      setIsLoadingApproved(false);
      setIsLoadingFeatured(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      loadData();
    } else if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading]);

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from("gemachs")
        .update({ is_approved: true })
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast({
        title: "הגמ״ח אושר בהצלחה!",
        description: "הגמ״ח יופיע כעת בחיפושים ציבוריים",
      });

      loadData(); // רענון הנתונים
    } catch (error) {
      console.error("Error approving gemach:", error);
      toast({
        title: "שגיאה באישור הגמ״ח",
        description: "אירעה שגיאה בעת אישור הגמ״ח. אנא נסה שנית.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("gemachs")
        .update({ is_approved: false })
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast({
        title: "הגמ״ח נדחה",
        description: "הגמ״ח לא יופיע בחיפושים ציבוריים",
      });

      loadData(); // רענון הנתונים
    } catch (error) {
      console.error("Error rejecting gemach:", error);
      toast({
        title: "שגיאה בדחיית הגמ״ח",
        description: "אירעה שגיאה בעת דחיית הגמ״ח. אנא נסה שנית.",
        variant: "destructive",
      });
    }
  };
  
  const toggleFeatured = async (id: string, currentFeatured: boolean | null) => {
    try {
      const newFeaturedState = !currentFeatured;
      
      const { error } = await supabase
        .from("gemachs")
        .update({ featured: newFeaturedState })
        .eq("id", id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: newFeaturedState ? "הגמ״ח סומן כמומלץ" : "הגמ״ח הוסר מהמומלצים",
      });
      
      loadData(); // רענון הנתונים
    } catch (error) {
      console.error("Error updating featured status:", error);
      toast({
        title: "שגיאה בעדכון סטטוס מומלץ",
        description: "אירעה שגיאה בעת עדכון סטטוס המומלץ. אנא נסה שנית.",
        variant: "destructive",
      });
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
        title: "הגמ״ח נמחק בהצלחה",
        description: "הגמ״ח הוסר מהמערכת לצמיתות",
      });

      loadData(); // רענון הנתונים
    } catch (error) {
      console.error("Error deleting gemach:", error);
      toast({
        title: "שגיאה במחיקת הגמ״ח",
        description: "אירעה שגיאה בעת מחיקת הגמ״ח. אנא נסה שנית.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteGemachId(null);
    }
  };
  
  const refreshData = () => {
    loadData();
    toast({
      title: "הנתונים רועננו בהצלחה",
    });
  };

  const handleEditClick = (gemach: any) => {
    // במקום לפתוח דיאלוג עריכה, נעביר למסך עריכה מלא
    navigate(`/gemach/${gemach.id}/edit`);
  };
  
  // פונקציה לתצוגת כרטיס גמ״ח
  const renderGemachCard = (gemach: any, isAdmin: boolean = false) => {
    return (
      <Card key={gemach.id} className="overflow-hidden">
        {gemach.imageUrl && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={gemach.imageUrl}
              alt={gemach.name}
              className="w-full h-full object-cover"
            />
            {!isAdmin && (
              <div className="absolute top-3 right-3 bg-white rounded-full p-1">
                {gemach.status === 'approved' && (
                  <div className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                    אושר
                  </div>
                )}
                {gemach.status === 'rejected' && (
                  <div className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                    נדחה
                  </div>
                )}
                {gemach.status === 'pending' && (
                  <div className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                    ממתין לאישור
                  </div>
                )}
              </div>
            )}
            {isAdmin && gemach.featured && (
              <div className="absolute top-3 right-3">
                <div className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  מומלץ
                </div>
              </div>
            )}
          </div>
        )}
        {!gemach.imageUrl && (
          <div className="h-48 bg-gray-100 flex items-center justify-center relative">
            <p className="text-gray-500">אין תמונה זמינה</p>
            {!isAdmin && (
              <div className="absolute top-3 right-3">
                {gemach.status === 'approved' && (
                  <div className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                    אושר
                  </div>
                )}
                {gemach.status === 'rejected' && (
                  <div className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                    נדחה
                  </div>
                )}
                {gemach.status === 'pending' && (
                  <div className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                    ממתין לאישור
                  </div>
                )}
              </div>
            )}
            {isAdmin && gemach.featured && (
              <div className="absolute top-3 right-3">
                <div className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  מומלץ
                </div>
              </div>
            )}
          </div>
        )}
        <CardHeader>
          <CardTitle>{gemach.name}</CardTitle>
          <CardDescription>
            {gemach.category} | {gemach.neighborhood}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{gemach.description?.substring(0, 100)}...</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex space-x-2 space-x-reverse">
            {/* פעולות עריכה ומחיקה */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditClick(gemach)}
            >
              <PencilIcon className="h-4 w-4 ml-1" />
              עריכה
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-500 border-red-500 hover:bg-red-50"
              onClick={() => handleDeleteClick(gemach.id)}
            >
              <Trash2Icon className="h-4 w-4 ml-1" />
              מחיקה
            </Button>
          </div>
          
          {/* פעולות מנהל */}
          {isAdmin && activeTab === 'pending' && (
            <div className="flex space-x-2 space-x-reverse">
              <Button
                size="sm"
                variant="outline"
                className="text-green-500 border-green-500 hover:bg-green-50"
                onClick={() => handleApprove(gemach.id)}
              >
                <CheckIcon className="h-4 w-4 ml-1" />
                אישור
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-500 border-red-500 hover:bg-red-50"
                onClick={() => handleReject(gemach.id)}
              >
                <XIcon className="h-4 w-4 ml-1" />
                דחייה
              </Button>
            </div>
          )}
          
          {/* כפתור סימון כמומלץ */}
          {isAdmin && (activeTab === 'approved' || activeTab === 'featured') && (
            <Button
              size="sm"
              variant={gemach.featured ? "default" : "outline"}
              className={gemach.featured ? "bg-amber-500 hover:bg-amber-600" : ""}
              onClick={() => toggleFeatured(gemach.id, gemach.featured)}
            >
              {gemach.featured ? (
                <>
                  <StarOff className="h-4 w-4 ml-1" />
                  הסר מהמומלצים
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 ml-1" />
                  הוסף למומלצים
                </>
              )}
            </Button>
          )}
          
          {/* כפתור צפייה */}
          <Button
            size="sm"
            variant="ghost"
            asChild
          >
            <Link to={`/gemach/${gemach.id}`}>
              <EyeIcon className="h-4 w-4 ml-1" />
              צפייה
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // תצוגת תוכן לפי לשוניות
  const renderTabContent = () => {
    switch (activeTab) {
      case 'my-gemachs':
        return isLoadingMyGemachs ? (
          <div className="flex justify-center p-8">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="mt-4 text-gray-500">טוען גמ״חים...</span>
            </div>
          </div>
        ) : gemachs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gemachs.map((gemach) => renderGemachCard(gemach))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">לא נמצאו גמ״חים. הגיע הזמן לרשום את הגמ״ח הראשון שלך!</p>
            <Button asChild>
              <Link to="/register-gemach">רישום גמ״ח חדש</Link>
            </Button>
          </div>
        );
        
      case 'pending':
        return isLoadingPending ? (
          <div className="flex justify-center p-8">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="mt-4 text-gray-500">טוען גמ״חים ממתינים לאישור...</span>
            </div>
          </div>
        ) : pendingGemachs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingGemachs.map((gemach) => renderGemachCard(gemach, true))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">אין גמ״חים הממתינים לאישור כרגע.</p>
          </div>
        );
        
      case 'approved':
        return isLoadingApproved ? (
          <div className="flex justify-center p-8">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="mt-4 text-gray-500">טוען גמ״חים מאושרים...</span>
            </div>
          </div>
        ) : approvedGemachs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedGemachs.map((gemach) => renderGemachCard(gemach, true))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">אין גמ״חים מאושרים במערכת.</p>
          </div>
        );
        
      case 'featured':
        return isLoadingFeatured ? (
          <div className="flex justify-center p-8">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="mt-4 text-gray-500">טוען גמ״חים מומלצים...</span>
            </div>
          </div>
        ) : featuredGemachs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredGemachs.map((gemach) => renderGemachCard(gemach, true))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">אין גמ״חים מומלצים כרגע.</p>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">לוח הבקרה שלי</h1>
          <div className="flex gap-2">
            <Button onClick={refreshData} variant="outline" className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              רענון נתונים
            </Button>
            <Button asChild>
              <Link to="/register-gemach">רישום גמ״ח חדש</Link>
            </Button>
          </div>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="my-gemachs">הגמ״חים שלי</TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="pending">ממתינים לאישור</TabsTrigger>
                <TabsTrigger value="approved">גמ״חים מאושרים</TabsTrigger>
                <TabsTrigger value="featured">גמ״חים מומלצים</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value={activeTab}>
            {renderTabContent()}
          </TabsContent>
        </Tabs>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>אישור מחיקת גמ״ח</DialogTitle>
              <DialogDescription>
                האם אתה בטוח שברצונך למחוק את הגמ״ח? פעולה זו לא ניתנת לביטול.
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

export default Dashboard;
