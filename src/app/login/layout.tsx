import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Sign in | ${SITE_NAME}`,
  description: 'Sign in to your Golf Sol Ireland account to manage enquiries and golf trip preferences.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
