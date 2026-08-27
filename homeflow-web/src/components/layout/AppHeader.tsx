'use client';

import homeflowIcon from '@/app/icon.png';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { logoutAction } from '@/lib/actions/auth.action';
import { cn } from '@/lib/utils';
import { LogOut, UserRound } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getNavItems, isNavItemActive } from './nav-items';

export default function AppHeader({
  title,
  user,
  hasSidebar = true,
  showNav = false
}: {
  title: string;
  user: {
    firstName?: string;
    lastName?: string;
    role?: string;
    avatarUrl?: string | null;
  };
  /**
   * true เมื่อ layout มีแถบเมนูซ้ายบนจอใหญ่ — แบรนด์จะโชว์เฉพาะจอเล็ก
   * เพื่อไม่ให้ซ้ำกับแบรนด์ในแถบเมนู
   */
  hasSidebar?: boolean;
  /** แสดงลิงก์เมนูในหัวบนจอใหญ่ (ใช้กับ role ที่ไม่มีแถบเมนูซ้าย) */
  showNav?: boolean;
}) {
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`;
  const pathname = usePathname();
  const navItems = showNav ? getNavItems(user.role) : [];

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-surface px-gutter-mobile shadow-sm lg:px-gutter-desktop">
      <div className="flex flex-grow items-center gap-3">
        <div className={cn('flex items-center gap-3', hasSidebar && 'lg:hidden')}>
          <div className="flex size-9 items-center justify-center overflow-hidden rounded-lg">
            <Image src={homeflowIcon} alt="Homeflow" className="size-full" />
          </div>
          <span className="text-lg font-bold whitespace-nowrap text-primary">
            Homeflow
          </span>
        </div>
        {title && (
          <span
            className={cn(
              'text-lg font-bold whitespace-nowrap text-on-surface-variant',
              hasSidebar && 'hidden lg:inline'
            )}
          >
            {title}
          </span>
        )}
      </div>

      {navItems.length > 0 && (
        <nav className="hidden shrink-0 items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const isActive = isNavItemActive(pathname, item);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors',
                  isActive
                    ? 'font-bold text-primary'
                    : 'font-medium text-on-surface-variant hover:bg-surface-variant'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}

      <div className="flex items-center gap-6">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-3 border-l border-outline-variant/30 pl-4 outline-none"
              />
            }
          >
            <Avatar className="ring-2 ring-transparent transition-all hover:ring-primary">
              <AvatarImage src={user.avatarUrl ?? undefined} alt="User" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href="/profile" />}>
              <UserRound />
              โปรไฟล์
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => logoutAction()}
            >
              <LogOut />
              ออกจากระบบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
