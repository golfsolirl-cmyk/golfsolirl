export type NavItem = {
  label: string;
  href: string;
};

export type GolfPackage = {
  id: string;
  label: string;
  title: string;
  image: string;
  imageAlt: string;
  href: string;
};

export type Course = {
  name: string;
  description: string;
};

export type Accommodation = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

export type Testimonial = {
  quote: string;
  author: string;
  location: string;
  /** Optional avatar image URL (e.g. Unsplash or placeholder) */
  avatar?: string;
  /** Star rating 1–5; default 5 */
  stars?: number;
};

export type Step = {
  number: number;
  title: string;
};

export type ContactFormData = {
  name: string;
  email: string;
  message: string;
};

export type NewsletterFormData = {
  email: string;
};

export type ApiState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};
