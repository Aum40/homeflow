import { UserResponse } from '@/lib/api/api.type';
import ProfileAvatar from './ProfileAvatar';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'ผู้ดูแลระบบ',
  PROJECT_MANAGER: 'ผู้จัดการโครงการ',
  CUSTOMER: 'ลูกค้า'
};

type ProfileHeaderProps = {
  user: UserResponse;
};

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-4 border-b border-outline-variant pb-8 text-center md:flex-row md:items-end md:text-left">
      <ProfileAvatar
        firstName={user.firstName}
        lastName={user.lastName}
        avatarUrl={user.avatarUrl}
      />
      <div>
        <h1 className="text-3xl font-bold text-on-background">
          {user.firstName} {user.lastName}
        </h1>
        <p className="text-on-surface-variant">{user.email}</p>
        <span className="mt-2 inline-block rounded-full bg-primary-container px-3 py-1 text-xs font-bold text-on-primary-container">
          {ROLE_LABELS[user.role] ?? user.role}
        </span>
      </div>
    </div>
  );
}
