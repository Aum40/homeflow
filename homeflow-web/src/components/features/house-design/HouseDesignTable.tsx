'use client';

import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { removeHouseDesignAction } from '@/lib/actions/house-design.action';
import { HouseDesignResponse } from '@/lib/api/api.type';
import { Trash2 } from 'lucide-react';
import ImageWithPlaceholder from '@/components/shared/ImageWithPlaceholder';
import HouseDesignFormDialog from './HouseDesignFormDialog';

function formatPrice(price: string) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(Number(price));
}

export default function HouseDesignTable({
  houseDesigns
}: {
  houseDesigns: HouseDesignResponse[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <HouseDesignFormDialog />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium" />
              <th className="px-4 py-3 font-medium">ชื่อแบบบ้าน</th>
              <th className="px-4 py-3 font-medium">รายละเอียด</th>
              <th className="px-4 py-3 font-medium">ราคาเริ่มต้น</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {houseDesigns.map((houseDesign) => (
              <tr
                key={houseDesign.id}
                className="border-t border-border last:border-b-0"
              >
                <td className="px-4 py-3">
                  <ImageWithPlaceholder
                    src={houseDesign.imageUrl}
                    alt={houseDesign.name}
                    className="size-20 rounded-md border border-border"
                  />
                </td>
                <td className="px-4 py-3">{houseDesign.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {houseDesign.description ?? '-'}
                </td>
                <td className="px-4 py-3">
                  {formatPrice(houseDesign.basePrice)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <HouseDesignFormDialog houseDesign={houseDesign} />
                    <ConfirmDialog
                      triggerRender={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="ลบแบบบ้าน"
                        />
                      }
                      triggerContent={
                        <Trash2 className="size-4 text-destructive" />
                      }
                      title="ยืนยันการลบแบบบ้าน"
                      description={`ต้องการลบแบบบ้าน "${houseDesign.name}" ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้`}
                      confirmLabel="ลบแบบบ้าน"
                      successMessage="ลบแบบบ้านเรียบร้อยแล้ว"
                      destructive
                      onConfirm={() => removeHouseDesignAction(houseDesign.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {houseDesigns.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  ยังไม่มีแบบบ้านในระบบ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
