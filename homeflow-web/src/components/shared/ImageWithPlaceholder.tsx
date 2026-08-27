import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';

export default function ImageWithPlaceholder({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (src) {
    /* eslint-disable-next-line @next/next/no-img-element */
    return (
      <img src={src} alt={alt} className={cn('object-cover', className)} />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-surface-container text-outline',
        className,
      )}
      title='ยังไม่มีรูปภาพ'
    >
      <HelpCircle className='size-1/2' />
    </div>
  );
}
