'use client';

import dynamic from 'next/dynamic';

const CoursesMap = dynamic(() => import('@/components/courses/CoursesMap').then((m) => ({ default: m.CoursesMap })), {
  ssr: false,
});

export function CoursesMapClient() {
  return <CoursesMap />;
}
