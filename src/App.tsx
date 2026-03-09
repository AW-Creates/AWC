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

function SectionDivider() {
  return (
    <div className="container mx-auto px-6">
      <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen selection:bg-brand-primary selection:text-black bg-brand-dark overflow-x-hidden">
      <Navbar />
      <main className="pb-16 md:pb-0">
        <Hero />

        <AICritique />

        <TrustBar />

        <SectionDivider />
        <ParallaxDivider variant="dots" />

        {/* Elevated section — slightly lighter bg */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/[0.008] pointer-events-none" />
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] bg-brand-primary/3 blur-[200px] rounded-full pointer-events-none" />
          <Services />
        </div>

        <SectionDivider />
        <ParallaxDivider variant="lines" />

        {/* Ambient glow section */}
        <div className="relative">
          <div className="absolute top-[30%] right-[10%] w-[600px] h-[400px] bg-brand-primary/4 blur-[180px] rounded-full pointer-events-none" />
          <WhyAWC />
        </div>

        <SectionDivider />
        <ParallaxDivider variant="grid" />

        {/* Darker recessed section for case studies */}
        <div className="relative">
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
          <div className="absolute top-0 left-[20%] w-[400px] h-[300px] bg-brand-primary/3 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-[15%] w-[500px] h-[400px] bg-blue-500/2 blur-[200px] rounded-full pointer-events-none" />
          <CaseStudies />
        </div>

        <SectionDivider />

        {/* Elevated testimonials */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/[0.01] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary/5 blur-[200px] rounded-full pointer-events-none" />
          <Testimonials />
        </div>

        <SectionDivider />
        <ParallaxDivider variant="dots" />

        <ConversionSection />
      </main>
      <Footer />
      <MobileStickyBar />
    </div>
  );
}
