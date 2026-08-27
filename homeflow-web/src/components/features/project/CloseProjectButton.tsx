'use client';

import SuccessCheckmark from '@/components/shared/SuccessCheckmark';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { CheckCircle2 } from 'lucide-react';
import { closeProjectAction } from '@/lib/actions/project.action';
import { useState, useTransition } from 'react';

const GREEN_BUTTON_CLASSES =
  'bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500';

export default function CloseProjectButton({
  projectId,
  progressPercent
}: {
  projectId: string;
  progressPercent: number;
}) {
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canConfirm = progressPercent >= 100;

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await closeProjectAction(projectId);
      if (result?.success === false) {
        setError(result.message);
        return;
      }
      setShowSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setShowSuccess(false);
      }, 1600);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return;
        setOpen(next);
        if (next) {
          setError(null);
          setShowSuccess(false);
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            className={GREEN_BUTTON_CLASSES}
            disabled={!canConfirm}
            title={
              canConfirm
                ? undefined
                : 'ต้องทำเช็คลิสต์ความคืบหน้าให้ครบ 100% ก่อนจึงจะกดเสร็จสิ้นการก่อสร้างได้'
            }
          />
        }
      >
        <CheckCircle2 className="mr-1 size-4" />
        เสร็จสิ้นการก่อสร้าง
      </DialogTrigger>
      <DialogContent>
        {showSuccess ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <SuccessCheckmark className="size-16 text-green-600" />
            <p className="text-lg font-bold text-on-surface">
              เสร็จสิ้นการก่อสร้างเรียบร้อยแล้ว
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>ยืนยันเสร็จสิ้นการก่อสร้าง</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-on-surface-variant">
              ยืนยันว่าโครงการนี้เสร็จสิ้นแล้วใช่หรือไม่?
              ระบบจะบันทึกวันที่ปิดโครงการเป็นวันนี้ทันที
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                ยกเลิก
              </Button>
              <Button
                className={GREEN_BUTTON_CLASSES}
                onClick={handleConfirm}
                disabled={isPending}
              >
                {isPending ? 'กำลังบันทึก...' : 'ยืนยัน'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
