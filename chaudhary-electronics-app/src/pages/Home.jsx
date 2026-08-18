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
import StorefrontHero from '../components/home/StorefrontHero';
import ShopByCategory from '../components/home/ShopByCategory';
import FeaturedProducts from '../components/home/FeaturedProducts';
import BestSellers from '../components/home/BestSellers';
import TrustFeatures from '../components/home/TrustFeatures';
import { useIsDesktop } from '../hooks/useIsDesktop';

export default function Home() {
  const [plannerSummary, setPlannerSummary] = useState(null);
  const isDesktop = useIsDesktop(1024);

  const carryToQuote = useCallback((summary) => {
    setPlannerSummary(summary);
    setTimeout(() => {
      document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }, []);

  // Below `lg`, Home leads with a purpose-built storefront (hero/search, categories,
  // featured products, deals) instead of resizing the desktop services page down — the
  // two trees are mounted exclusively (never both at once) so anchor ids shared between
  // them (#top, #products) never collide; see useIsDesktop and each component's own
  // comment for why. The services content (planner, quote form, testimonials, etc.)
  // still follows below it, unchanged, on mobile too.
  return (
    <>
      {isDesktop ? (
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
        </>
      ) : (
        <>
          <StorefrontHero />
          <ShopByCategory />
          <FeaturedProducts />
          <BestSellers />
          <TrustFeatures />
          <Marquee />
          <ClientLogos />
          <Services />
          <WorkGallery />
          <SolarPlanner onCarryToQuote={carryToQuote} />
          <Certifications />
          <Process />
          <Testimonials />
          <GoogleReviews />
          <FinancingSection />
          <FAQSection />
        </>
      )}
      <QuoteForm plannerSummary={plannerSummary} />
    </>
  );
}
