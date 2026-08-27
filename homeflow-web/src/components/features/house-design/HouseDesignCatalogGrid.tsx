import ImageWithPlaceholder from '@/components/shared/ImageWithPlaceholder';
import { formatCurrency } from '@/components/features/project/ProjectCard';
import { HouseDesignResponse } from '@/lib/api/api.type';
import Link from 'next/link';

export default function HouseDesignCatalogGrid({
  houseDesigns
}: {
  houseDesigns: HouseDesignResponse[];
}) {
  if (houseDesigns.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant">
        ยังไม่มีแบบบ้านในระบบ
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {houseDesigns.map((houseDesign) => (
        <Link
          key={houseDesign.id}
          href={`/house-designs/${houseDesign.id}`}
          className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm transition-all hover:shadow-md"
        >
          <ImageWithPlaceholder
            src={houseDesign.imageUrl}
            alt={houseDesign.name}
            className="aspect-[4/3] w-full"
          />
          <div className="flex flex-1 flex-col gap-1 p-4">
            <h3 className="font-bold text-on-surface">{houseDesign.name}</h3>
            {houseDesign.description && (
              <p className="line-clamp-2 text-sm text-on-surface-variant">
                {houseDesign.description}
              </p>
            )}
            <p className="mt-auto pt-2 text-sm font-bold text-primary">
              เริ่มต้น {formatCurrency(houseDesign.basePrice)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
