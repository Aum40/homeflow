'use client';

import homeflowIcon from '@/app/icon.png';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getNavItems, isNavItemActive } from './nav-items';

function NavList({ pathname, role }: { pathname: string; role?: string }) {
  const navItems = getNavItems(role);

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const isActive = item.enabled && isNavItemActive(pathname, item);
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={item.enabled ? undefined : (e) => e.preventDefault()}
            aria-disabled={!item.enabled}
            className={cn(
              'flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors',
              isActive
                ? 'border-r-4 border-secondary bg-primary font-bold text-primary-foreground'
                : item.enabled
                  ? 'text-on-surface-variant hover:bg-surface-variant'
                  : 'cursor-not-allowed text-outline'
            )}
          >
            <Icon className="mr-3 size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AppSidebar({
  user
}: {
  user: {
    firstName?: string;
    lastName?: string;
    role?: string;
    avatarUrl?: string | null;
  };
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 z-50 hidden h-screen w-64 flex-col border-r border-outline-variant bg-surface-container-low lg:flex">
      <div className="flex h-full flex-col">
        <div className="flex items-center space-x-3 px-6 py-6">
          <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg">
            <Image src={homeflowIcon} alt="Homeflow" className="size-full" />
          </div>
          <span className="text-xl font-bold text-primary">Homeflow</span>
        </div>

        <div className="mt-4 flex-grow">
          <NavList pathname={pathname} role={user.role} />
        </div>
      </div>
    </aside>
  );
}
