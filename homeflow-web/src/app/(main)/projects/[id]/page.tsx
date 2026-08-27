import ImageWithPlaceholder from '@/components/shared/ImageWithPlaceholder';
import InlineEditableDate from '@/components/shared/InlineEditableDate';
import InlineEditableText from '@/components/shared/InlineEditableText';
import BudgetPanel from '@/components/features/project/BudgetPanel';
import CloseProjectButton from '@/components/features/project/CloseProjectButton';
import DeleteProjectButton from '@/components/features/project/DeleteProjectButton';
import EditableProjectLocationMap from '@/components/features/project/EditableProjectLocationMap';
import ReadOnlyLocationMap from '@/components/shared/ReadOnlyLocationMap';
import ProjectMaterialsSection from '@/components/features/project/ProjectMaterialsSection';
import ProjectPhotosGallery from '@/components/features/project/ProjectPhotosGallery';
import ProjectProgressRing from '@/components/features/project/ProjectProgressRing';
import ProjectStagesCard from '@/components/features/project/ProjectStagesCard';
import ProjectStatusBadge from '@/components/features/project/ProjectStatusBadge';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/api-error';
import {
  updateProjectDatesAction,
  updateProjectInfoAction,
} from '@/lib/actions/project.action';
import { MaterialApi } from '@/lib/api/material.api';
import { ProjectApi } from '@/lib/api/project.api';
import { auth } from '@/lib/auth';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

// InlineEditableDate รับ-ส่งค่าเป็น ค.ศ. รูปแบบ YYYY-MM-DD (แสดงผลเป็น พ.ศ. ให้เอง)
function toDateInputValue(value: string | null) {
  return value ? value.slice(0, 10) : '';
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className='text-xs text-outline uppercase'>{label}</p>
      <p className='font-bold text-on-surface'>{value}</p>
    </div>
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  let project;
  try {
    project = await ProjectApi.getById(id);
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.statusCode === 404 || error.statusCode === 403)
    ) {
      notFound();
    }
    throw error;
  }

  const isManager =
    session?.user?.role === 'PROJECT_MANAGER' &&
    project.projectManagerId === session.user.id;

  const isCustomerViewer = session?.user?.role === 'CUSTOMER';

  const isAdminViewer = session?.user?.role === 'ADMIN';

  // ลูกค้ามาจากหน้าความคืบหน้า, ผู้ดูแลระบบมาจากหน้ารวมโครงการของฝั่งแอดมิน
  // ส่วน PM มาจากรายการโครงการที่หน้าแรก
  const backHref = isCustomerViewer
    ? '/progress'
    : isAdminViewer
      ? '/admin/projects'
      : '/';

  const canEditDates =
    isManager &&
    project.status !== 'COMPLETED' &&
    project.status !== 'CANCELLED';

  const canClose =
    isManager &&
    (project.status === 'PLANNING' || project.status === 'IN_PROGRESS');

  const showManagementSections = project.projectManagerId !== null;

  const [materials, checklistItems, budget, catalog, withdrawals] =
    showManagementSections
      ? await Promise.all([
          ProjectApi.getMaterials(id),
          ProjectApi.getChecklist(id),
          ProjectApi.getBudget(id),
          isManager ? MaterialApi.getAll() : Promise.resolve([]),
          ProjectApi.getWithdrawalHistory(id),
        ])
      : [[], [], null, [], []];

  const completedChecklistCount = checklistItems.filter(
    (item) => item.isCompleted,
  ).length;
  const overallProgressPercent = checklistItems.length
    ? Math.round((completedChecklistCount / checklistItems.length) * 100)
    : 0;

  return (
    <div className='mx-auto flex max-w-6xl flex-col gap-6'>
      <Button
        variant='ghost'
        size='sm'
        className='w-fit gap-1 px-2 text-on-surface-variant'
        nativeButton={false}
        render={
          <Link href={backHref}>
            <ChevronLeft className='size-4' />
            กลับ
          </Link>
        }
      />

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-4'>
          <ImageWithPlaceholder
            src={project.imageUrl ?? project.houseDesignImageUrl}
            alt={project.houseType}
            className='hidden size-16 shrink-0 rounded-lg border border-outline-variant sm:block'
          />
          <div>
            <h1 className='text-2xl font-bold text-on-background'>
              {isManager ? (
                <InlineEditableText
                  value={project.projectName}
                  inputClassName='text-2xl font-bold'
                  onSave={async (value) => {
                    'use server';
                    const result = await updateProjectInfoAction(project.id, {
                      projectName: value,
                    });
                    if (result?.success === false) return result;
                  }}
                />
              ) : (
                project.projectName
              )}
            </h1>
            <p className='text-sm text-on-surface-variant'>
              {project.houseType} ·{' '}
              {isManager ? (
                <InlineEditableText
                  value={project.location}
                  onSave={async (value) => {
                    'use server';
                    const result = await updateProjectInfoAction(project.id, {
                      location: value,
                    });
                    if (result?.success === false) return result;
                  }}
                />
              ) : (
                project.location
              )}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <ProjectStatusBadge status={project.status} />
          {canClose && (
            <CloseProjectButton
              projectId={project.id}
              progressPercent={project.progressPercent}
            />
          )}
          {isManager && (
            <DeleteProjectButton
              projectId={project.id}
              projectName={project.projectName}
            />
          )}
        </div>
      </div>

      {project.description && (
        <p className='text-on-surface-variant'>{project.description}</p>
      )}

      {isManager ? (
        <EditableProjectLocationMap
          projectId={project.id}
          latitude={project.latitude ? Number(project.latitude) : null}
          longitude={project.longitude ? Number(project.longitude) : null}
        />
      ) : (
        project.latitude !== null &&
        project.longitude !== null && (
          <ReadOnlyLocationMap
            latitude={Number(project.latitude)}
            longitude={Number(project.longitude)}
          />
        )
      )}

      <div className='rounded-xl border border-outline-variant bg-surface-container-lowest p-6'>
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
          {/* วันที่เริ่มต้น = วันที่ส่งคำขอ จึงแสดงอย่างเดียว ไม่ให้แก้ */}
          <DetailItem
            label='วันที่เริ่มต้นโครงการ'
            value={formatDate(project.startDate ?? project.createdAt)}
          />
          {project.status === 'COMPLETED' ? (
            <DetailItem
              label='วันที่ปิดโครงการ'
              value={
                project.completedAt ? formatDate(project.completedAt) : '-'
              }
            />
          ) : canEditDates ? (
            <div>
              <p className='text-xs text-outline uppercase'>
                วันที่คาดว่าจะเสร็จ
              </p>
              <InlineEditableDate
                value={toDateInputValue(project.endDate)}
                min={toDateInputValue(project.startDate ?? project.createdAt)}
                rangeErrorMessage='วันที่คาดว่าจะเสร็จต้องไม่ก่อนวันที่เริ่มต้น'
                className='mt-1'
                onSave={async (value) => {
                  'use server';
                  const result = await updateProjectDatesAction(project.id, {
                    endDate: value,
                  });
                  if (result?.success === false) return result;
                }}
              />
            </div>
          ) : (
            <DetailItem
              label='วันที่คาดว่าจะเสร็จ'
              value={project.endDate ? formatDate(project.endDate) : '-'}
            />
          )}
          <DetailItem
            label='อัปเดตล่าสุด'
            value={formatDate(project.updatedAt)}
          />
        </div>
      </div>

      {showManagementSections && budget && (
        <>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
            <div className='lg:col-span-4'>
              <ProjectProgressRing percent={overallProgressPercent} />
            </div>
            <div className='lg:col-span-8'>
              <ProjectStagesCard
                projectId={project.id}
                projectName={project.projectName}
                items={checklistItems}
                isManager={isManager}
              />
            </div>
          </div>

          <BudgetPanel budget={budget} />

          <ProjectMaterialsSection
            projectId={project.id}
            materials={materials}
            catalog={catalog}
            withdrawals={withdrawals}
            isManager={isManager}
          />

          <ProjectPhotosGallery items={checklistItems} />
        </>
      )}
    </div>
  );
}
