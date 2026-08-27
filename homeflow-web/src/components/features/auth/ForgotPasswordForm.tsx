'use client';

import SuccessCheckmark from '@/components/shared/SuccessCheckmark';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { forgotPasswordAction } from '@/lib/actions/auth.action';
import {
  ForgotPasswordInput,
  forgotPasswordSchema
} from '@/lib/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';

export default function ForgotPasswordForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });
  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: ForgotPasswordInput) => {
    startTransition(async () => {
      const result = await forgotPasswordAction(data);
      if (result?.success === false) {
        setError('root', { message: result.message });
        return;
      }
      setShowSuccess(true);
    });
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <SuccessCheckmark className="size-16 text-green-600" />
        <p className="text-lg font-bold text-on-surface">
          ส่งอีเมลเรียบร้อยแล้ว
        </p>
        <p className="text-sm text-on-surface-variant">
          หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้แล้ว
          กรุณาตรวจสอบกล่องข้อความของคุณ (ลิงก์จะหมดอายุใน 15 นาที)
        </p>
        <Button
          variant="link"
          className="h-auto p-0 text-secondary"
          nativeButton={false}
          render={<Link href="/login">กลับไปหน้าเข้าสู่ระบบ</Link>}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-6">
        {errors.root && (
          <Alert
            variant="destructive"
            className="border-destructive bg-destructive/15"
          >
            <AlertCircle />
            <AlertTitle>{errors.root.message}</AlertTitle>
          </Alert>
        )}
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <Field className="gap-2" data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor={field.name}
                className="flex items-center gap-2 text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">
                  mail
                </span>
                อีเมล
              </FieldLabel>
              <Input
                type="email"
                placeholder="example@skyline.com"
                id={field.name}
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field>
          <Button
            type="submit"
            className="h-auto rounded-lg py-4 text-base font-semibold"
            disabled={isPending}
          >
            {isPending ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
