import ReadOnlyLocationMap from '@/components/shared/ReadOnlyLocationMap';
import { CompanyContactResponse } from '@/lib/api/api.type';
// lucide-react ไม่มีไอคอนแบรนด์ Facebook แล้ว ใช้ Globe แทน
import { Clock, Globe, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

function ContactRow({
  icon: Icon,
  label,
  children
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-xs text-outline uppercase">{label}</p>
        <div className="break-words text-on-surface">{children}</div>
      </div>
    </div>
  );
}

export default function CompanyContactDetails({
  contact
}: {
  contact: CompanyContactResponse;
}) {
  const latitude = contact.latitude ? Number(contact.latitude) : null;
  const longitude = contact.longitude ? Number(contact.longitude) : null;
  const hasCoordinates = latitude !== null && longitude !== null;

  const hasAnyDetail =
    contact.companyName ||
    contact.address ||
    contact.phone ||
    contact.email ||
    contact.businessHours ||
    contact.lineId ||
    contact.facebook ||
    hasCoordinates;

  if (!hasAnyDetail) {
    return (
      <p className="text-sm text-on-surface-variant">
        ยังไม่มีข้อมูลติดต่อ
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        {contact.companyName && (
          <h2 className="text-lg font-bold text-primary">
            {contact.companyName}
          </h2>
        )}

        {contact.address && (
          <ContactRow icon={MapPin} label="ที่อยู่">
            {contact.address}
          </ContactRow>
        )}

        {contact.phone && (
          <ContactRow icon={Phone} label="โทรศัพท์">
            <a href={`tel:${contact.phone}`} className="hover:underline">
              {contact.phone}
            </a>
          </ContactRow>
        )}

        {contact.email && (
          <ContactRow icon={Mail} label="อีเมล">
            <a href={`mailto:${contact.email}`} className="hover:underline">
              {contact.email}
            </a>
          </ContactRow>
        )}

        {contact.businessHours && (
          <ContactRow icon={Clock} label="เวลาทำการ">
            {contact.businessHours}
          </ContactRow>
        )}

        {contact.lineId && (
          <ContactRow icon={MessageCircle} label="Line ID">
            {contact.lineId}
          </ContactRow>
        )}

        {contact.facebook && (
          <ContactRow icon={Globe} label="Facebook">
            {contact.facebook}
          </ContactRow>
        )}
      </div>

      {hasCoordinates && (
        <div className="flex flex-col gap-3">
          <h2 className="font-bold text-on-surface">แผนที่</h2>
          <ReadOnlyLocationMap latitude={latitude} longitude={longitude} />
          {/* แผนที่แบบอ่านอย่างเดียวเลื่อน/ซูมไม่ได้ จึงต้องมีทางออกไปดูเส้นทางจริง */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-sm font-bold text-primary hover:underline"
          >
            เปิดใน Google Maps
          </a>
        </div>
      )}
    </div>
  );
}
