import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Clock, Link, Image, Edit, Trash2, AlertTriangle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Loader2 } from 'lucide-react';

interface Gemach {
  id: string;
  name: string;
  description?: string;
  category?: string;
  address?: string;
  neighborhood?: string;
  phone?: string;
  hours?: string;
  image_url?: string;
  owner_id: string;
  is_approved: boolean | null;
  created_at: string;
}

const GemachDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [gemach, setGemach] = useState<Gemach | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedGemach, setEditedGemach] = useState<Gemach | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא נמצא גמ״ח",
      });
      navigate('/dashboard');
      return;
    }

    const fetchGemach = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('gemachs')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        setGemach(data as Gemach);
        setEditedGemach(data as Gemach);
      } catch (error: any) {
        console.error('Error fetching gemach:', error);
        toast({
          variant: "destructive",
          title: "שגיאה",
          description: error.message || "אירעה שגיאה בטעינת הגמ״ח",
        });
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGemach();
  }, [id, navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedGemach(gemach);
  };

  const handleSaveEdit = async () => {
    if (!editedGemach) return;

    try {
      setIsProcessing(true);
      const { error } = await supabase
        .from('gemachs')
        .update({
          name: editedGemach.name,
          description: editedGemach.description,
          category: editedGemach.category,
          address: editedGemach.address,
          neighborhood: editedGemach.neighborhood,
          phone: editedGemach.phone,
          hours: editedGemach.hours,
        })
        .eq('id', id);

      if (error) throw error;

      setGemach(editedGemach);
      setIsEditing(false);
      toast({
        title: "הגמ״ח עודכן בהצלחה",
        description: "הגמ״ח עודכן בהצלחה",
      });
    } catch (error: any) {
      console.error('Error updating gemach:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: error.message || "אירעה שגיאה בעדכון הגמ״ח",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    if (!window.confirm('האם אתה בטוח שברצונך למחוק את הגמ״ח הזה? פעולה זו היא בלתי הפיכה.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('gemachs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "הגמ״ח נמחק בהצלחה",
        description: "הגמ״ח נמחק בהצלחה",
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error deleting gemach:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: error.message || "אירעה שגיאה במחיקת הגמ״ח",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-sky-600" />
            <p className="text-lg">טוען את פרטי הגמ״ח...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!gemach) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <p className="text-lg">הגמ״ח לא נמצא</p>
            <Button onClick={() => navigate('/dashboard')}>חזרה ללוח הבקרה</Button>
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
        <div className="container mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>{gemach.name}</CardTitle>
              <CardDescription>פרטים ומידע על הגמ״ח</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">שם הגמ״ח</Label>
                    <Input
                      id="name"
                      value={editedGemach?.name || ''}
                      onChange={(e) => setEditedGemach({ ...editedGemach, name: e.target.value } as Gemach)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">תיאור</Label>
                    <Textarea
                      id="description"
                      value={editedGemach?.description || ''}
                      onChange={(e) => setEditedGemach({ ...editedGemach, description: e.target.value } as Gemach)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">קטגוריה</Label>
                      <Select
                        value={editedGemach?.category || ''}
                        onValueChange={(value) => setEditedGemach({ ...editedGemach, category: value } as Gemach)}
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
                        value={editedGemach?.neighborhood || ''}
                        onValueChange={(value) => setEditedGemach({ ...editedGemach, neighborhood: value } as Gemach)}
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
                      value={editedGemach?.address || ''}
                      onChange={(e) => setEditedGemach({ ...editedGemach, address: e.target.value } as Gemach)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">טלפון</Label>
                    <Input
                      id="phone"
                      value={editedGemach?.phone || ''}
                      onChange={(e) => setEditedGemach({ ...editedGemach, phone: e.target.value } as Gemach)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hours">שעות פעילות</Label>
                    <Input
                      id="hours"
                      value={editedGemach?.hours || ''}
                      onChange={(e) => setEditedGemach({ ...editedGemach, hours: e.target.value } as Gemach)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={handleCancelEdit}>
                      ביטול
                    </Button>
                    <Button onClick={handleSaveEdit} disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      שמור
                    </Button>
                  </div>
                }
              ) : (
                <>
                  {gemach.description && (
                    <div className="space-y-2">
                      <h4 className="font-medium">תיאור</h4>
                      <p className="text-gray-700">{gemach.description}</p>
                    </div>
                  )}

                  {gemach.category && (
                    <div className="flex items-center gap-2">
                      <Link className="h-4 w-4 text-gray-500" />
                      <span>קטגוריה: {gemach.category}</span>
                    </div>
                  )}

                  {gemach.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{gemach.address}</span>
                    </div>
                  )}

                  {gemach.neighborhood && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>שכונה: {gemach.neighborhood}</span>
                    </div>
                  )}

                  {gemach.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{gemach.phone}</span>
                    </div>
                  )}

                  {gemach.hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>שעות פעילות: {gemach.hours}</span>
                    </div>
                  )}

                  {gemach.image_url && (
                    <div className="space-y-2">
                      <h4 className="font-medium">תמונה</h4>
                      <img src={gemach.image_url} alt={gemach.name} className="rounded-md" />
                    </div>
                  )}
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {isEditing ? (
                <Button variant="ghost" onClick={handleCancelEdit}>
                  ביטול
                </Button>
              ) : (
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  חזרה
                </Button>
              )}
              {user?.id === gemach.owner_id || isAdmin ? (
                <div className="flex gap-2">
                  {!isEditing && (
                    <Button variant="secondary" onClick={handleEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      ערוך
                    </Button>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        מחק
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>מחיקת גמ״ח</DialogTitle>
                        <DialogDescription>
                          האם אתה בטוח שברצונך למחוק את הגמ״ח? פעולה זו אינה ניתנת לביטול.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="secondary" disabled={isDeleting}>
                            ביטול
                          </Button>
                        </DialogClose>
                        <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          מחק
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : null}
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GemachDetail;
