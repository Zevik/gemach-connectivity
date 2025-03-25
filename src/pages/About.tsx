import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Container } from '@/components/Container';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 bg-gray-50">
        <Container className="max-w-4xl">
          <div className="text-right">
            <h1 className="text-3xl font-bold mb-8 text-sky-700">אודות מרכז הגמ״חים של ירושלים</h1>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-sky-600">המשימה שלנו</h2>
              <p className="mb-4 text-lg leading-relaxed">
                מרכז הגמ״חים של ירושלים הוקם במטרה לחבר בין אנשים הזקוקים לשירותי גמ״ח (גמילות חסדים) לבין מפעילי הגמ״חים בירושלים וסביבותיה. 
                אנו מאמינים שבעזרת טכנולוגיה מודרנית ניתן להנגיש את שירותי הגמ״חים לכל דורש ולהקל על מציאת הגמ״ח המתאים במהירות וביעילות.
              </p>
              <p className="text-lg leading-relaxed">
                הפלטפורמה שלנו מאפשרת חיפוש מהיר של גמ״חים לפי קטגוריות, שכונות, ופרמטרים נוספים, כך שכל אחד יוכל למצוא בקלות את הגמ״ח שהוא צריך בדיוק ברגע שהוא זקוק לו.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-sky-600">למה מרכז הגמ״חים של ירושלים?</h2>
              <ul className="space-y-3 text-lg">
                <li className="flex items-start">
                  <span className="inline-block ml-2 mt-1 text-sky-500 font-bold">•</span>
                  <span><strong>נגישות</strong> - מידע מרוכז ועדכני על כל הגמ״חים באזור שלך</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block ml-2 mt-1 text-sky-500 font-bold">•</span>
                  <span><strong>פשטות</strong> - ממשק ידידותי וקל לשימוש לחיפוש הגמ״ח המתאים</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block ml-2 mt-1 text-sky-500 font-bold">•</span>
                  <span><strong>קהילתיות</strong> - חיבור בין אנשים בקהילה בזמן אמת</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block ml-2 mt-1 text-sky-500 font-bold">•</span>
                  <span><strong>עדכניות</strong> - מידע מעודכן על זמני פעילות, פרטי קשר ומלאי</span>
                </li>
              </ul>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-sky-600">מה זה גמ״ח?</h2>
              <p className="mb-4 text-lg leading-relaxed">
                גמ״ח (גמילות חסדים) הוא שירות קהילתי ללא מטרות רווח, המציע השאלה או תרומה של מוצרים או שירותים. 
                מקור המושג בתורה ומהווה אחד מעמודי התווך של חסד בקהילה היהודית.
              </p>
              <p className="text-lg leading-relaxed">
                גמ״חים יכולים להיות מכל סוג - מהשאלת ציוד רפואי, כלי עבודה, וציוד לתינוקות, ועד להשאלת שמלות כלה, כלים לאירועים והוראת חסד.
                בישראל בכלל ובירושלים בפרט, רשת הגמ״חים היא אחת מהמפותחות בעולם ומהווה חלק בלתי נפרד מהחיים הקהילתיים.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-4 text-sky-600">צור קשר</h2>
              <p className="text-lg leading-relaxed">
                יש לכם שאלות, הצעות או רוצים לעדכן פרטים של גמ״ח? נשמח לשמוע מכם!
              </p>
              <p className="text-lg">
                <strong className="ml-2">מייל:</strong> 
                <a href="mailto:contact@gemachim.netlify.app" className="text-sky-600 hover:underline">contact@gemachim.netlify.app</a>
              </p>
              <p className="text-lg">
                <strong className="ml-2">טלפון:</strong> 02-123-4567
              </p>
            </section>
          </div>
        </Container>
      </main>
      
      <Footer />
    </div>
  );
} 