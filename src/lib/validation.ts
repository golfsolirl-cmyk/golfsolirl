import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Please enter a valid email'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
});

export const newsletterFormSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

export type ContactFormSchema = z.infer<typeof contactFormSchema>;
export type NewsletterFormSchema = z.infer<typeof newsletterFormSchema>;
