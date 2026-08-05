import { useState, useCallback } from 'react';
import Navbar from '../components/layout/Navbar';
import MobileCtaBar from '../components/layout/MobileCtaBar';
import WhatsAppFloatButton from '../components/layout/WhatsAppFloatButton';
import Footer from '../components/layout/Footer';
import Hero from '../components/home/Hero';
import Marquee from '../components/home/Marquee';
import Services from '../components/home/Services';
import WorkGallery from '../components/home/WorkGallery';
import SolarPlanner from '../components/home/SolarPlanner';
import MarketplaceSection from '../components/marketplace/MarketplaceSection';
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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[1300] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-[14.5px] focus:font-semibold focus:text-paper focus:shadow-[0_12px_28px_-8px_rgba(23,21,15,0.55)]"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="animate-ce-page-in">
        <Hero />
        <Marquee />
        <ClientLogos />
        <Services />
        <WorkGallery />
        <SolarPlanner onCarryToQuote={carryToQuote} />
        <MarketplaceSection />
        <Certifications />
        <Process />
        <Testimonials />
        <GoogleReviews />
        <FinancingSection />
        <FAQSection />
        <QuoteForm plannerSummary={plannerSummary} />
      </main>
      <Footer />
      <MobileCtaBar />
      <WhatsAppFloatButton />
    </>
  );
}
