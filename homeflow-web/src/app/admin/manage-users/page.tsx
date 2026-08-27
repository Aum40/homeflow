import UserTable from '@/components/features/admin/UserTable';
import { auth } from '@/lib/auth';
import { UserApi } from '@/lib/api/user.api';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'จัดการผู้ใช้งาน',
};

export default async function AdminUsersPage() {
  const [session, users] = await Promise.all([auth(), UserApi.getAll()]);

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold text-foreground'>
          จัดการผู้ใช้งาน
        </h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          ดูรายชื่อผู้ใช้ทั้งหมด เปลี่ยน Role และเปิด/ปิดบัญชีผู้ใช้
        </p>
      </div>
      <UserTable users={users} currentUserId={session!.user!.id} />
    </div>
  );
}
