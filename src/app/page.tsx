import dynamic from 'next/dynamic';
import { Hero } from '@/components/sections/Hero';

const GolfPackages = dynamic(() => import('@/components/sections/GolfPackages').then((m) => ({ default: m.GolfPackages })), { ssr: true });
const RepeatHeadline = dynamic(() => import('@/components/sections/RepeatHeadline').then((m) => ({ default: m.RepeatHeadline })), { ssr: true });
const Statement = dynamic(() => import('@/components/sections/Statement').then((m) => ({ default: m.Statement })), { ssr: true });
const GolfCourses = dynamic(() => import('@/components/sections/GolfCourses').then((m) => ({ default: m.GolfCourses })), { ssr: true });
const Accommodation = dynamic(() => import('@/components/sections/Accommodation').then((m) => ({ default: m.Accommodation })), { ssr: true });
const Transfers = dynamic(() => import('@/components/sections/Transfers').then((m) => ({ default: m.Transfers })), { ssr: true });
const HowItWorks = dynamic(() => import('@/components/sections/HowItWorks').then((m) => ({ default: m.HowItWorks })), { ssr: true });
const Testimonials = dynamic(() => import('@/components/sections/Testimonials').then((m) => ({ default: m.Testimonials })), { ssr: true });
const Newsletter = dynamic(() => import('@/components/sections/Newsletter').then((m) => ({ default: m.Newsletter })), { ssr: true });
const ContactSection = dynamic(() => import('@/components/sections/ContactSection').then((m) => ({ default: m.ContactSection })), { ssr: true });

export default function HomePage() {
  return (
    <>
      <Hero />
      <GolfPackages />
      <RepeatHeadline />
      <Statement />
      <GolfCourses />
      <Accommodation />
      <Transfers />
      <HowItWorks />
      <Testimonials />
      <Newsletter />
      <ContactSection />
    </>
  );
}
