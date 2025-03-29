
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "@/contexts/AuthContext";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import Dashboard from "@/pages/Dashboard";
import GemachDetail from "@/pages/GemachDetail";
import EditGemach from "@/pages/EditGemach";
import RegisterGemach from "@/pages/RegisterGemach";
import RegistrationSuccess from "@/pages/RegistrationSuccess";
import About from "@/pages/About";
import "./App.css";
import { ReactNode, useEffect, useState } from "react";

const queryClient = new QueryClient();

// הגנה על נתיבים פרטיים - רק למשתמשים מחוברים
const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // נמתין לבדיקת האימות לפני שנחליט אם להציג את התוכן או להפנות להתחברות
    const checkAuth = async () => {
      if (!loading) {
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, [loading]);
  
  if (isChecking) {
    // מציג מסך טעינה עד שהאימות נבדק
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Main routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/gemach/:id" element={<GemachDetail />} />
            <Route path="/gemach/:id/edit" element={
              <PrivateRoute>
                <EditGemach />
              </PrivateRoute>
            } />
            <Route path="/register-gemach" element={
              <PrivateRoute>
                <RegisterGemach />
              </PrivateRoute>
            } />
            <Route path="/registration-success" element={<RegistrationSuccess />} />
            <Route path="/about" element={<About />} />
            
            {/* Redirect old admin path to dashboard */}
            <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
            
            {/* Fallback route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
