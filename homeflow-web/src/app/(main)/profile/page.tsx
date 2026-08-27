import ChangePasswordForm from '@/components/features/profile/ChangePasswordForm';
import EditProfileForm from '@/components/features/profile/EditProfileForm';
import ProfileHeader from '@/components/features/profile/ProfileHeader';
import { AuthApi } from '@/lib/api/auth.api';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'โปรไฟล์ของฉัน'
};

export default async function ProfilePage() {
  const user = await AuthApi.getMe();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <ProfileHeader user={user} />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-on-background">
          แก้ไขข้อมูลส่วนตัว
        </h2>
        <EditProfileForm firstName={user.firstName} lastName={user.lastName} />
      </section>

      <section className="flex flex-col gap-4 border-t border-outline-variant pt-8">
        <h2 className="text-lg font-bold text-on-background">
          เปลี่ยนรหัสผ่าน
        </h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
