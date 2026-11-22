-- Non-sensitive specialization reference data only. Safe to rerun.
INSERT INTO specializations(name_ar) VALUES
('هندسة الحاسوب'),('هندسة الاتصالات'),('هندسة الشبكات'),('تكنولوجيا المعلومات'),('التمريض'),('الطب البشري'),('الصيدلة'),('المحاسبة'),('إدارة الأعمال'),('علوم الحاسوب')
ON CONFLICT (name_ar) DO NOTHING;
