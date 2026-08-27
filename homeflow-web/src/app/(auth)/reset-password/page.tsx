import ResetPasswordForm from '@/components/features/auth/ResetPasswordForm';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AuthApi } from '@/lib/api/auth.api';
import { AlertCircle } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ตั้งรหัสผ่านใหม่'
};

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const isValid = token
    ? (await AuthApi.verifyResetToken(token)).valid
    : false;

  return (
    <div className="relative w-full max-w-md p-4">
      <div className="overflow-hidden rounded-xl bg-card shadow-[0_10px_25px_-5px_rgba(48,101,118,0.12)]">
        <div className="h-1 w-full bg-tertiary" />

        <div className="p-6 md:p-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-on-background md:text-3xl">
              ตั้งรหัสผ่านใหม่
            </h1>
            <p className="mt-2 text-sm text-on-surface-variant md:text-base">
              กรอกรหัสผ่านใหม่ของคุณด้านล่าง
            </p>
          </div>

          {isValid && token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <div className="flex flex-col gap-4">
              <Alert
                variant="destructive"
                className="border-destructive bg-destructive/15"
              >
                <AlertCircle />
                <AlertTitle>
                  ลิงก์นี้หมดอายุหรือไม่ถูกต้องแล้ว กรุณาขอลิงก์ใหม่อีกครั้ง
                </AlertTitle>
              </Alert>
              <Button
                nativeButton={false}
                render={<Link href="/forgot-password">ขอลิงก์ใหม่</Link>}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
