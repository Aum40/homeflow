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
import { resetPasswordAction } from '@/lib/actions/auth.action';
import {
  ResetPasswordInput,
  resetPasswordSchema
} from '@/lib/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';

export default function ResetPasswordForm({ token }: { token: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: '', confirmPassword: '' }
  });
  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: ResetPasswordInput) => {
    startTransition(async () => {
      const result = await resetPasswordAction(data);
      if (result?.success === false) {
        setError('root', { message: result.message });
      }
    });
  };

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
          name="token"
          render={({ field }) => <input type="hidden" {...field} />}
        />
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <Field className="gap-2" data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor={field.name}
                className="flex items-center gap-2 text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">
                  lock
                </span>
                รหัสผ่านใหม่
              </FieldLabel>
              <div className="relative">
                <Input
                  placeholder=""
                  type={showPassword ? 'text' : 'password'}
                  id={field.name}
                  {...field}
                  aria-invalid={fieldState.invalid}
                  className="pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-outline hover:text-on-surface"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <Field className="gap-2" data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor={field.name}
                className="flex items-center gap-2 text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">
                  verified_user
                </span>
                ยืนยันรหัสผ่านใหม่
              </FieldLabel>
              <div className="relative">
                <Input
                  placeholder=""
                  type={showConfirmPassword ? 'text' : 'password'}
                  id={field.name}
                  {...field}
                  aria-invalid={fieldState.invalid}
                  className="pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={
                    showConfirmPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'
                  }
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-outline hover:text-on-surface"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
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
            {isPending ? 'กำลังบันทึก...' : 'ตั้งรหัสผ่านใหม่'}
          </Button>
        </Field>
        <div className="text-center text-sm text-on-surface-variant">
          <Button
            variant="link"
            className="h-auto p-0 text-secondary"
            nativeButton={false}
            render={<Link href="/login">กลับไปหน้าเข้าสู่ระบบ</Link>}
          />
        </div>
      </FieldGroup>
    </form>
  );
}
