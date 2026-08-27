'use client';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { toDownloadUrl } from '@/lib/utils';
import { Download } from 'lucide-react';

function formatDateShort(value: string) {
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(
    new Date(value),
  );
}

export default function PhotoGalleryTile({
  imageUrl,
  title,
  createdAt,
}: {
  imageUrl: string;
  title: string;
  createdAt: string;
}) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type='button'
            className='group relative aspect-video cursor-pointer overflow-hidden rounded-xl border border-outline-variant shadow-sm transition-all hover:shadow-lg'
          />
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title}
          className='size-full object-cover transition-transform duration-700 group-hover:scale-110'
        />
        <div className='absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
          <p className='text-sm font-bold text-white'>{title}</p>
          <p className='text-[10px] text-white/80'>
            {formatDateShort(createdAt)}
          </p>
        </div>
      </DialogTrigger>
      <DialogContent className='sm:max-w-2xl'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title}
          className='max-h-[70vh] w-full rounded-lg object-contain'
        />
        <div className='flex items-center justify-between'>
          <div>
            <p className='font-bold text-on-surface'>{title}</p>
            <p className='text-xs text-on-surface-variant'>
              {formatDateShort(createdAt)}
            </p>
          </div>
          <a
            href={toDownloadUrl(imageUrl)}
            className='flex w-fit items-center gap-2 text-sm font-bold text-primary hover:underline'
          >
            <Download className='size-4' />
            ดาวน์โหลด
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
