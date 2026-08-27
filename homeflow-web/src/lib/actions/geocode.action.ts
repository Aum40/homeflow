'use server';

import { auth } from '@/lib/auth';

export type GeocodeResult = {
  displayName: string;
  lat: number;
  lng: number;
};

export async function searchLocationAction(
  query: string
): Promise<GeocodeResult[]> {
  const session = await auth();
  if (!session?.user) return [];

  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'json');
  url.searchParams.set('q', trimmed);
  url.searchParams.set('limit', '5');
  url.searchParams.set('accept-language', 'th');

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Homeflow-App/1.0 (internal house-construction tracker)'
    }
  });

  if (!response.ok) {
    return [];
  }

  const data: { display_name: string; lat: string; lon: string }[] =
    await response.json();

  return data.map((item) => ({
    displayName: item.display_name,
    lat: Number(item.lat),
    lng: Number(item.lon)
  }));
}
