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
import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';

type ActionResult = { success: false; message: string } | void;

export default function ConfirmDialog({
  triggerRender,
  triggerContent,
  title,
  description,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  successMessage,
  destructive = false,
  onConfirm
}: {
  /** ปุ่มที่ใช้เปิดกล่อง เช่น <Button variant="ghost" size="icon-sm" /> */
  triggerRender: React.ReactElement;
  /** เนื้อหาข้างในปุ่ม เช่น ไอคอน */
  triggerContent?: React.ReactNode;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** ถ้าใส่ จะโชว์เครื่องหมายถูกพร้อมข้อความนี้ก่อนปิดกล่อง */
  successMessage?: string;
  destructive?: boolean;
  onConfirm: () => Promise<ActionResult>;
}) {
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // กันการ setState หลัง unmount (แถวอาจหายไปหลังลบสำเร็จ)
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await onConfirm();

      if (result?.success === false) {
        if (mountedRef.current) setError(result.message);
        return;
      }

      if (!successMessage) {
        if (mountedRef.current) setOpen(false);
        return;
      }

      if (mountedRef.current) setShowSuccess(true);
      setTimeout(() => {
        if (!mountedRef.current) return;
        setOpen(false);
        setShowSuccess(false);
      }, 1300);
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
      <DialogTrigger render={triggerRender}>{triggerContent}</DialogTrigger>
      <DialogContent>
        {showSuccess ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <SuccessCheckmark className="size-16 text-green-600" />
            <p className="text-lg font-bold text-on-surface">
              {successMessage}
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-on-surface-variant">{description}</p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                {cancelLabel}
              </Button>
              <Button
                variant={destructive ? 'destructive' : 'default'}
                onClick={handleConfirm}
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-1 size-4 animate-spin" />}
                {isPending ? 'กำลังดำเนินการ...' : confirmLabel}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
