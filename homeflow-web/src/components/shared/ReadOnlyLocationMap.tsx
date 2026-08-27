'use client';

import dynamic from 'next/dynamic';

const LocationMapPicker = dynamic(
  () => import('@/components/features/project/LocationMapPicker'),
  { ssr: false }
);

export default function ReadOnlyLocationMap({
  latitude,
  longitude
}: {
  latitude: number | null;
  longitude: number | null;
}) {
  return (
    <LocationMapPicker latitude={latitude} longitude={longitude} readOnly />
  );
}
