import HouseDesignCatalogGrid from '@/components/features/house-design/HouseDesignCatalogGrid';
import PmProjectsList from '@/components/features/project/PmProjectsList';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { HouseDesignApi } from '@/lib/api/house-design.api';
import { ProjectApi } from '@/lib/api/project.api';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// หน้านี้ใช้ร่วมกันหลาย role (PM เห็นรายการโครงการ, ลูกค้าเห็นแคตตาล็อก) จึงตั้งชื่อกลางๆ
export const metadata: Metadata = {
  title: 'Homeflow'
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.role === 'ADMIN') {
    redirect('/admin/manage-users');
  }

  if (session?.user?.role === 'PROJECT_MANAGER') {
    const managedProjects = await ProjectApi.getManaged();

    return (
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-bold text-on-background'>
              โครงการที่คุณดูแล
            </h2>
            <p className='text-sm text-on-surface-variant'>
              ทั้งหมด {managedProjects.length} โครงการ
            </p>
          </div>
          <Button
            nativeButton={false}
            render={<Link href='/projects/new'>+ สร้างโครงการใหม่</Link>}
          />
        </div>
        {managedProjects.length === 0 ? (
          <p className='text-sm text-on-surface-variant'>
            คุณยังไม่ได้รับผิดชอบโครงการใด — เริ่มสร้างโครงการใหม่ได้เลย
          </p>
        ) : (
          <PmProjectsList projects={managedProjects} />
        )}
      </div>
    );
  }

  const houseDesigns = await HouseDesignApi.getAll();

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h2 className='text-xl font-bold text-on-background'>
          {session?.user?.firstName
            ? `สวัสดี, ${session.user.firstName}`
            : 'แคตตาล็อกแบบบ้าน'}
        </h2>
        <p className='text-sm text-on-surface-variant'>
          เลือกดูแบบบ้านที่เรารับสร้าง กดที่การ์ดเพื่อดูรายละเอียด
        </p>
      </div>
      <HouseDesignCatalogGrid houseDesigns={houseDesigns} />
    </div>
  );
}
