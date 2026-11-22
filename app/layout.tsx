import './styles.css';
export const metadata = { title: 'نظام التوظيف | الهلال الأحمر الفلسطيني', description: 'بوابة التوظيف وإدارة طلبات المتقدمين' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="ar" dir="rtl"><body>{children}</body></html>; }
