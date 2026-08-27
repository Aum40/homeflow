'use client';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { toDownloadUrl } from '@/lib/utils';
import { Download } from 'lucide-react';

export default function PhotoThumbnail({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger
        render={<button type='button' className='block cursor-pointer' />}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={className} />
      </DialogTrigger>
      <DialogContent className='sm:max-w-2xl'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className='max-h-[70vh] w-full rounded-lg object-contain'
        />
        <a
          href={toDownloadUrl(src)}
          className='flex w-fit items-center gap-2 text-sm font-bold text-primary hover:underline'
        >
          <Download className='size-4' />
          ดาวน์โหลดรูปภาพ
        </a>
      </DialogContent>
    </Dialog>
  );
}
