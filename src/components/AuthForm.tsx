
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FaGoogle } from 'react-icons/fa';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success('התחברת בהצלחה!');
    } catch (error: any) {
      toast.error(error.message || 'שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      toast.success('הרשמה בוצעה בהצלחה! בדוק את המייל שלך להשלמת התהליך.');
    } catch (error: any) {
      toast.error(error.message || 'שגיאה בהרשמה');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'שגיאה בהתחברות עם Google');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4 py-8">
      <Card className="w-full max-w-md animate-scale-in glass-effect">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">ברוכים הבאים למרכז הגמ"חים</CardTitle>
          <CardDescription>התחבר או הירשם כדי להמשיך</CardDescription>
        </CardHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">התחברות</TabsTrigger>
            <TabsTrigger value="register">הרשמה</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleEmailSignIn}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">אימייל</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="password">סיסמה</Label>
                    <a href="#" className="text-xs text-primary hover:underline">
                      שכחת סיסמה?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'מתחבר...' : 'התחבר'}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      או המשך עם
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                >
                  <FaGoogle className="ml-2" />
                  Google
                </Button>
              </CardContent>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleEmailSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">אימייל</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">סיסמה</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'נרשם...' : 'הרשם'}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      או המשך עם
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                >
                  <FaGoogle className="ml-2" />
                  Google
                </Button>
              </CardContent>
            </form>
          </TabsContent>
        </Tabs>
        <CardFooter className="flex flex-col space-y-2 mt-2">
          <p className="text-xs text-center text-muted-foreground">
            בהרשמה והתחברות אתה מסכים ל
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              תנאי השימוש
            </a>
            {' '}ו
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              מדיניות הפרטיות
            </a>
            {' '}שלנו.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
