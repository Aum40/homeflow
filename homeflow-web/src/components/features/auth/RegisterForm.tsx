'use client';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { registerAction } from '@/lib/actions/auth.action';
import PasswordRequirements from './PasswordRequirements';
import { RegisterInput, registerSchema } from '@/lib/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { control, handleSubmit, setError } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      nickName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: RegisterInput) => {
    startTransition(async () => {
      const { code, message } = await registerAction(data);
      if (code === 'EMAIL_ALREADY_EXISTS') {
        setError('email', { message });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className='gap-6'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {/* First name */}
          <Controller
            control={control}
            name='firstName'
            render={({ field, fieldState }) => (
              <Field className='gap-2' data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className='flex items-center gap-2 text-on-surface'
                >
                  <span className='material-symbols-outlined text-sm'>
                    person
                  </span>
                  ชื่อจริง (First Name)
                </FieldLabel>
                <Input
                  placeholder='Firstname'
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
          {/* Last name */}
          <Controller
            control={control}
            name='lastName'
            render={({ field, fieldState }) => (
              <Field className='gap-2' data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className='flex items-center gap-2 text-on-surface'
                >
                  <span className='material-symbols-outlined text-sm'>
                    person
                  </span>
                  นามสกุล (Last Name)
                </FieldLabel>
                <Input
                  placeholder='Lastname'
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
          {/* Nick Name */}
          <Controller
            control={control}
            name='nickName'
            render={({ field, fieldState }) => (
              <Field className='gap-2' data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className='flex items-center gap-2 text-on-surface'
                >
                  <span className='material-symbols-outlined text-sm'>
                    person
                  </span>
                  ชื่อเล่น (Nick Name)
                </FieldLabel>
                <Input
                  placeholder='nickname'
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
        {/* Email */}
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
                อีเมล (Email)
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
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {/* Password */}
          <Controller
            control={control}
            name='password'
            render={({ field, fieldState }) => (
              <Field className='gap-2' data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className='flex items-center gap-2 text-on-surface'
                >
                  <span className='material-symbols-outlined text-sm'>
                    lock
                  </span>
                  รหัสผ่าน (Password)
                </FieldLabel>
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
                <PasswordRequirements value={field.value} className='mt-1' />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          {/* Confirm password */}
          <Controller
            control={control}
            name='confirmPassword'
            render={({ field, fieldState }) => (
              <Field className='gap-2' data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className='flex items-center gap-2 text-on-surface'
                >
                  <span className='material-symbols-outlined text-sm'>
                    verified_user
                  </span>
                  ยืนยันรหัสผ่าน (Confirm)
                </FieldLabel>
                <div className='relative'>
                  <Input
                    placeholder=''
                    type={showConfirmPassword ? 'text' : 'password'}
                    id={field.name}
                    {...field}
                    aria-invalid={fieldState.invalid}
                    className='pr-10'
                  />
                  <button
                    type='button'
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={
                      showConfirmPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'
                    }
                    className='absolute top-1/2 right-2.5 -translate-y-1/2 text-outline hover:text-on-surface'
                  >
                    {showConfirmPassword ? (
                      <EyeOff className='size-4' />
                    ) : (
                      <Eye className='size-4' />
                    )}
                  </button>
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
        {/* Submit button */}
        <Field className='pt-2'>
          <Button
            type='submit'
            className='group h-auto justify-center gap-3 rounded-lg py-4 text-base font-semibold'
            disabled={isPending}
          >
            {isPending ? 'กำลังสร้างบัญชี...' : 'ลงทะเบียน'}
            <ArrowRight className='transition-transform group-hover:translate-x-1' />
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
