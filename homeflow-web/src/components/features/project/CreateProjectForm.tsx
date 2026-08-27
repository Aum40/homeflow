'use client';

import ImageWithPlaceholder from '@/components/shared/ImageWithPlaceholder';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import CustomerCombobox from './CustomerCombobox';
import { createProjectAction } from '@/lib/actions/project.action';
import { HouseDesignResponse, UserResponse } from '@/lib/api/api.type';
import {
  CreateProjectInput,
  createProjectSchema
} from '@/lib/schemas/project.schema';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import dynamic from 'next/dynamic';
import { useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';

const LocationMapPicker = dynamic(
  () => import('./LocationMapPicker'),
  { ssr: false }
);

function formatCurrency(value: string) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0
  }).format(Number(value));
}

export default function CreateProjectForm({
  customers,
  houseDesigns
}: {
  customers: UserResponse[];
  houseDesigns: HouseDesignResponse[];
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { control, handleSubmit, setValue, watch } =
    useForm<CreateProjectInput>({
      resolver: zodResolver(createProjectSchema),
      defaultValues: {
        customerId: '',
        houseDesignId: '',
        projectName: '',
        location: '',
        latitude: undefined,
        longitude: undefined,
        description: ''
      }
    });

  const latitude = watch('latitude');
  const longitude = watch('longitude');

  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: CreateProjectInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await createProjectAction(data);
      if (result?.success === false) {
        setErrorMessage(result.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-6">
        <Controller
          control={control}
          name="customerId"
          render={({ field, fieldState }) => (
            <Field className="gap-1" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>ลูกค้า</FieldLabel>
              {customers.length === 0 ? (
                <p className="text-sm text-on-surface-variant">
                  ยังไม่มีลูกค้าลงทะเบียนในระบบ
                </p>
              ) : (
                <CustomerCombobox
                  id={field.name}
                  customers={customers}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="houseDesignId"
          render={({ field, fieldState }) => (
            <Field className="gap-2" data-invalid={fieldState.invalid}>
              <FieldLabel>เลือกแบบบ้าน</FieldLabel>
              {houseDesigns.length === 0 ? (
                <p className="text-sm text-on-surface-variant">
                  ยังไม่มีแบบบ้านให้เลือกในขณะนี้ กรุณาติดต่อทีมงาน
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {houseDesigns.map((design) => {
                    const selected = field.value === design.id;

                    return (
                      <button
                        key={design.id}
                        type="button"
                        onClick={() => field.onChange(design.id)}
                        className={cn(
                          'flex flex-col overflow-hidden rounded-xl border-2 text-left transition-all',
                          selected
                            ? 'border-primary shadow-md'
                            : 'border-outline-variant hover:border-primary/50'
                        )}
                      >
                        <ImageWithPlaceholder
                          src={design.imageUrl}
                          alt={design.name}
                          className="aspect-video w-full"
                        />
                        <div className="p-4">
                          <h3 className="font-bold text-on-surface">
                            {design.name}
                          </h3>
                          {design.description && (
                            <p className="mt-1 text-sm text-on-surface-variant">
                              {design.description}
                            </p>
                          )}
                          <p className="mt-2 text-sm font-bold text-primary">
                            เริ่มต้น {formatCurrency(design.basePrice)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="projectName"
          render={({ field, fieldState }) => (
            <Field className="gap-1" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>ชื่อโครงการ</FieldLabel>
              <Input
                placeholder="เช่น บ้านพักอาศัย หัวหิน"
                id={field.name}
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="location"
          render={({ field, fieldState }) => (
            <Field className="gap-1" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>ที่ตั้ง</FieldLabel>
              <Input
                placeholder="เช่น เชียงใหม่"
                id={field.name}
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field className="gap-2">
          <FieldLabel>ปักหมุดตำแหน่งบนแผนที่ (ไม่บังคับ)</FieldLabel>
          <LocationMapPicker
            latitude={latitude ?? null}
            longitude={longitude ?? null}
            onChange={(lat, lng) => {
              setValue('latitude', lat);
              setValue('longitude', lng);
            }}
          />
          {latitude !== undefined && longitude !== undefined && (
            <p className="text-xs text-on-surface-variant">
              พิกัด: {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          )}
        </Field>

        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <Field className="gap-1" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>รายละเอียดเพิ่มเติม</FieldLabel>
              <Input
                placeholder="ระบุความต้องการเพิ่มเติม (ถ้ามี)"
                id={field.name}
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field>
          {errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}
          <Button type="submit" disabled={isPending} className="w-fit">
            {isPending ? 'กำลังสร้างโครงการ...' : 'สร้างโครงการ'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
