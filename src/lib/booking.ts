import type { PackageType } from '@prisma/client';

/** GSI-YYYY-XXXXX (Master Plan §17) */
export function generateBookingRef(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 5; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `GSI-${year}-${suffix}`;
}

/** Price per person (Master Plan §18). Client to confirm. */
export const PACKAGE_PRICES: Record<PackageType, number> = {
  STARTER: 895,
  CLASSIC: 1195,
  PREMIUM: 1795,
  CUSTOM: 1195,
};

const DEPOSIT_PERCENT = 20;

export function getDepositAmount(totalCents: number): number {
  return Math.round((totalCents * DEPOSIT_PERCENT) / 100);
}

export function getBalanceDueDate(bookingDate: Date): Date {
  const d = new Date(bookingDate);
  d.setDate(d.getDate() + 14);
  return d;
}
