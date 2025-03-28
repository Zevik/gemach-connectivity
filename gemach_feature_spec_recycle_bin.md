# מאפיין סל המחזור למערכת הגמ"חים

## 1. סקירה כללית

מערכת סל המחזור מאפשרת למנהלי המערכת לנהל גמ"חים באופן יעיל יותר תוך שמירה על היסטוריית פעולות מחיקה. במקום מחיקה מוחלטת, גמ"חים מועברים תחילה לסל מחזור המאפשר שחזור במקרה הצורך או מחיקה סופית.

## 2. מודל נתונים

למודל הנתונים של טבלת `gemachs` נוספו שדות חדשים:

```sql
ALTER TABLE gemachs
ADD COLUMN is_deleted BOOLEAN DEFAULT NULL,
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
```

כאשר:
- `is_deleted` - סטטוס המציין אם הגמ"ח נמצא בסל המחזור (`true`) או לא (`null` או `false`)
- `deleted_at` - תאריך ושעת העברת הגמ"ח לסל המחזור

## 3. פונקציונליות סל המחזור

### 3.1 העברת גמ"ח לסל המחזור
- מנהלי מערכת יכולים להעביר גמ"ח לסל המחזור מכל אחד מממשקי הניהול:
  - מדף פרטי הגמ"ח
  - מלוח הבקרה המנהלי

### 3.2 דף ניהול סל המחזור
- טאב ייעודי בדף ניהול המערכת עבור סל המחזור
- הצגת כל הגמ"חים שהועברו לסל המחזור עם פרטי בסיס ותאריך המחיקה
- פעולות אפשריות:
  - צפייה בפרטי הגמ"ח
  - שחזור הגמ"ח
  - מחיקה סופית של הגמ"ח

### 3.3 שחזור גמ"ח
- אפשרות לשחזר גמ"ח שהועבר לסל המחזור
- עדכון שדות `is_deleted` ו-`deleted_at` ל-`null`
- הגמ"ח יחזור למצבו הקודם (מאושר או ממתין לאישור)

### 3.4 מחיקה סופית
- אפשרות למחוק לצמיתות גמ"ח מסל המחזור (מחיקה פיזית מהמסד נתונים)
- פעולה זו אינה ניתנת לביטול ודורשת אישור נוסף

## 4. השפעה על מערכות קיימות

### 4.1 תצוגת הגמ"חים בדף הראשי
- נוספה תנאי ל-WHERE בשאילתא הראשית: `is_deleted IS NULL`
- הגמ"חים בסל המחזור לא יופיעו בתוצאות החיפוש הציבוריות

### 4.2 תצוגת פרטי גמ"ח
- הוספת אפשרות למנהלי מערכת להעביר גמ"ח מאושר לסל המחזור
- אזור פעולות ניהול חדש מוצג למנהלים בלבד עבור גמ"חים מאושרים

### 4.3 לוח בקרה למנהל מערכת
- לוח הבקרה שודרג עם מערכת טאבים הכוללת:
  - גמ"חים הממתינים לאישור
  - גמ"חים מאושרים
  - סל מחזור
  
## 5. התממשקות עם המשתמש

### 5.1 תצוגות
- אזור ייעודי לסל המחזור בממשק הניהול
- אזהרות מתאימות לפני העברה לסל המחזור או מחיקה סופית
- חיווי ויזואלי מתאים לגמ"חים בסל המחזור (אפקט opacity מופחת)

### 5.2 חוויית משתמש
- אישור נדרש לפני העברה לסל המחזור
- אישור נוסף נדרש לפני מחיקה סופית
- הודעות התראה ברורות לגבי השלכות הפעולות

## 6. סיכום

תכונת סל המחזור מוסיפה שכבת אבטחה נוספת לניהול גמ"חים, מפחיתה את הסיכון למחיקה בשוגג, ומספקת יכולת שחזור במידת הצורך. מנהלי המערכת נהנים מניהול מסודר יותר של תהליך המחיקה, עם שמירה על היסטוריית פעולות והגנה על נתוני המערכת. 