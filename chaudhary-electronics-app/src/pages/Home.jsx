import { useState, useCallback } from 'react';
import Hero from '../components/home/Hero';
import Marquee from '../components/home/Marquee';
import Services from '../components/home/Services';
import WorkGallery from '../components/home/WorkGallery';
import SolarPlanner from '../components/home/SolarPlanner';
import MarketplaceTeaser from '../components/home/MarketplaceTeaser';
import Process from '../components/home/Process';
import Certifications from '../components/home/Certifications';
import ClientLogos from '../components/home/ClientLogos';
import GoogleReviews from '../components/home/GoogleReviews';
import FinancingSection from '../components/home/FinancingSection';
import FAQSection from '../components/home/FAQSection';
import Testimonials from '../components/home/Testimonials';
import QuoteForm from '../components/home/QuoteForm';

export default function Home() {
  const [plannerSummary, setPlannerSummary] = useState(null);

  const carryToQuote = useCallback((summary) => {
    setPlannerSummary(summary);
    setTimeout(() => {
      document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }, []);

  return (
    <>
      <Hero />
      <Marquee />
      <ClientLogos />
      <Services />
      <WorkGallery />
      <SolarPlanner onCarryToQuote={carryToQuote} />
      <MarketplaceTeaser />
      <Certifications />
      <Process />
      <Testimonials />
      <GoogleReviews />
      <FinancingSection />
      <FAQSection />
      <QuoteForm plannerSummary={plannerSummary} />
    </>
  );
}
