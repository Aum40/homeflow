'use client';

import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  updateUserRoleAction,
  updateUserStatusAction
} from '@/lib/actions/user.action';
import { Input } from '@/components/ui/input';
import { UserResponse, UserRole } from '@/lib/api/api.type';
import { AlertCircle, Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin',
  PROJECT_MANAGER: 'Project Manager',
  CUSTOMER: 'Customer'
};

export default function UserTable({
  users,
  currentUserId
}: {
  users: UserResponse[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const filteredUsers = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return users;

    return users.filter((user) =>
      `${user.firstName} ${user.lastName} ${user.email}`
        .toLowerCase()
        .includes(keyword)
    );
  }, [users, query]);

  const handleRoleChange = (userId: string, role: UserRole) => {
    setPendingUserId(userId);
    startTransition(async () => {
      setError(null);
      const result = await updateUserRoleAction(userId, role);
      if (result?.success === false) {
        setError(result.message);
      } else {
        router.refresh();
      }
      setPendingUserId(null);
    });
  };

  const handleStatusToggle = (userId: string, nextIsActive: boolean) => {
    setPendingUserId(userId);
    startTransition(async () => {
      setError(null);
      const result = await updateUserStatusAction(userId, nextIsActive);
      if (result?.success === false) {
        setError(result.message);
      } else {
        router.refresh();
      }
      setPendingUserId(null);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <Alert
          variant="destructive"
          className="border-destructive bg-destructive/15"
        >
          <AlertCircle />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-outline" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาจากชื่อ หรืออีเมล"
          aria-label="ค้นหาผู้ใช้งาน"
          className="pl-9"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">ชื่อ</th>
              <th className="px-4 py-3 font-medium">อีเมล</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const isSelf = user.id === currentUserId;
              const rowPending = isPending && pendingUserId === user.id;

              return (
                <tr
                  key={user.id}
                  className="border-t border-border last:border-b-0"
                >
                  <td className="px-4 py-3">
                    {user.firstName} {user.lastName}
                    {isSelf && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (คุณ)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Select
                        value={user.role}
                        disabled={isSelf || rowPending}
                        onValueChange={(value) =>
                          handleRoleChange(user.id, value as UserRole)
                        }
                      >
                        <SelectTrigger size="sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(ROLE_LABELS) as UserRole[]).map(
                            (role) => (
                              <SelectItem key={role} value={role}>
                                {ROLE_LABELS[role]}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      {rowPending && (
                        <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        user.isActive
                          ? 'text-on-primary-container'
                          : 'text-destructive'
                      }
                    >
                      {user.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant={user.isActive ? 'destructive' : 'outline'}
                      disabled={isSelf || rowPending}
                      onClick={() =>
                        handleStatusToggle(user.id, !user.isActive)
                      }
                    >
                      {rowPending && (
                        <Loader2 className="mr-1 size-3.5 animate-spin" />
                      )}
                      {user.isActive ? 'ปิดบัญชี' : 'เปิดบัญชี'}
                    </Button>
                  </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  {query.trim()
                    ? `ไม่พบผู้ใช้งานที่ตรงกับ "${query.trim()}"`
                    : 'ยังไม่มีผู้ใช้งานในระบบ'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
