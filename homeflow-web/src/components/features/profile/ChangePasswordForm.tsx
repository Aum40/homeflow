'use client';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { changePasswordAction } from '@/lib/actions/user.action';
import {
  ChangePasswordInput,
  changePasswordSchema
} from '@/lib/schemas/user.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';

export default function ChangePasswordForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { control, handleSubmit, setError, reset } =
    useForm<ChangePasswordInput>({
      resolver: zodResolver(changePasswordSchema),
      defaultValues: {
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }
    });

  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: ChangePasswordInput) => {
    setSuccessMessage(null);
    startTransition(async () => {
      const result = await changePasswordAction(data);
      if (result?.success === false) {
        setError('currentPassword', { message: result.message });
      } else {
        setSuccessMessage('เปลี่ยนรหัสผ่านสำเร็จ');
        reset();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Controller
          control={control}
          name="currentPassword"
          render={({ field, fieldState }) => (
            <Field className="gap-1" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>รหัสผ่านปัจจุบัน</FieldLabel>
              <Input
                type="password"
                id={field.name}
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            control={control}
            name="newPassword"
            render={({ field, fieldState }) => (
              <Field className="gap-1" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>รหัสผ่านใหม่</FieldLabel>
                <Input
                  type="password"
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
            name="confirmNewPassword"
            render={({ field, fieldState }) => (
              <Field className="gap-1" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  ยืนยันรหัสผ่านใหม่
                </FieldLabel>
                <Input
                  type="password"
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
            {isPending ? 'กำลังเปลี่ยนรหัสผ่าน...' : 'เปลี่ยนรหัสผ่าน'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
