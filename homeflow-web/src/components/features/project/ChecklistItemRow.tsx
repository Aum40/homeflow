'use client';

import { Button } from '@/components/ui/button';
import {
  removeChecklistItemAction,
  removeChecklistItemPhotoAction,
  toggleChecklistItemAction,
  uploadChecklistItemPhotosAction
} from '@/lib/actions/project.action';
import { ChecklistItemResponse } from '@/lib/api/api.type';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { checkUploadSize, cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ImagePlus, Loader2, Trash2, X } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';
import EditChecklistItemDialog from './EditChecklistItemDialog';
import PhotoThumbnail from './PhotoThumbnail';

function formatDateShort(value: string) {
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(
    new Date(value)
  );
}

export default function ChecklistItemRow({
  projectId,
  item,
  isManager
}: {
  projectId: string;
  item: ChecklistItemResponse;
  isManager: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputEl = useRef<HTMLInputElement | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id, disabled: !isManager });

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const handleToggle = () => {
    setError(null);
    startTransition(async () => {
      const result = await toggleChecklistItemAction(
        projectId,
        item.id,
        !item.isCompleted
      );
      if (result?.success === false) setError(result.message);
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    e.target.value = '';

    const sizeError = checkUploadSize(files);
    if (sizeError) {
      setError(sizeError);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await uploadChecklistItemPhotosAction(
        projectId,
        item.id,
        files
      );
      if (result?.success === false) setError(result.message);
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={sortableStyle}
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-4',
        isDragging && 'relative z-10 opacity-50 shadow-lg'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {isManager && (
          <button
            type="button"
            aria-label="ลากเพื่อจัดลำดับใหม่"
            className="mt-1 shrink-0 cursor-grab touch-none text-outline hover:text-on-surface active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-5" />
          </button>
        )}
        <label className="flex flex-1 cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={item.isCompleted}
            disabled={!isManager || isPending}
            onChange={handleToggle}
            className="mt-1 size-5 shrink-0 rounded border-outline text-primary focus:ring-primary disabled:cursor-not-allowed"
          />
          <div>
            <p
              className={
                item.isCompleted
                  ? 'font-bold text-green-600 dark:text-green-400'
                  : 'font-bold text-on-surface'
              }
            >
              {item.title}
            </p>
            {item.isCompleted && item.completedByName && item.completedAt ? (
              <p className="text-xs text-on-surface-variant">
                เสร็จโดย {item.completedByName} ·{' '}
                {formatDateShort(item.completedAt)}
              </p>
            ) : (
              <span className="mt-1 inline-block rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold text-on-secondary-container uppercase">
                กำลังดำเนินงาน
              </span>
            )}
          </div>
        </label>

        {isManager && (
          <div className="flex shrink-0 items-center gap-1">
            <EditChecklistItemDialog projectId={projectId} item={item} />
            <ConfirmDialog
              triggerRender={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending}
                  aria-label="ลบรายการ"
                />
              }
              triggerContent={
                isPending ? (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                ) : (
                  <Trash2 className="size-4 text-destructive" />
                )
              }
              title="ยืนยันการลบรายการ"
              description={`ต้องการลบ "${item.title}" ออกจากเช็คลิสต์ใช่หรือไม่? รูปภาพที่แนบไว้จะถูกลบไปด้วย`}
              confirmLabel="ลบรายการ"
              successMessage="ลบรายการเรียบร้อยแล้ว"
              destructive
              onConfirm={() => removeChecklistItemAction(projectId, item.id)}
            />
          </div>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {(item.photos.length > 0 || isManager) && (
        <div className="flex flex-wrap gap-2">
          {item.photos.map((photo, index) => (
            <div key={photo.id} className="group relative">
              <PhotoThumbnail
                src={photo.imageUrl}
                alt={item.title}
                className="size-16 rounded-lg object-cover"
              />
              {isManager && (
                <ConfirmDialog
                  triggerRender={
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      aria-label={`ลบรูปภาพที่ ${index + 1}`}
                      className="absolute -top-1.5 -right-1.5 size-5 rounded-full opacity-100 shadow-sm md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
                    />
                  }
                  triggerContent={<X className="size-3" />}
                  title="ยืนยันการลบรูปภาพ"
                  description={`ต้องการลบรูปภาพนี้ออกจาก "${item.title}" ใช่หรือไม่?`}
                  confirmLabel="ลบรูปภาพ"
                  successMessage="ลบรูปภาพเรียบร้อยแล้ว"
                  destructive
                  onConfirm={() =>
                    removeChecklistItemPhotoAction(projectId, item.id, photo.id)
                  }
                />
              )}
            </div>
          ))}
          {isManager && (
            <>
              <input
                ref={fileInputEl}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoChange}
              />
              <button
                type="button"
                disabled={isPending}
                onClick={() => fileInputEl.current?.click()}
                className="flex h-16 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-outline-variant bg-surface-container text-on-surface-variant transition-all hover:border-primary hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ImagePlus className="size-4 text-primary" />
                <span className="text-[9px] leading-none font-medium">
                  {isPending ? 'กำลังอัปโหลด...' : 'อัปโหลดภาพใหม่'}
                </span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
