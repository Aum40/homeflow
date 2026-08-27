import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AvatarUploadDialog from './AvatarUploadDialog';

type ProfileAvatarProps = {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
};

export default function ProfileAvatar({
  firstName,
  lastName,
  avatarUrl
}: ProfileAvatarProps) {
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`;

  return (
    <div className="relative">
      <Avatar className="size-42 border">
        <AvatarImage src={avatarUrl ?? undefined} alt="User" />
        <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
      </Avatar>
      <AvatarUploadDialog avatarUrl={avatarUrl} />
    </div>
  );
}
