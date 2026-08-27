'use client';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { updateProfileAction } from '@/lib/actions/user.action';
import {
  UpdateProfileInput,
  updateProfileSchema
} from '@/lib/schemas/user.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';

export default function EditProfileForm({
  firstName,
  lastName
}: {
  firstName: string;
  lastName: string;
}) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { control, handleSubmit } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { firstName, lastName }
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: UpdateProfileInput) => {
    setSuccessMessage(null);
    startTransition(async () => {
      const result = await updateProfileAction(data);
      if (!result || result.success !== false) {
        setSuccessMessage('บันทึกข้อมูลสำเร็จ');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            control={control}
            name="firstName"
            render={({ field, fieldState }) => (
              <Field className="gap-1" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>ชื่อจริง</FieldLabel>
                <Input
                  id={field.name}
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field, fieldState }) => (
              <Field className="gap-1" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>นามสกุล</FieldLabel>
                <Input
                  id={field.name}
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
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
