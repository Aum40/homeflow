import AdminProjectsTable from '@/components/features/admin/AdminProjectsTable';
import { ProjectApi } from '@/lib/api/project.api';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ดูโครงการทั้งหมด',
};

export const dynamic = 'force-dynamic';

export default async function AdminProjectsPage() {
  const projects = await ProjectApi.getAll();

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold text-foreground'>
          ดูโครงการทั้งหมด
        </h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          ค้นหาและดูรายละเอียดโครงการทุกโครงการในระบบ
        </p>
      </div>
      <AdminProjectsTable projects={projects} />
    </div>
  );
}
