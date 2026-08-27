'use client';

import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { removeMaterialAction } from '@/lib/actions/material.action';
import { MaterialResponse } from '@/lib/api/api.type';
import { Trash2 } from 'lucide-react';
import ImageWithPlaceholder from '@/components/shared/ImageWithPlaceholder';
import MaterialFormDialog from './MaterialFormDialog';

function formatPrice(price: string) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(Number(price));
}

export default function MaterialTable({
  materials
}: {
  materials: MaterialResponse[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <MaterialFormDialog />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium" />
              <th className="px-4 py-3 font-medium">ชื่อวัสดุ</th>
              <th className="px-4 py-3 font-medium">หมวดหมู่</th>
              <th className="px-4 py-3 font-medium">หน่วย</th>
              <th className="px-4 py-3 font-medium">ราคาต่อหน่วย</th>
              <th className="px-4 py-3 font-medium">คงเหลือ</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {materials.map((material) => {
              const lowStock = material.stock <= 10;

              return (
                <tr
                  key={material.id}
                  className="border-t border-border last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <ImageWithPlaceholder
                      src={material.imageUrl}
                      alt={material.name}
                      className="size-20 rounded-md border border-border"
                    />
                  </td>
                  <td className="px-4 py-3">{material.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {material.category}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {material.unit}
                  </td>
                  <td className="px-4 py-3">{formatPrice(material.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        lowStock ? 'font-semibold text-destructive' : ''
                      }
                    >
                      {material.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <MaterialFormDialog material={material} />
                      <ConfirmDialog
                        triggerRender={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="ลบวัสดุ"
                          />
                        }
                        triggerContent={
                          <Trash2 className="size-4 text-destructive" />
                        }
                        title="ยืนยันการลบวัสดุ"
                        description={`ต้องการลบวัสดุ "${material.name}" ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้`}
                        confirmLabel="ลบวัสดุ"
                        successMessage="ลบวัสดุเรียบร้อยแล้ว"
                        destructive
                        onConfirm={() => removeMaterialAction(material.id)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {materials.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  ยังไม่มีวัสดุในระบบ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
