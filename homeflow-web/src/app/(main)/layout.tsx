import AppHeader from '@/components/layout/AppHeader';
import AppSidebar from '@/components/layout/AppSidebar';
import BottomNav from '@/components/layout/BottomNav';
import { auth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { redirect } from 'next/navigation';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const user = {
    firstName: session.user.firstName,
    lastName: session.user.lastName,
    role: session.user.role,
    avatarUrl: session.user.avatarUrl,
  };

  const isCustomer = user.role === 'CUSTOMER';

  return (
    <div
      className={cn(
        'min-h-screen',
        // tint อ่อนๆ ให้การ์ดสีขาวของ customer แยกออกจากพื้นหลัง
        isCustomer ? 'bg-surface-container-low' : 'bg-background'
      )}
    >
      {!isCustomer && <AppSidebar user={user} />}
      <BottomNav role={user.role} />
      <div className={isCustomer ? '' : 'lg:ml-64'}>
        <AppHeader
          title=''
          user={user}
          hasSidebar={!isCustomer}
          showNav={isCustomer}
        />
        <main
          className={cn(
            'max-w-350 p-gutter-mobile lg:p-gutter-desktop',
            isCustomer && 'mx-auto',
            // เว้นที่ให้แถบเมนูล่างบนจอเล็ก ไม่ให้ทับเนื้อหา (ทุก role มีแถบล่าง)
            'pb-24 lg:pb-gutter-desktop'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
