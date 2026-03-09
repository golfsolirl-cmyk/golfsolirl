import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Your profile | ${SITE_NAME}`,
  description: 'Manage your Golf Sol Ireland profile and saved golf trip enquiries.',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
