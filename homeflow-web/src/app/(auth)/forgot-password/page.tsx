import ForgotPasswordForm from '@/components/features/auth/ForgotPasswordForm';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ลืมรหัสผ่าน'
};

export default function ForgotPasswordPage() {
  return (
    <div className="relative w-full max-w-md p-4">
      <div className="overflow-hidden rounded-xl bg-card shadow-[0_10px_25px_-5px_rgba(48,101,118,0.12)]">
        <div className="h-1 w-full bg-tertiary" />

        <div className="p-6 md:p-10">
          <div className="-ml-4 -mt-2 mb-4">
            <Button
              className="size-10 rounded-full"
              variant="ghost"
              nativeButton={false}
              render={
                <Link href="/login">
                  <ChevronLeft />
                </Link>
              }
            />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-on-background md:text-3xl">
              ลืมรหัสผ่าน?
            </h1>
            <p className="mt-2 text-sm text-on-surface-variant md:text-base">
              กรอกอีเมลของคุณ เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้
            </p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
