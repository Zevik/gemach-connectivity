
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();

  // אם המשתמש לא מחובר, הפנה אותו לדף ההתחברות
  if (!isLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">לוח הבקרה שלי</h1>
        <Button onClick={signOut} variant="outline">התנתק</Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>ברוך הבא!</CardTitle>
            <CardDescription>
              {user.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>כאן תוכל לנהל את הגמ"חים שלך ולצפות בסטטיסטיקות.</p>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle>הגמ"חים שלי</CardTitle>
            <CardDescription>נהל את הגמ"חים שרשמת</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate('/register-gemach')}>הוסף גמ"ח חדש</Button>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle>הפעילות שלי</CardTitle>
            <CardDescription>סיכום של הפעילות האחרונה</CardDescription>
          </CardHeader>
          <CardContent>
            <p>אין פעילות אחרונה להצגה.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
