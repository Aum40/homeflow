import ProjectCard from '@/components/features/project/ProjectCard';
import ProjectHeroCard from '@/components/features/project/ProjectHeroCard';
import { auth } from '@/lib/auth';
import { ProjectApi } from '@/lib/api/project.api';
import { ProjectResponse } from '@/lib/api/api.type';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

const ONGOING_STATUSES: ProjectResponse['status'][] = [
  'REQUESTED',
  'PLANNING',
  'IN_PROGRESS'
];

function pickFeaturedProject(projects: ProjectResponse[]) {
  return (
    projects.find((project) => ONGOING_STATUSES.includes(project.status)) ??
    projects[0]
  );
}

export const metadata: Metadata = {
  title: 'ความคืบหน้าการก่อสร้าง'
};

export const dynamic = 'force-dynamic';

export default async function ProgressPage() {
  const session = await auth();
  if (session?.user?.role !== 'CUSTOMER') {
    redirect('/');
  }

  const projects = await ProjectApi.getMine();
  const featuredProject = pickFeaturedProject(projects);
  const otherProjects = projects.filter(
    (project) => project.id !== featuredProject?.id
  );

  const recentPhotos = featuredProject
    ? (await ProjectApi.getChecklist(featuredProject.id))
        .flatMap((item) =>
          item.photos.map((photo) => ({ ...photo, title: item.title }))
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 3)
    : [];

  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-6'>
      <div>
        <h2 className='text-xl font-bold text-on-background'>
          ความคืบหน้าการก่อสร้าง
        </h2>
        <p className='text-sm text-on-surface-variant'>
          ทั้งหมด {projects.length} โครงการ
        </p>
      </div>
      {!featuredProject ? (
        <p className='text-sm text-on-surface-variant'>
          คุณยังไม่มีโครงการ — ทีมงานจะสร้างโครงการให้เมื่อเริ่มดำเนินการ
        </p>
      ) : (
        <>
          <ProjectHeroCard
            project={featuredProject}
            recentPhotos={recentPhotos}
          />
          {otherProjects.length > 0 && (
            <div className='flex flex-col gap-4'>
              <h3 className='text-sm font-bold text-on-surface-variant'>
                โครงการอื่นๆ ของคุณ
              </h3>
              {otherProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  viewerRole='CUSTOMER'
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
