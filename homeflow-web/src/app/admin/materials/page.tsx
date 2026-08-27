import MaterialTable from '@/components/features/material/MaterialTable';
import { MaterialApi } from '@/lib/api/material.api';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'จัดการวัสดุ'
};

export const dynamic = 'force-dynamic';

export default async function AdminMaterialsPage() {
  const materials = await MaterialApi.getAll();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          จัดการวัสดุ
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          เพิ่ม แก้ไข และลบวัสดุที่ใช้ในการก่อสร้าง รวมถึงติดตามสต็อกคงเหลือ
        </p>
      </div>
      <MaterialTable materials={materials} />
    </div>
  );
}
