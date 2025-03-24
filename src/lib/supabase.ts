
import { createClient } from '@supabase/supabase-js';

// ערכים אלה צריכים להיות מוחלפים בערכים האמיתיים מהפרויקט שלך ב-Supabase
// כרגע אלה ערכים זמניים למטרות פיתוח
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
