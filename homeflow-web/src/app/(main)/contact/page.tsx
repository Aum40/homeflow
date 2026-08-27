import CompanyContactDetails from '@/components/features/contact/CompanyContactDetails';
import { CompanyContactApi } from '@/lib/api/company-contact.api';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ติดต่อเรา'
};

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const contact = await CompanyContactApi.get();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-on-background">ติดต่อเรา</h1>
        <p className="text-sm text-on-surface-variant">
          ช่องทางติดต่อและที่ตั้งของบริษัท
        </p>
      </div>
      <CompanyContactDetails contact={contact} />
    </div>
  );
}
