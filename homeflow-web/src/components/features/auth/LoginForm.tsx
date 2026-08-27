'use client';

import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { loginAction } from '@/lib/actions/auth.action';
import { LoginInput, loginSchema } from '@/lib/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: LoginInput) => {
    startTransition(async () => {
      const { code, message } = await loginAction(data);
      if (code === 'INVALID_CREDENTIALS') {
        setError('root', { message });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className='gap-6'>
        {/* Alert error message */}
        {errors.root && (
          <Alert
            variant='destructive'
            className='border-destructive bg-destructive/15'
          >
            <AlertCircle />
            <AlertTitle>{errors.root.message}</AlertTitle>
          </Alert>
        )}

        {/* Email address */}
        <Controller
          control={control}
          name='email'
          render={({ field, fieldState }) => (
            <Field className='gap-2' data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor={field.name}
                className='flex items-center gap-2 text-on-surface'
              >
                <span className='material-symbols-outlined text-sm'>mail</span>
                อีเมล
              </FieldLabel>
              <Input
                type='email'
                placeholder='example@skyline.com'
                id={field.name}
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Password */}
        <Controller
          control={control}
          name='password'
          render={({ field, fieldState }) => (
            <Field className='gap-2' data-invalid={fieldState.invalid}>
              <div className='flex items-center justify-between'>
                <FieldLabel
                  htmlFor={field.name}
                  className='flex items-center gap-2 text-on-surface'
                >
                  <span className='material-symbols-outlined text-sm'>
                    lock
                  </span>
                  รหัสผ่าน
                </FieldLabel>
                <Button
                  variant='link'
                  className='h-auto p-0 text-label-sm text-sm text-secondary'
                  nativeButton={false}
                  render={<Link href='/forgot-password'>ลืมรหัสผ่าน?</Link>}
                />
              </div>
              <div className='relative'>
                <Input
                  placeholder=''
                  type={showPassword ? 'text' : 'password'}
                  id={field.name}
                  {...field}
                  aria-invalid={fieldState.invalid}
                  className='pr-10'
                />
                <button
                  type='button'
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  className='absolute top-1/2 right-2.5 -translate-y-1/2 text-outline hover:text-on-surface'
                >
                  {showPassword ? (
                    <EyeOff className='size-4' />
                  ) : (
                    <Eye className='size-4' />
                  )}
                </button>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {/* Submit button */}
        <Field>
          <Button
            type='submit'
            className='h-auto rounded-lg py-4 text-base font-semibold'
            disabled={isPending}
          >
            {isPending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
