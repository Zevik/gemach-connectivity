
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative px-6 flex flex-col items-center justify-center min-h-[90vh] text-center">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 to-white"></div>
        
        <div className="animate-fade-in max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-l from-primary to-blue-700">
            מרכז הגמ"חים של ירושלים
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-700">
            הפלטפורמה המקיפה ביותר למציאת שירותי גמילות חסדים בירושלים והסביבה
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <Button
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="transition-all hover:scale-105"
              >
                לוח הבקרה שלי
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="transition-all hover:scale-105"
              >
                התחברות / הרשמה
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/gemachs')}
              className="transition-all hover:scale-105"
            >
              חיפוש גמ"חים
            </Button>
          </div>
        </div>
        
        <div className="absolute bottom-10 animate-bounce">
          <div className="w-8 h-8 border-b-2 border-r-2 border-primary transform rotate-45"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">איך זה עובד?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg animate-scale-in">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">מצא גמ"ח</h3>
              <p>חפש לפי קטגוריה, שכונה או מילות מפתח למציאת הגמ"ח המתאים לצרכים שלך.</p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg animate-scale-in" style={{ animationDelay: '150ms' }}>
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">צור קשר</h3>
              <p>קבל את כל פרטי הקשר, שעות הפעילות והמיקום המדויק של הגמ"ח.</p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg animate-scale-in" style={{ animationDelay: '300ms' }}>
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">נהל את הגמ"ח שלך</h3>
              <p>בעל גמ"ח? הירשם ופרסם את הגמ"ח שלך כדי להגיע לקהל רחב יותר.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-100 to-blue-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">רוצים לרשום את הגמ"ח שלכם?</h2>
          <p className="text-xl mb-8">הצטרפו אלינו והגדילו את החשיפה של הגמ"ח שלכם. התהליך פשוט ומהיר!</p>
          <Button
            size="lg"
            onClick={() => navigate(user ? '/dashboard' : '/auth')}
            className="transition-all hover:scale-105"
          >
            הירשמו עכשיו
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
