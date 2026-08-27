import ImageWithPlaceholder from '@/components/shared/ImageWithPlaceholder';
import { formatCurrency } from '@/components/features/project/ProjectCard';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/api-error';
import { HouseDesignApi } from '@/lib/api/house-design.api';
import { ChevronLeft } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'รายละเอียดแบบบ้าน'
};

export default async function HouseDesignDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let houseDesign;
  try {
    houseDesign = await HouseDesignApi.getById(id);
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.statusCode === 404 || error.statusCode === 403)
    ) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit gap-1 px-2 text-on-surface-variant"
        nativeButton={false}
        render={
          <Link href="/">
            <ChevronLeft className="size-4" />
            กลับ
          </Link>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <ImageWithPlaceholder
          src={houseDesign.imageUrl}
          alt={houseDesign.name}
          className="aspect-video w-full"
        />
        <div className="flex flex-col gap-4 p-6">
          <div>
            <h1 className="text-2xl font-bold text-on-background">
              {houseDesign.name}
            </h1>
            <p className="mt-1 text-lg font-bold text-primary">
              เริ่มต้น {formatCurrency(houseDesign.basePrice)}
            </p>
          </div>

          {houseDesign.description && (
            <p className="text-on-surface-variant">{houseDesign.description}</p>
          )}

          {houseDesign.steps.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="font-bold text-on-surface">ขั้นตอนการก่อสร้าง</h2>
              <ol className="flex flex-col gap-2">
                {houseDesign.steps.map((step, index) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    <span className="text-on-surface-variant">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <Button
            className="w-fit"
            nativeButton={false}
            render={<Link href="/contact">สนใจแบบนี้ ติดต่อเรา</Link>}
          />
        </div>
      </div>
    </div>
  );
}
