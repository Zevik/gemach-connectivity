import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: 'אימייל לא תקין' }),
  password: z.string().min(6, { message: 'סיסמה חייבת להיות לפחות 6 תווים' }),
});

// Registration form schema
const registrationSchema = z.object({
  email: z.string().email({ message: 'אימייל לא תקין' }),
  password: z.string().min(6, { message: 'סיסמה חייבת להיות לפחות 6 תווים' }),
  confirmPassword: z.string().min(6, { message: 'סיסמה חייבת להיות לפחות 6 תווים' }),
  fullName: z.string().min(2, { message: 'שם מלא נדרש' }),
  phone: z.string().min(9, { message: 'מספר טלפון לא תקין' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "הסיסמאות אינן תואמות",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegistrationFormValues = z.infer<typeof registrationSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const { login, register: registerUser, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Registration form
  const registrationForm = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
    },
  });

  // Handle login form submission
  const onLoginSubmit = async (values: LoginFormValues) => {
    try {
      setIsLoading(true);
      setError('');
      await login(values.email, values.password);
      navigate('/dashboard');
    } catch (err) {
      setError('התחברות נכשלה. אנא בדוק את הפרטים שלך ונסה שוב.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration form submission
  const onRegisterSubmit = async (values: RegistrationFormValues) => {
    try {
      setIsLoading(true);
      setError('');
      await registerUser(values.email, values.password, values.fullName);
      navigate('/dashboard');
    } catch (err) {
      setError('הרשמה נכשלה. ייתכן שהאימייל כבר בשימוש או שיש שגיאה אחרת.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setError('');
      await loginWithGoogle();
      // OAuth will handle redirection
    } catch (err) {
      setError('התחברות עם גוגל נכשלה. אנא נסה שוב מאוחר יותר.');
      console.error(err);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-md">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">התחברות</TabsTrigger>
              <TabsTrigger value="register">הרשמה</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-center">התחברות</CardTitle>
                  <CardDescription className="text-center">
                    התחבר למערכת כדי לנהל את הגמ״חים שלך
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>אימייל</FormLabel>
                            <FormControl>
                              <Input placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>סיסמה</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="******" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                      
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'מתחבר...' : 'התחבר'}
                      </Button>
                      
                      <div className="flex items-center my-4">
                        <Separator className="flex-grow" />
                        <span className="px-3 text-gray-500 text-sm">או</span>
                        <Separator className="flex-grow" />
                      </div>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full flex items-center justify-center gap-2"
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                      >
                        {googleLoading ? (
                          'מתחבר...'
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"></path>
                                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"></path>
                                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"></path>
                                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"></path>
                              </g>
                            </svg>
                            התחבר עם גוגל
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Registration Form with similar Google button */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-center">הרשמה</CardTitle>
                  <CardDescription className="text-center">
                    צור חשבון חדש כדי להוסיף ולנהל גמ״חים
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registrationForm}>
                    <form onSubmit={registrationForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registrationForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>שם מלא</FormLabel>
                            <FormControl>
                              <Input placeholder="ישראל ישראלי" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registrationForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>אימייל</FormLabel>
                            <FormControl>
                              <Input placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registrationForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>טלפון</FormLabel>
                            <FormControl>
                              <Input placeholder="05X-XXX-XXXX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registrationForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>סיסמה</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="******" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registrationForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>אימות סיסמה</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="******" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                      
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'נרשם...' : 'הרשם'}
                      </Button>
                      
                      <div className="flex items-center my-4">
                        <Separator className="flex-grow" />
                        <span className="px-3 text-gray-500 text-sm">או</span>
                        <Separator className="flex-grow" />
                      </div>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full flex items-center justify-center gap-2"
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                      >
                        {googleLoading ? (
                          'מתחבר...'
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"></path>
                                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"></path>
                                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"></path>
                                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"></path>
                              </g>
                            </svg>
                            הרשם עם גוגל
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;
