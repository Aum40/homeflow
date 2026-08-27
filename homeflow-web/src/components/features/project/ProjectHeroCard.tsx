import ImageWithPlaceholder from '@/components/shared/ImageWithPlaceholder';
import { Button } from '@/components/ui/button';
import { ChecklistItemPhoto, ProjectResponse } from '@/lib/api/api.type';
import Link from 'next/link';
import PhotoGalleryTile from './PhotoGalleryTile';
import ProjectStatusBadge from './ProjectStatusBadge';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(
    new Date(value)
  );
}

export default function ProjectHeroCard({
  project,
  recentPhotos
}: {
  project: ProjectResponse;
  recentPhotos: (ChecklistItemPhoto & { title: string })[];
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="relative aspect-[21/9] w-full sm:aspect-[3/1]">
        <ImageWithPlaceholder
          src={project.imageUrl ?? project.houseDesignImageUrl}
          alt={project.houseType}
          className="size-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-white md:text-2xl">
              {project.projectName}
            </h2>
            <ProjectStatusBadge status={project.status} />
          </div>
          <p className="text-sm text-white/80">
            {project.houseType} · {project.location}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-variant">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${project.progressPercent}%` }}
            />
          </div>
          <span className="text-lg font-bold text-on-surface">
            {project.progressPercent}%
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-surface-variant/40 p-4">
            <p className="text-xs text-on-surface-variant">ขั้นตอนปัจจุบัน</p>
            <p className="font-bold text-on-surface">
              {project.currentStepTitle ??
                (project.progressPercent === 100 ? 'เสร็จสมบูรณ์' : '-')}
            </p>
          </div>
          <div className="rounded-xl bg-surface-variant/40 p-4">
            <p className="text-xs text-on-surface-variant">คาดว่าจะเสร็จสิ้น</p>
            <p className="font-bold text-on-surface">
              {project.endDate ? formatDate(project.endDate) : '-'}
            </p>
          </div>
        </div>

        {recentPhotos.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-on-surface">
              ภาพความคืบหน้าล่าสุด
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {recentPhotos.map((photo) => (
                <PhotoGalleryTile
                  key={photo.id}
                  imageUrl={photo.imageUrl}
                  title={photo.title}
                  createdAt={photo.createdAt}
                />
              ))}
            </div>
          </div>
        )}

        <Button
          nativeButton={false}
          className="w-fit"
          render={<Link href={`/projects/${project.id}`}>ดูรายละเอียดโครงการ</Link>}
        />
      </div>
    </div>
  );
}
