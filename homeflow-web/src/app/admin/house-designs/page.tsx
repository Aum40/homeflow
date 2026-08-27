import HouseDesignTable from '@/components/features/house-design/HouseDesignTable';
import { HouseDesignApi } from '@/lib/api/house-design.api';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'จัดการแบบบ้าน'
};

export const dynamic = 'force-dynamic';

export default async function AdminHouseDesignsPage() {
  const houseDesigns = await HouseDesignApi.getAll();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          จัดการแบบบ้าน
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          เพิ่ม แก้ไข และลบแบบบ้านสำเร็จรูปให้ลูกค้าเลือกตอนส่งคำขอ
        </p>
      </div>
      <HouseDesignTable houseDesigns={houseDesigns} />
    </div>
  );
}
