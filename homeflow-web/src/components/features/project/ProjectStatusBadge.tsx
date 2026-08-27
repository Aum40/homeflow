import { ProjectStatus } from '@/lib/api/api.type';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  REQUESTED: {
    label: 'รออนุมัติ',
    className: 'bg-secondary-container text-on-secondary-container',
  },
  PLANNING: {
    label: 'กำลังดำเนินการ',
    className: 'bg-primary-container text-on-primary-container',
  },
  IN_PROGRESS: {
    label: 'กำลังดำเนินการ',
    className: 'bg-primary text-primary-foreground',
  },
  COMPLETED: {
    label: 'เสร็จสิ้น',
    className: 'bg-on-primary-container text-primary-container',
  },
  CANCELLED: {
    label: 'ยกเลิก',
    className: 'bg-destructive/15 text-destructive',
  },
};

export default function ProjectStatusBadge({
  status,
}: {
  status: ProjectStatus;
}) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-block rounded-full px-3 py-1 text-xs font-bold uppercase',
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
