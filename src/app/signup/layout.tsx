import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Create account | ${SITE_NAME}`,
  description: 'Register for Golf Sol Ireland updates and save your golf trip preferences.',
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
