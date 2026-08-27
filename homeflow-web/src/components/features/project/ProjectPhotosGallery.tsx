import { ChecklistItemResponse } from '@/lib/api/api.type';
import PhotoGalleryTile from './PhotoGalleryTile';

export default function ProjectPhotosGallery({
  items,
}: {
  items: ChecklistItemResponse[];
}) {
  const photos = items
    .flatMap((item) =>
      item.photos.map((photo) => ({ ...photo, title: item.title })),
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return (
    <section className='flex flex-col gap-4'>
      <h3 className='text-lg font-bold text-on-surface'>ภาพถ่ายทั้งหมดในงาน</h3>
      {photos.length === 0 ? (
        <p className='text-sm text-on-surface-variant'>
          ยังไม่มีภาพถ่ายภายในงานสำหรับโครงการนี้
        </p>
      ) : (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
          {photos.map((photo) => (
            <PhotoGalleryTile
              key={photo.id}
              imageUrl={photo.imageUrl}
              title={photo.title}
              createdAt={photo.createdAt}
            />
          ))}
        </div>
      )}
    </section>
  );
}
