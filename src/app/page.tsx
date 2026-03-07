import { Hero } from '@/components/sections/Hero';
import { GolfPackages } from '@/components/sections/GolfPackages';
import { RepeatHeadline } from '@/components/sections/RepeatHeadline';
import { Statement } from '@/components/sections/Statement';
import { GolfCourses } from '@/components/sections/GolfCourses';
import { Accommodation } from '@/components/sections/Accommodation';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Testimonials } from '@/components/sections/Testimonials';
import { Newsletter } from '@/components/sections/Newsletter';
import { ContactSection } from '@/components/sections/ContactSection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <GolfPackages />
      <RepeatHeadline />
      <Statement />
      <GolfCourses />
      <Accommodation />
      <HowItWorks />
      <Testimonials />
      <Newsletter />
      <ContactSection />
    </>
  );
}
