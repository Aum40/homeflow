import MonthlyIntakeChart from '@/components/features/dashboard/MonthlyIntakeChart';
import ImageWithPlaceholder from '@/components/shared/ImageWithPlaceholder';
import EditProjectInfoDialog from '@/components/features/project/EditProjectInfoDialog';
import ProjectStatusBadge from '@/components/features/project/ProjectStatusBadge';
import { formatCurrency } from '@/components/features/project/ProjectCard';
import { DashboardApi } from '@/lib/api/dashboard.api';
import { MaterialApi } from '@/lib/api/material.api';
import { ProjectApi } from '@/lib/api/project.api';
import { ProjectResponse, ProjectStatus } from '@/lib/api/api.type';
import { auth } from '@/lib/auth';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Boxes,
  ClipboardList,
  PackageX,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'แดชบอร์ด'
};

export const dynamic = 'force-dynamic';

type DisplayStatus = Exclude<ProjectStatus, 'PLANNING'>;

const STATUS_LABELS: Record<DisplayStatus, string> = {
  REQUESTED: 'รอดำเนินการ',
  IN_PROGRESS: 'กำลังดำเนินการ',
  COMPLETED: 'เสร็จสิ้น',
  CANCELLED: 'ยกเลิก'
};

const STATUS_BAR_COLORS: Record<DisplayStatus, string> = {
  REQUESTED: 'bg-outline',
  IN_PROGRESS: 'bg-primary',
  COMPLETED: 'bg-secondary',
  CANCELLED: 'bg-destructive'
};

const STAT_ACCENTS = {
  primary: {
    border: 'border-t-primary',
    iconBg: 'bg-primary/10',
    iconText: 'text-primary'
  },
  secondary: {
    border: 'border-t-secondary',
    iconBg: 'bg-secondary/15',
    iconText: 'text-secondary'
  },
  tertiary: {
    border: 'border-t-tertiary',
    iconBg: 'bg-tertiary/15',
    iconText: 'text-tertiary'
  },
  destructive: {
    border: 'border-t-destructive',
    iconBg: 'bg-destructive/10',
    iconText: 'text-destructive'
  },
  success: {
    border: 'border-t-green-600',
    iconBg: 'bg-green-600/10',
    iconText: 'text-green-600'
  }
} as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(
    new Date(value)
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent = 'primary'
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: keyof typeof STAT_ACCENTS;
}) {
  const { border, iconBg, iconText } = STAT_ACCENTS[accent];

  return (
    <div
      className={`flex items-center gap-4 rounded-xl border border-outline-variant border-t-4 bg-surface-container-lowest p-6 shadow-sm transition-all hover:shadow-md ${border}`}
    >
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${iconBg} ${iconText}`}
      >
        <Icon className="size-6" />
      </div>
      <div>
        <p className="text-xs tracking-wide text-outline uppercase">
          {label}
        </p>
        <p className="text-2xl font-bold text-on-surface">{value}</p>
      </div>
    </div>
  );
}

function ProjectsByStatus({
  projectsByStatus
}: {
  projectsByStatus: Record<string, number>;
}) {
  const merged: Record<DisplayStatus, number> = {
    REQUESTED: projectsByStatus.REQUESTED ?? 0,
    IN_PROGRESS:
      (projectsByStatus.IN_PROGRESS ?? 0) + (projectsByStatus.PLANNING ?? 0),
    COMPLETED: projectsByStatus.COMPLETED ?? 0,
    CANCELLED: projectsByStatus.CANCELLED ?? 0
  };
  const total = Object.values(merged).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-all hover:shadow-md">
      <h2 className="text-lg font-bold text-on-background">
        โครงการแยกตามสถานะ
      </h2>
      {total === 0 ? (
        <p className="text-sm text-on-surface-variant">ยังไม่มีโครงการ</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {(Object.keys(STATUS_LABELS) as DisplayStatus[]).map((status) => {
            const count = merged[status];
            const percent = total > 0 ? Math.round((count / total) * 100) : 0;

            return (
              <li key={status} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-on-surface-variant">
                    <span
                      className={`size-2 rounded-full ${STATUS_BAR_COLORS[status]}`}
                    />
                    {STATUS_LABELS[status]}
                  </span>
                  <span className="font-bold text-on-surface">{count}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-variant">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${STATUS_BAR_COLORS[status]}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const LOW_STOCK_THRESHOLD = 10;

async function LowStockMaterialsList() {
  const materials = await MaterialApi.getAll();
  const lowStock = materials
    .filter((material) => material.stock < LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock - b.stock);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-all hover:shadow-md">
      <h2 className="text-lg font-bold text-on-background">
        วัสดุใกล้หมดสต็อก
      </h2>
      {lowStock.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          ไม่มีวัสดุที่ใกล้หมดสต็อกในขณะนี้
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-outline-variant/60">
          {lowStock.map((material) => (
            <li
              key={material.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <ImageWithPlaceholder
                src={material.imageUrl}
                alt={material.name}
                className="size-10 shrink-0 rounded-md border border-outline-variant"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-on-surface">
                  {material.name}
                </p>
                <p className="truncate text-xs text-on-surface-variant">
                  {material.category}
                </p>
              </div>
              <span className="shrink-0 text-sm font-bold text-destructive">
                {material.stock} {material.unit}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const ONGOING_STATUSES: ProjectStatus[] = ['PLANNING', 'IN_PROGRESS'];

function RecentProjectsList({
  projects,
  isPm
}: {
  projects: ProjectResponse[];
  isPm: boolean;
}) {
  const ongoing = projects.filter((project) =>
    ONGOING_STATUSES.includes(project.status)
  );
  const recent = ongoing.slice(0, 5);
  const completedCount = projects.length - ongoing.length;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-all hover:shadow-md">
      <h2 className="text-lg font-bold text-on-background">
        โครงการที่กำลังดำเนินการ
      </h2>
      {recent.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          ไม่มีโครงการที่กำลังดำเนินการอยู่ในขณะนี้
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-outline-variant/60">
          {recent.map((project) => (
            <li
              key={project.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <Link
                href={`/projects/${project.id}`}
                className="min-w-0 flex-1 transition-colors hover:opacity-80"
              >
                <p className="truncate font-medium text-on-surface">
                  {project.projectName}
                </p>
                <p className="truncate text-xs text-on-surface-variant">
                  {project.houseType} · {project.location} ·{' '}
                  {formatDate(project.createdAt)}
                </p>
              </Link>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-bold text-on-surface">
                  {project.progressPercent}%
                </span>
                <ProjectStatusBadge status={project.status} />
                {isPm && (
                  <EditProjectInfoDialog
                    projectId={project.id}
                    projectName={project.projectName}
                    imageUrl={project.imageUrl}
                    location={project.location}
                    latitude={
                      project.latitude ? Number(project.latitude) : null
                    }
                    longitude={
                      project.longitude ? Number(project.longitude) : null
                    }
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {completedCount > 0 && (
        <Link
          href="/"
          className="w-fit text-sm font-medium text-primary hover:underline"
        >
          ดูโครงการที่เสร็จแล้ว ({completedCount})
        </Link>
      )}
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();

  if (session?.user?.role === 'CUSTOMER') {
    redirect('/');
  }

  const dashboard = await DashboardApi.get();

  if (dashboard.role === 'ADMIN') {
    const firstName = session?.user?.firstName;
    const allProjects = await ProjectApi.getAll();

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {firstName ? `สวัสดี, ${firstName}` : 'แดชบอร์ด'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ภาพรวมของระบบทั้งหมด
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="จำนวน PM"
            value={dashboard.totalProjectManagers}
            accent="primary"
          />
          <StatCard
            icon={ClipboardList}
            label="โครงการทั้งหมด"
            value={dashboard.totalProjects}
            accent="secondary"
          />
          <StatCard
            icon={Boxes}
            label="วัสดุทั้งหมด"
            value={dashboard.totalMaterials}
            accent="tertiary"
          />
          <StatCard
            icon={PackageX}
            label="วัสดุใกล้หมดสต็อก"
            value={dashboard.lowStockMaterials}
            accent="destructive"
          />
        </div>

        <MonthlyIntakeChart projects={allProjects} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ProjectsByStatus projectsByStatus={dashboard.projectsByStatus} />
          <LowStockMaterialsList />
        </div>
      </div>
    );
  }

  const isPm = dashboard.role === 'PROJECT_MANAGER';
  const projects = isPm
    ? await ProjectApi.getManaged()
    : await ProjectApi.getMine();

  const firstName = session?.user?.firstName;

  const profitOrLoss =
    Number(dashboard.totalEstimatedBudget) - Number(dashboard.totalActualCost);
  const isProfit = profitOrLoss >= 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {firstName ? `สวัสดี, ${firstName}` : 'แดชบอร์ด'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ภาพรวมโครงการของคุณ
        </p>
      </div>

      <div
        className={
          isPm
            ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'
            : 'grid grid-cols-1 gap-4 sm:grid-cols-3'
        }
      >
        <StatCard
          icon={ClipboardList}
          label="โครงการทั้งหมด"
          value={dashboard.totalProjects}
          accent="primary"
        />
        <StatCard
          icon={Wallet}
          label="งบประมาณโดยประมาณรวม"
          value={formatCurrency(dashboard.totalEstimatedBudget)}
          accent="secondary"
        />
        <StatCard
          icon={Wallet}
          label="ต้นทุนที่ใช้จริงรวม"
          value={formatCurrency(dashboard.totalActualCost)}
          accent="tertiary"
        />
        {isPm && (
          <StatCard
            icon={isProfit ? TrendingUp : TrendingDown}
            label={isProfit ? 'กำไรโดยประมาณ' : 'ขาดทุนโดยประมาณ'}
            value={formatCurrency(Math.abs(profitOrLoss).toString())}
            accent={isProfit ? 'success' : 'destructive'}
          />
        )}
      </div>

      {isPm && <MonthlyIntakeChart projects={projects} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProjectsByStatus projectsByStatus={dashboard.projectsByStatus} />
        <RecentProjectsList projects={projects} isPm={isPm} />
      </div>
    </div>
  );
}
