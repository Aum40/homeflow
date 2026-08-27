'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { searchLocationAction, GeocodeResult } from '@/lib/actions/geocode.action';
import { Loader2, Search } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents
} from 'react-leaflet';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const DEFAULT_CENTER: [number, number] = [13.7563, 100.5018];

function ClickHandler({
  onSelect
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

function FlyToPosition({
  latitude,
  longitude
}: {
  latitude: number | null;
  longitude: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      map.flyTo([latitude, longitude], 15);
    }
  }, [latitude, longitude, map]);

  return null;
}

function LocationSearchBox({
  onSelect
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = () => {
    startTransition(async () => {
      const found = await searchLocationAction(query);
      setResults(found);
    });
  };

  return (
    <div className="relative z-1000 mb-2">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder="ค้นหาสถานที่ เช่น ชื่อหมู่บ้าน ตำบล อำเภอ"
          className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={isPending}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
        </button>
      </div>
      {results.length > 0 && (
        <ul className="absolute mt-1 w-full overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-md">
          {results.map((result, index) => (
            <li key={index}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-surface-container"
                onClick={() => {
                  onSelect(result.lat, result.lng);
                  setResults([]);
                  setQuery(result.displayName);
                }}
              >
                {result.displayName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function LocationMapPicker({
  latitude,
  longitude,
  onChange,
  readOnly = false
}: {
  latitude: number | null;
  longitude: number | null;
  onChange?: (lat: number, lng: number) => void;
  readOnly?: boolean;
}) {
  const hasPosition = latitude !== null && longitude !== null;
  const center: [number, number] = hasPosition
    ? [latitude, longitude]
    : DEFAULT_CENTER;

  return (
    <div>
      {!readOnly && onChange && <LocationSearchBox onSelect={onChange} />}
      <div className="relative isolate h-64 w-full overflow-hidden rounded-lg border border-outline-variant">
        <MapContainer
          center={center}
          zoom={hasPosition ? 15 : 6}
          scrollWheelZoom={!readOnly}
          dragging={!readOnly}
          touchZoom={!readOnly}
          doubleClickZoom={!readOnly}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {!readOnly && onChange && <ClickHandler onSelect={onChange} />}
          <FlyToPosition latitude={latitude} longitude={longitude} />
          {hasPosition && <Marker position={[latitude, longitude]} />}
        </MapContainer>
      </div>
    </div>
  );
}
