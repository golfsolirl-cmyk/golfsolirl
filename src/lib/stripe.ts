import Stripe from 'stripe';

export const stripe =
  process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;
