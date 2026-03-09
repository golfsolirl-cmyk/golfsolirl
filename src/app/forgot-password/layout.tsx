import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Forgot password | ${SITE_NAME}`,
  description: 'Reset your Golf Sol Ireland account password.',
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
