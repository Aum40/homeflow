import {
  Boxes,
  Building2,
  ClipboardList,
  HardHat,
  Home,
  House,
  LayoutDashboard,
  LucideIcon,
  Phone,
  Users
} from 'lucide-react';

export type NavItem = {
  label: string;
  /** ป้ายสั้นสำหรับแถบเมนูล่างบนจอเล็ก ซึ่งมีพื้นที่จำกัด */
  shortLabel: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
  /** path เพิ่มเติมที่ให้ถือว่าเมนูนี้ active เช่นหน้ารายละเอียดที่แตกออกไป */
  matchPrefixes?: string[];
};

export function getNavItems(role?: string): NavItem[] {
  if (role === 'ADMIN') {
    return [
      {
        label: 'จัดการผู้ใช้งาน',
        shortLabel: 'ผู้ใช้งาน',
        href: '/admin/manage-users',
        icon: Users,
        enabled: true
      },
      {
        // ผู้ดูแลระบบดูโครงการได้ทั้งหมดแต่แก้ไขหรือลบไม่ได้ จึงใช้คำว่า "ดู"
        label: 'ดูโครงการทั้งหมด',
        shortLabel: 'โครงการ',
        href: '/admin/projects',
        icon: ClipboardList,
        enabled: true,
        matchPrefixes: ['/projects']
      },
      {
        label: 'จัดการวัสดุ',
        shortLabel: 'วัสดุ',
        href: '/admin/materials',
        icon: Boxes,
        enabled: true
      },
      {
        // อย่าใส่ matchPrefixes: ['/house-designs'] ที่นี่ — นั่นคือหน้าแคตตาล็อกของลูกค้า
        label: 'จัดการแบบบ้าน',
        shortLabel: 'แบบบ้าน',
        href: '/admin/house-designs',
        icon: House,
        enabled: true
      },
      {
        label: 'ข้อมูลติดต่อบริษัท',
        shortLabel: 'ติดต่อ',
        href: '/admin/contact',
        icon: Building2,
        enabled: true
      },
      {
        label: 'แดชบอร์ด',
        shortLabel: 'แดชบอร์ด',
        href: '/dashboard',
        icon: LayoutDashboard,
        enabled: true
      }
    ];
  }

  if (role === 'PROJECT_MANAGER') {
    return [
      {
        label: 'งานก่อสร้างของคุณ',
        shortLabel: 'งานก่อสร้าง',
        href: '/',
        icon: Home,
        enabled: true,
        matchPrefixes: ['/projects']
      },
      {
        label: 'แดชบอร์ด',
        shortLabel: 'แดชบอร์ด',
        href: '/dashboard',
        icon: LayoutDashboard,
        enabled: true
      }
    ];
  }

  return [
    {
      label: 'หน้าแรก',
      shortLabel: 'หน้าแรก',
      href: '/',
      icon: Home,
      enabled: true,
      matchPrefixes: ['/house-designs']
    },
    {
      label: 'ความคืบหน้าการก่อสร้าง',
      shortLabel: 'ความคืบหน้า',
      href: '/progress',
      icon: HardHat,
      enabled: true,
      matchPrefixes: ['/projects']
    },
    {
      label: 'ติดต่อเรา',
      shortLabel: 'ติดต่อ',
      href: '/contact',
      icon: Phone,
      enabled: true
    }
  ];
}

export function isNavItemActive(pathname: string, item: NavItem) {
  const matches = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(`${href}/`);

  return matches(item.href) || (item.matchPrefixes ?? []).some(matches);
}
