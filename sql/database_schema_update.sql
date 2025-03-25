-- עדכון סכימה עבור פיצ'ר סל המחזור
-- מוסיף תמיכה במחיקה עם אפשרות שחזור לגמ"חים

-- הוספת עמודות is_deleted ו-deleted_at לטבלת הגמחים
ALTER TABLE gemachs
ADD COLUMN is_deleted BOOLEAN DEFAULT NULL,
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- אינדקס לשיפור ביצועי חיפוש לפי סטטוס מחיקה
CREATE INDEX idx_gemachs_is_deleted ON gemachs (is_deleted) WHERE is_deleted IS NOT NULL;

-- הוספת RLS פוליסות חדשות לתמיכה בסל המחזור
-- פוליסה: רק מנהלים יכולים לצפות בגמ"חים שנמחקו
ALTER POLICY view_gemachs ON gemachs
    USING (
        is_deleted IS NULL 
        OR 
        (is_deleted = TRUE AND auth.uid() IN (SELECT id FROM profiles WHERE is_admin = TRUE))
    );

-- פוליסה: רק מנהלים יכולים לערוך/לשחזר גמ"חים מחוקים
CREATE POLICY update_deleted_gemachs ON gemachs
    FOR UPDATE
    USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = TRUE))
    WITH CHECK (TRUE);

-- פוליסה: רק מנהלים יכולים למחוק לצמיתות גמ"חים
CREATE POLICY delete_gemachs ON gemachs
    FOR DELETE
    USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = TRUE));

-- פונקציית יוזר עבור העברת גמ"ח לסל המחזור
CREATE OR REPLACE FUNCTION move_gemach_to_trash(gemach_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    -- בדיקת הרשאות מנהל
    SELECT profiles.is_admin INTO is_admin 
    FROM profiles 
    WHERE id = auth.uid();
    
    IF is_admin IS NOT TRUE THEN
        RAISE EXCEPTION 'רק מנהלי מערכת רשאים להעביר גמ"חים לסל המחזור';
    END IF;
    
    -- העברה לסל המחזור
    UPDATE gemachs 
    SET 
        is_deleted = TRUE,
        deleted_at = NOW()
    WHERE id = gemach_id;
    
    RETURN FOUND;
END;
$$;

-- פונקציית יוזר עבור שחזור גמ"ח מסל המחזור
CREATE OR REPLACE FUNCTION restore_gemach_from_trash(gemach_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    -- בדיקת הרשאות מנהל
    SELECT profiles.is_admin INTO is_admin 
    FROM profiles 
    WHERE id = auth.uid();
    
    IF is_admin IS NOT TRUE THEN
        RAISE EXCEPTION 'רק מנהלי מערכת רשאים לשחזר גמ"חים מסל המחזור';
    END IF;
    
    -- שחזור מסל המחזור
    UPDATE gemachs 
    SET 
        is_deleted = NULL,
        deleted_at = NULL
    WHERE id = gemach_id;
    
    RETURN FOUND;
END;
$$; 