import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, MapPin, Phone, Clock, Link, Facebook, Loader2, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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

interface Gemach {
  id: string;
  name: string;
  description?: string;
  category?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  phone?: string;
  hours?: string;
  website_url?: string;
  facebook_url?: string;
  email?: string;
  has_fee?: boolean;
  fee_details?: string;
  location_instructions?: string;
  lat?: number;
  lng?: number;
  is_approved?: boolean;
  manager_phone?: string;
}

const GemachDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gemach, setGemach] = useState<Gemach | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editedGemach, setEditedGemach] = useState<Gemach | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      console.error("Gemach ID is missing.");
      return;
    }

    const fetchGemach = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('gemachs')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error("Error fetching gemach:", error);
          setIsNotFound(true);
        }

        if (data) {
          setGemach(data);
        } else {
          setIsNotFound(true);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setIsNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGemach();
  }, [id]);

  const handleEditClick = () => {
    if (gemach) {
      setEditedGemach({ ...gemach });
      setIsEditOpen(true);
    }
  };

  const handleSaveClick = async () => {
    if (!editedGemach) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('gemachs')
        .update(editedGemach)
        .eq('id', id);

      if (error) {
        console.error("Error updating gemach:", error);
        toast({
          variant: "destructive",
          title: "שגיאה בעדכון הגמ\"ח",
          description: "אירעה שגיאה בעדכון פרטי הגמ\"ח. אנא נסה שוב מאוחר יותר.",
        });
      } else {
        setGemach(editedGemach);
        toast({
          title: "הגמ\"ח עודכן בהצלחה",
          description: "פרטי הגמ\"ח עודכנו בהצלחה.",
        });
        setIsEditOpen(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        variant: "destructive",
        title: "שגיאה לא צפויה",
        description: "אירעה שגיאה לא צפויה. אנא נסה שוב מאוחר יותר.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">גמ&quot;ח לא נמצא</h2>
        <p className="text-gray-600">הגמ&quot;ח שחיפשת לא קיים או לא אושר על ידי מנהל.</p>
        <Button onClick={() => navigate('/')} className="mt-4">חזרה לדף הבית</Button>
      </div>
    );
  }

  const isApproved = gemach?.is_approved;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{gemach?.name}</CardTitle>
            <CardDescription>{gemach?.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isApproved ? (
              <Badge variant="outline">מאושר</Badge>
            ) : (
              <Badge variant="destructive">לא מאושר</Badge>
            )}

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{gemach?.address}, {gemach?.neighborhood}, {gemach?.city}</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{gemach?.phone}</span>
            </div>

            {gemach?.hours && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{gemach?.hours}</span>
              </div>
            )}

            {gemach?.website_url && (
              <div className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                <a href={gemach.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  אתר אינטרנט
                </a>
              </div>
            )}

            {gemach?.facebook_url && (
              <div className="flex items-center gap-2">
                <Facebook className="h-4 w-4" />
                <a href={gemach.facebook_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  דף פייסבוק
                </a>
              </div>
            )}

            {gemach?.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{gemach.email}</span>
              </div>
            )}

            {gemach?.has_fee && (
              <div>
                <p>
                  <strong>עמלה:</strong> כן
                </p>
                {gemach?.fee_details && <p><strong>פרטי עמלה:</strong> {gemach.fee_details}</p>}
              </div>
            )}

            {gemach?.location_instructions && (
              <div>
                <p>
                  <strong>הוראות הגעה:</strong> {gemach.location_instructions}
                </p>
              </div>
            )}

            {user && (
              <Button onClick={handleEditClick} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                ערוך גמ&quot;ח
              </Button>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>עריכת גמ&quot;ח</DialogTitle>
            <DialogDescription>
              ערוך את פרטי הגמ&quot;ח שלך. לחץ על שמור לאישור השינויים.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">שם הגמ&quot;ח</Label>
              <Input
                id="name"
                value={editedGemach?.name || ""}
                onChange={(e) => setEditedGemach({ ...editedGemach, name: e.target.value } as Gemach)}
              />
            </div>
            <div>
              <Label htmlFor="description">תיאור</Label>
              <Textarea
                id="description"
                value={editedGemach?.description || ""}
                onChange={(e) => setEditedGemach({ ...editedGemach, description: e.target.value } as Gemach)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">קטגוריה</Label>
                <Select
                  value={editedGemach?.category || ""}
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
                  value={editedGemach?.neighborhood || ""}
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
                value={editedGemach?.address || ""}
                onChange={(e) => setEditedGemach({ ...editedGemach, address: e.target.value } as Gemach)}
              />
            </div>
            <div>
              <Label htmlFor="phone">טלפון</Label>
              <Input
                id="phone"
                value={editedGemach?.phone || ""}
                onChange={(e) => setEditedGemach({ ...editedGemach, phone: e.target.value } as Gemach)}
              />
            </div>
            <div>
              <Label htmlFor="hours">שעות פעילות</Label>
              <Input
                id="hours"
                value={editedGemach?.hours || ""}
                onChange={(e) => setEditedGemach({ ...editedGemach, hours: e.target.value } as Gemach)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving}>
              ביטול
            </Button>
            <Button onClick={handleSaveClick} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              שמור שינויים
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GemachDetail;
