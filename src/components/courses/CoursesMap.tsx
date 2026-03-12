'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { COURSES_MAP } from '@/lib/courses-data';
import Link from 'next/link';

const COSTA_DEL_SOL_CENTER: [number, number] = [36.5, -4.9];
const ZOOM = 10;

export function CoursesMap() {
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);
  return (
    <MapContainer
      center={COSTA_DEL_SOL_CENTER}
      zoom={ZOOM}
      className="w-full h-[400px] md:h-[500px] rounded-2xl z-0"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {COURSES_MAP.map((course) => (
        <Marker key={course.name} position={[course.lat, course.lng]}>
          <Popup>
            <div className="min-w-[180px]">
              <p className="font-display font-bold text-primary">{course.name}</p>
              <p className="text-sm text-muted">Par {course.par} · {course.holes} holes · {course.town}</p>
              <Link
                href={`/booking?course=${encodeURIComponent(course.name)}`}
                className="mt-2 inline-block text-sm font-bold text-primary hover:underline"
              >
                Add to package →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
