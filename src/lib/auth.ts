import type { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import EmailProvider from 'next-auth/providers/email';
import { prisma } from '@/lib/db';

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  const { Resend } = require('resend');
  return new Resend(process.env.RESEND_API_KEY);
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM ?? 'noreply@golfsolireland.com',
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const resend = getResend();
        if (resend) {
          await resend.emails.send({
            from: process.env.EMAIL_FROM ?? 'noreply@golfsolireland.com',
            to: email,
            subject: 'Sign in to Golf Sol Ireland',
            text: `Sign in by opening: ${url}\n\nLink valid for 24 hours.`,
          });
        }
      },
    }),
  ],
  session: { strategy: 'database', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/login' },
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
        (session.user as { role?: string }).role = (user as { role?: string }).role ?? 'USER';
      }
      return session;
    },
  },
  events: {
    createUser: async ({ user }) => {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: user.name ?? undefined },
      });
    },
  },
};
