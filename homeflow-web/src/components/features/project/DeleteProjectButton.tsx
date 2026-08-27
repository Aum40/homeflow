'use client';

import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { deleteProjectAction } from '@/lib/actions/project.action';
import { Trash2 } from 'lucide-react';

export default function DeleteProjectButton({
  projectId,
  projectName
}: {
  projectId: string;
  projectName: string;
}) {
  return (
    <ConfirmDialog
      triggerRender={
        <Button variant="outline" size="sm" aria-label="ลบโครงการ" />
      }
      triggerContent={
        <>
          <Trash2 className="mr-1 size-4 text-destructive" />
          ลบโครงการ
        </>
      }
      title="ยืนยันการลบโครงการ"
      description={`ต้องการลบ "${projectName}" ถาวรใช่หรือไม่? รายการความคืบหน้าและรูปภาพทั้งหมดจะถูกลบไปด้วย และไม่สามารถกู้คืนได้`}
      confirmLabel="ลบโครงการ"
      destructive
      onConfirm={() => deleteProjectAction(projectId)}
    />
  );
}
