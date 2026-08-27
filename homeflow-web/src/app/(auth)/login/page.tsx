import homeflowIcon from '@/app/icon.png';
import LoginForm from '@/components/features/auth/LoginForm';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ',
};

export default function LoginPage() {
  return (
    <div className='flex min-h-screen w-full overflow-hidden'>
      {/* Left side: visual narrative (desktop split) */}
      <div className='relative hidden items-center justify-center overflow-hidden bg-primary p-gutter-desktop lg:flex lg:w-1/2'>
        <div className='absolute inset-0 z-0'>
          <div
            className='h-full w-full bg-cover bg-center opacity-40'
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCkrVeZiMC7174fTZBfUMFsR9Vj7_UIz7dCmujHvRHnK8YKNEp4o93yqqV7Q8xjE4YZlTa8owXbbYZ6x3k7PQqdxt-0LPfamt4lXK5HJzmv-n11-P0zsqSF_y8xQ-n3dFPUFFaEV1fmiOUXPzEKJrPAp4RTPzaFRJS1NNKs7FvGpkzWNg4Qln9lY-QGq9_L3qjKTH3KbziUdvQ4cCXnCSRFlf_X9D8ob149FKtyzI8c1igkbe2Hwe859s4cLPtsnRSgM02ZDXf7pRdp')",
            }}
          />
        </div>
        <div className='relative z-10 max-w-lg text-on-primary text-amber-50'>
          <h1 className='mb-4 text-4xl leading-tight font-bold tracking-tight te'>
            มาตรฐานการสร้างบ้านแบบมืออาชีพ
          </h1>
          <p className='text-lg leading-relaxed opacity-80'>
            Homeflow มอบความน่าเชื่อถือและความโปร่งใสให้กับคุณ
            <br />
            ซื้อบ้านสำเร็จรูปพร้อมติดตามความคืบหน้าในการสร้าง
          </p>
          <div className='mt-12 flex space-x-6'>
            <div className='flex flex-col items-center'>
              <span className='text-xl font-semibold'>100%</span>
              <span className='text-xs tracking-wider opacity-70'>
                ความเชื่อถือ
              </span>
            </div>
            <div className='h-12 w-px bg-on-primary/20' />
            <div className='flex flex-col items-center'>
              <span className='text-xl font-semibold'>100%</span>
              <span className='text-xs tracking-wider opacity-70'>
                การติดตามงาน
              </span>
            </div>
            <div className='h-12 w-px bg-on-primary/20' />
            <div className='flex flex-col items-center'>
              <span className='text-xl font-semibold'>Professional</span>
              <span className='text-xs tracking-wider opacity-70'>
                มาตรฐานสากล
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: login form */}
      <div className='flex w-full items-center justify-center bg-surface-container-lowest p-gutter-mobile lg:w-1/2 md:p-gutter-desktop'>
        <div className='flex w-full max-w-md flex-col gap-8 rounded-xl p-10 shadow-[0_10px_25px_-5px_rgba(48,101,118,0.12)]'>
          {/* Brand identity */}
          <div className='mb-6 flex flex-col items-center text-center'>
            <Image
              src={homeflowIcon}
              alt='Homeflow'
              className='mb-4 size-16 rounded-xl md:size-20'
              priority
            />
            <h2 className='text-2xl font-bold text-primary'>ยินดีต้อนรับ</h2>
            <p className='mt-2 text-base text-on-surface-variant'>
              เข้าสู่ระบบ Homeflow เพื่อจัดการโครงการของคุณ
            </p>
          </div>

          {/* Divider */}
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-outline-variant' />
            </div>
            <div className='relative flex justify-center'></div>
          </div>

          {/* Login form */}
          <LoginForm />

          {/* Create new account */}
          <div className='text-center text-base text-on-surface-variant'>
            ยังไม่มีบัญชี?{' '}
            <Button
              variant='link'
              className='h-auto p-0 text-secondary'
              nativeButton={false}
              render={<Link href='/register'>สมัครได้ที่นี่</Link>}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
