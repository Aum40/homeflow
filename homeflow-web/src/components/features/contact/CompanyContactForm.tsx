'use client';

import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { updateCompanyContactAction } from '@/lib/actions/company-contact.action';
import { CompanyContactResponse } from '@/lib/api/api.type';
import {
  UpdateCompanyContactInput,
  updateCompanyContactSchema
} from '@/lib/schemas/company-contact.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';

const LocationMapPicker = dynamic(
  () => import('@/components/features/project/LocationMapPicker'),
  { ssr: false }
);

const TEXT_FIELDS = [
  { name: 'companyName', label: 'ชื่อบริษัท' },
  { name: 'address', label: 'ที่อยู่' },
  { name: 'phone', label: 'เบอร์โทรศัพท์' },
  { name: 'email', label: 'อีเมล' },
  { name: 'businessHours', label: 'เวลาทำการ' },
  { name: 'lineId', label: 'Line ID' },
  { name: 'facebook', label: 'Facebook' }
] as const;

export default function CompanyContactForm({
  contact
}: {
  contact: CompanyContactResponse;
}) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors }
  } = useForm<UpdateCompanyContactInput>({
    resolver: zodResolver(updateCompanyContactSchema),
    // API คืน null ได้ แต่ input ของ react-hook-form ต้องการสตริง
    defaultValues: {
      companyName: contact.companyName ?? '',
      address: contact.address ?? '',
      phone: contact.phone ?? '',
      email: contact.email ?? '',
      businessHours: contact.businessHours ?? '',
      lineId: contact.lineId ?? '',
      facebook: contact.facebook ?? '',
      latitude: contact.latitude ? Number(contact.latitude) : null,
      longitude: contact.longitude ? Number(contact.longitude) : null
    }
  });

  const [isPending, startTransition] = useTransition();

  const latitude = watch('latitude') ?? null;
  const longitude = watch('longitude') ?? null;

  const onSubmit = (data: UpdateCompanyContactInput) => {
    setSuccessMessage(null);
    startTransition(async () => {
      const result = await updateCompanyContactAction(data);
      if (result?.success === false) {
        setError('root', { message: result.message });
        return;
      }
      setSuccessMessage('บันทึกข้อมูลติดต่อเรียบร้อยแล้ว');
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        {errors.root && (
          <Alert
            variant="destructive"
            className="border-destructive bg-destructive/15"
          >
            <AlertCircle />
            <AlertTitle>{errors.root.message}</AlertTitle>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {TEXT_FIELDS.map(({ name, label }) => (
            <Controller
              key={name}
              control={control}
              name={name}
              render={({ field, fieldState }) => (
                <Field className="gap-1" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                  <Input
                    id={field.name}
                    {...field}
                    value={field.value ?? ''}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          ))}
        </div>

        <Field className="gap-2">
          <FieldLabel>ตำแหน่งบนแผนที่</FieldLabel>
          <p className="text-sm text-on-surface-variant">
            คลิกบนแผนที่เพื่อปักหมุด แล้วกดบันทึกด้านล่าง
          </p>
          {/* ตั้งค่าลงในฟอร์มเท่านั้น ไม่บันทึกทันที เพราะฟอร์มนี้มีปุ่มบันทึกเดียว */}
          <LocationMapPicker
            latitude={latitude}
            longitude={longitude}
            onChange={(lat, lng) => {
              setValue('latitude', lat, { shouldDirty: true });
              setValue('longitude', lng, { shouldDirty: true });
            }}
          />
        </Field>

        <Field>
          {successMessage && (
            <p className="text-sm text-on-primary-container">
              {successMessage}
            </p>
          )}
          <Button type="submit" disabled={isPending} className="w-fit">
            {isPending ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
