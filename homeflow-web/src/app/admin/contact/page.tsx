import CompanyContactForm from '@/components/features/contact/CompanyContactForm';
import { CompanyContactApi } from '@/lib/api/company-contact.api';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ข้อมูลติดต่อบริษัท'
};

export const dynamic = 'force-dynamic';

export default async function AdminContactPage() {
  const contact = await CompanyContactApi.get();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-on-background">
          ข้อมูลติดต่อบริษัท
        </h1>
        <p className="text-sm text-on-surface-variant">
          ข้อมูลนี้จะแสดงในหน้า &quot;ติดต่อเรา&quot; ที่ลูกค้าเห็น
        </p>
      </div>
      <CompanyContactForm contact={contact} />
    </div>
  );
}
