'use client';

import { Button } from '@/components/ui/button';
import { updateProjectInfoAction } from '@/lib/actions/project.action';
import dynamic from 'next/dynamic';
import { useState, useTransition } from 'react';

const LocationMapPicker = dynamic(
  () => import('./LocationMapPicker'),
  { ssr: false }
);

export default function EditableProjectLocationMap({
  projectId,
  latitude,
  longitude
}: {
  projectId: string;
  latitude: number | null;
  longitude: number | null;
}) {
  const [pending, setPending] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const displayLatitude = pending?.lat ?? latitude;
  const displayLongitude = pending?.lng ?? longitude;

  const confirmPin = () => {
    if (!pending) return;
    setError(null);
    startTransition(async () => {
      const result = await updateProjectInfoAction(projectId, {
        latitude: pending.lat,
        longitude: pending.lng
      });
      if (result?.success === false) {
        setError(result.message);
        return;
      }
      setPending(null);
    });
  };

  const cancelPin = () => {
    setPending(null);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <LocationMapPicker
        latitude={displayLatitude}
        longitude={displayLongitude}
        onChange={(lat, lng) => setPending({ lat, lng })}
      />
      {pending && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={confirmPin}
            disabled={isPending}
            className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500"
          >
            {isPending ? 'กำลังบันทึก...' : 'ยืนยันตำแหน่ง'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={cancelPin}
            disabled={isPending}
          >
            ยกเลิก
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
