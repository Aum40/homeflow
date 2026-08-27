import ImageWithPlaceholder from '@/components/shared/ImageWithPlaceholder';
import { Button } from '@/components/ui/button';
import { ProjectResponse, UserRole } from '@/lib/api/api.type';
import Link from 'next/link';
import EditProjectInfoDialog from './EditProjectInfoDialog';
import ProjectStatusBadge from './ProjectStatusBadge';

export function formatCurrency(value: string) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(
    new Date(value)
  );
}

export default function ProjectCard({
  project,
  viewerRole,
  action
}: {
  project: ProjectResponse;
  viewerRole?: UserRole;
  action?: React.ReactNode;
}) {
  const counterpartLabel =
    viewerRole === 'PROJECT_MANAGER'
      ? `ลูกค้า: ${project.customerName}`
      : viewerRole === 'CUSTOMER' && project.projectManagerName
        ? `ผู้จัดการโครงการ: ${project.projectManagerName}`
        : null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-all hover:shadow-md md:flex-row md:items-center md:justify-between">
      <div className="flex flex-grow items-start gap-4">
        <ImageWithPlaceholder
          src={project.imageUrl ?? project.houseDesignImageUrl}
          alt={project.houseType}
          className="hidden size-16 shrink-0 rounded-lg border border-outline-variant sm:block"
        />
        <div className="flex-grow">
          <div className="mb-1 flex flex-wrap items-center gap-3">
            <h3 className="font-bold text-primary">{project.projectName}</h3>
            <ProjectStatusBadge status={project.status} />
            {viewerRole === 'PROJECT_MANAGER' && (
              <EditProjectInfoDialog
                projectId={project.id}
                projectName={project.projectName}
                imageUrl={project.imageUrl}
                location={project.location}
                latitude={project.latitude ? Number(project.latitude) : null}
                longitude={
                  project.longitude ? Number(project.longitude) : null
                }
              />
            )}
          </div>
          {counterpartLabel && (
            <p className="text-sm text-on-surface-variant">
              {counterpartLabel}
            </p>
          )}
          <p className="mb-2 text-xs text-on-surface-variant">
            {project.houseType} · {project.location}
          </p>
          <div className="flex max-w-xs items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-variant">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${project.progressPercent}%` }}
              />
            </div>
            <span className="text-sm font-bold text-on-surface">
              {project.progressPercent}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-xs text-on-surface-variant">ขั้นตอนปัจจุบัน</p>
          <p className="font-bold text-on-surface">
            {project.currentStepTitle ??
              (project.progressPercent === 100 ? 'เสร็จสมบูรณ์' : '-')}
          </p>
          <p className="mt-2 text-xs text-on-surface-variant">
            คาดว่าจะเสร็จสิ้น
          </p>
          <p className="font-bold text-on-surface">
            {project.endDate ? formatDate(project.endDate) : '-'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/projects/${project.id}`}>ดูรายละเอียด</Link>}
          />
          {action}
        </div>
      </div>
    </div>
  );
}
