import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AICritique from './components/AICritique';
import TrustBar from './components/TrustBar';
import Services from './components/Services';
import WhyAWC from './components/WhyAWC';
import CaseStudies from './components/CaseStudies';
import Testimonials from './components/Testimonials';
import ConversionSection from './components/ConversionSection';
import Footer from './components/Footer';
import MobileStickyBar from './components/MobileStickyBar';
import ParallaxDivider from './components/ParallaxDivider';

export default function App() {
  return (
    <div className="min-h-screen selection:bg-brand-primary selection:text-black bg-brand-dark overflow-x-hidden">
      <Navbar />
      <main className="pb-16 md:pb-0">
        <Hero />
        <AICritique />
        <TrustBar />
        <ParallaxDivider variant="dots" />
        <Services />
        <ParallaxDivider variant="lines" />
        <WhyAWC />
        <ParallaxDivider variant="grid" />
        <CaseStudies />
        <Testimonials />
        <ParallaxDivider variant="dots" />
        <ConversionSection />
      </main>
      <Footer />
      <MobileStickyBar />
    </div>
  );
}
